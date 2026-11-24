import { Meeting } from "../domain/Meeting";
import { RoomPool } from "../domain/RoomPool";
import { StorageService } from "../services/StorageService";
import { NotificationService } from "../services/NotificationService";

/**
 * MeetingAdministration Facade (MeetSol.PDF)
 * Handles meeting definitions and attendee rosters with cascade cancellation logic.
 */
export class MeetingAdministration {
  private storage = StorageService.getInstance();
  private roomPool = RoomPool.getInstance();
  private notifications = NotificationService.getInstance();

  /**
   * Define a new meeting with unique name and initial attendees.
   */
  public defineMeeting(name: string, attendees: string[] = []): Meeting {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Meeting name cannot be empty");

    if (this.storage.getMeetingByName(trimmed)) {
      throw new Error(`A meeting named '${trimmed}' already exists.`);
    }

    const id = `meet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const meeting = new Meeting(id, trimmed, attendees);
    this.storage.saveMeeting(meeting);
    return meeting;
  }

  /**
   * Add attendee to meeting. If future scheduled meetings exist, inform the attendee.
   */
  public addAttendee(meetingName: string, employeeId: string): void {
    const meeting = this.storage.getMeetingByName(meetingName);
    if (!meeting) {
      throw new Error(`Meeting '${meetingName}' not found.`);
    }

    const added = meeting.addAttendee(employeeId);
    if (!added) {
      throw new Error(`Attendee '${employeeId}' is already in '${meetingName}'.`);
    }

    // Inform attendee of any future scheduled instances (MeetSol rule)
    const now = new Date();
    for (const instanceId of meeting.getScheduledInstances()) {
      const scheduled = this.storage.getScheduledMeeting(instanceId);
      if (scheduled && scheduled.startTime > now) {
        this.notifications.notifyMeetingScheduled(
          [employeeId],
          meeting.name,
          scheduled.roomLocation,
          scheduled.startTime,
          scheduled.endTime
        );
      }
    }
  }

  /**
   * Remove attendee from meeting.
   * If attendee list becomes empty, automatically cancel all future scheduled instances
   * and release their rooms (MeetSol cascade rule).
   */
  public removeAttendee(meetingName: string, employeeId: string): { canceledInstancesCount: number } {
    const meeting = this.storage.getMeetingByName(meetingName);
    if (!meeting) {
      throw new Error(`Meeting '${meetingName}' not found.`);
    }

    const { removed, isEmpty } = meeting.removeAttendee(employeeId);
    if (!removed) {
      throw new Error(`Attendee '${employeeId}' was not found in '${meetingName}'.`);
    }

    this.notifications.notifyAttendeeRemoved(employeeId, meeting.name);

    let canceledCount = 0;
    if (isEmpty) {
      // Cascade cancellation: cancel all future scheduled instances
      const now = new Date();
      const instances = [...meeting.getScheduledInstances()];

      for (const instanceId of instances) {
        const scheduled = this.storage.getScheduledMeeting(instanceId);
        if (scheduled && scheduled.startTime > now) {
          // Release room
          this.roomPool.releaseRoom(scheduled.roomLocation, scheduled.assignmentId);
          // Remove from storage
          this.storage.deleteScheduledMeeting(instanceId);
          meeting.removeScheduledInstance(instanceId);
          canceledCount++;
        }
      }
    }

    return { canceledInstancesCount: canceledCount };
  }

  /**
   * Remove an entire meeting definition.
   * Automatically cancels all future scheduled instances and releases rooms (MeetSol cascade rule).
   */
  public removeMeeting(meetingName: string): { canceledInstancesCount: number } {
    const meeting = this.storage.getMeetingByName(meetingName);
    if (!meeting) {
      throw new Error(`Meeting '${meetingName}' not found.`);
    }

    const now = new Date();
    let canceledCount = 0;

    for (const instanceId of meeting.getScheduledInstances()) {
      const scheduled = this.storage.getScheduledMeeting(instanceId);
      if (scheduled && scheduled.startTime > now) {
        this.roomPool.releaseRoom(scheduled.roomLocation, scheduled.assignmentId);
        this.storage.deleteScheduledMeeting(instanceId);
        this.notifications.notifyMeetingCanceled(
          scheduled.attendees,
          scheduled.meetingName,
          scheduled.startTime
        );
        canceledCount++;
      }
    }

    this.storage.deleteMeeting(meetingName);
    return { canceledInstancesCount: canceledCount };
  }

  public getAllMeetings(): Meeting[] {
    return this.storage.getAllMeetings();
  }
}
