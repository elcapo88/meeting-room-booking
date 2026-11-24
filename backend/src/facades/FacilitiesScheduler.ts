import { RoomPool } from "../domain/RoomPool";
import { ScheduledMeeting } from "../domain/ScheduledMeeting";
import { StorageService } from "../services/StorageService";
import { NotificationService } from "../services/NotificationService";

/**
 * FacilitiesScheduler Facade (MeetSol.PDF)
 * Handles reserving rooms, scheduling meeting instances, and cancellations.
 */
export class FacilitiesScheduler {
  private storage = StorageService.getInstance();
  private roomPool = RoomPool.getInstance();
  private notifications = NotificationService.getInstance();

  /**
   * Schedule an existing meeting for a specific time interval.
   * Finds the smallest available room fitting all attendees.
   */
  public scheduleMeeting(
    meetingName: string,
    startTime: Date,
    endTime: Date
  ): ScheduledMeeting {
    const meeting = this.storage.getMeetingByName(meetingName);
    if (!meeting) {
      throw new Error(`Meeting '${meetingName}' not found. Define it first.`);
    }

    const attendees = meeting.getAttendees();
    const requiredSize = Math.max(attendees.length, 1);

    // Capacity-Optimal Room Allocation (MeetSol)
    const { room, assignment } = this.roomPool.scheduleRoom(
      requiredSize,
      startTime,
      endTime,
      meeting.id,
      meeting.name
    );

    const scheduledId = `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const scheduledMeeting = new ScheduledMeeting(
      scheduledId,
      meeting.id,
      meeting.name,
      startTime,
      endTime,
      room.id,
      room.location,
      assignment.id,
      attendees
    );

    this.storage.saveScheduledMeeting(scheduledMeeting);
    meeting.addScheduledInstance(scheduledId);

    // Notify attendees (MeetSol)
    this.notifications.notifyMeetingScheduled(
      attendees,
      meeting.name,
      room.location,
      startTime,
      endTime
    );

    return scheduledMeeting;
  }

  /**
   * Direct room reservation for a given size and interval without a pre-defined meeting.
   */
  public scheduleRoom(
    size: number,
    startTime: Date,
    endTime: Date,
    purpose = "Direct Room Reservation"
  ) {
    const { room, assignment } = this.roomPool.scheduleRoom(
      size,
      startTime,
      endTime,
      undefined,
      purpose
    );

    return {
      roomId: room.id,
      roomLocation: room.location,
      capacity: room.capacity,
      assignmentId: assignment.id,
      startTime: assignment.startTime,
      endTime: assignment.endTime,
      purpose,
    };
  }

  /**
   * Cancel a scheduled meeting before it begins.
   * Releases room and informs attendees.
   */
  public cancelMeeting(scheduledMeetingId: string): void {
    const scheduled = this.storage.getScheduledMeeting(scheduledMeetingId);
    if (!scheduled) {
      throw new Error(`Scheduled meeting '${scheduledMeetingId}' not found.`);
    }

    const now = new Date();
    if (now >= scheduled.startTime) {
      throw new Error("Cannot cancel a meeting that has already started or passed.");
    }

    // Release room
    this.roomPool.releaseRoom(scheduled.roomLocation, scheduled.assignmentId);

    // Update meeting definition
    const meeting = this.storage.getMeetingById(scheduled.meetingId);
    if (meeting) {
      meeting.removeScheduledInstance(scheduledMeetingId);
    }

    // Delete record
    this.storage.deleteScheduledMeeting(scheduledMeetingId);

    // Notify attendees
    this.notifications.notifyMeetingCanceled(
      scheduled.attendees,
      scheduled.meetingName,
      scheduled.startTime
    );
  }

  /**
   * Cancel a standalone room assignment.
   */
  public cancelRoomAssignment(roomLocation: string, assignmentId: string): boolean {
    return this.roomPool.releaseRoom(roomLocation, assignmentId);
  }

  public getAllScheduledMeetings(): ScheduledMeeting[] {
    return this.storage.getAllScheduledMeetings();
  }
}
