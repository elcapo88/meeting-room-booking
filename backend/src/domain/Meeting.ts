export class Meeting {
  private attendees: Set<string> = new Set();
  private scheduledInstances: Set<string> = new Set();

  constructor(
    public readonly id: string,
    public name: string,
    initialAttendees: string[] = []
  ) {
    initialAttendees.forEach((att) => this.attendees.add(att));
  }

  public getAttendees(): string[] {
    return Array.from(this.attendees);
  }

  public addAttendee(employeeId: string): boolean {
    if (this.attendees.has(employeeId)) return false;
    this.attendees.add(employeeId);
    return true;
  }

  /**
   * Remove attendee. Returns true if removed.
   * If attendees become empty, caller can trigger cascade cancellations (MeetSol rule).
   */
  public removeAttendee(employeeId: string): { removed: boolean; isEmpty: boolean } {
    const removed = this.attendees.delete(employeeId);
    return {
      removed,
      isEmpty: this.attendees.size === 0,
    };
  }

  public addScheduledInstance(scheduledMeetingId: string): void {
    this.scheduledInstances.add(scheduledMeetingId);
  }

  public removeScheduledInstance(scheduledMeetingId: string): void {
    this.scheduledInstances.delete(scheduledMeetingId);
  }

  public getScheduledInstances(): string[] {
    return Array.from(this.scheduledInstances);
  }
}
