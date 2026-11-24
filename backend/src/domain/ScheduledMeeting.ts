export class ScheduledMeeting {
  constructor(
    public readonly id: string,
    public readonly meetingId: string,
    public readonly meetingName: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly roomId: string,
    public readonly roomLocation: string,
    public readonly assignmentId: string,
    public readonly attendees: string[]
  ) {}
}
