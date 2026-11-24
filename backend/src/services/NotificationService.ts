export interface NotificationLog {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  sentAt: Date;
}

/**
 * PostOffice implementation from MeetSol.PDF.
 * Dispatches and logs meeting invitations, updates, and cancellations.
 */
export class NotificationService {
  private static instance: NotificationService | null = null;
  private logs: NotificationLog[] = [];

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public deliverMessage(recipient: string, subject: string, message: string): void {
    const logEntry: NotificationLog = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recipient,
      subject,
      message,
      sentAt: new Date(),
    };
    this.logs.unshift(logEntry);
    console.log(`[POST OFFICE] To: ${recipient} | Subject: "${subject}" | Content: ${message}`);
  }

  public notifyMeetingScheduled(
    attendees: string[],
    meetingName: string,
    roomLocation: string,
    startTime: Date,
    endTime: Date
  ): void {
    const timeStr = `${startTime.toLocaleString()} to ${endTime.toLocaleTimeString()}`;
    const subject = `Invitation: ${meetingName}`;
    const body = `You are scheduled for '${meetingName}' in ${roomLocation} from ${timeStr}.`;

    for (const attendee of attendees) {
      this.deliverMessage(attendee, subject, body);
    }
  }

  public notifyMeetingCanceled(
    attendees: string[],
    meetingName: string,
    startTime: Date
  ): void {
    const subject = `CANCELED: ${meetingName}`;
    const body = `The meeting '${meetingName}' scheduled for ${startTime.toLocaleString()} has been canceled and the room has been released.`;

    for (const attendee of attendees) {
      this.deliverMessage(attendee, subject, body);
    }
  }

  public notifyAttendeeRemoved(
    attendee: string,
    meetingName: string
  ): void {
    const subject = `Update: Removed from ${meetingName}`;
    const body = `You have been removed as an attendee from meeting '${meetingName}'.`;
    this.deliverMessage(attendee, subject, body);
  }

  public getRecentNotifications(limit = 20): NotificationLog[] {
    return this.logs.slice(0, limit);
  }
}
