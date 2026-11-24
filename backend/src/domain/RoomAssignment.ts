export class RoomAssignment {
  constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly roomLocation: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly meetingId?: string,
    public readonly meetingName?: string
  ) {
    if (startTime >= endTime) {
      throw new Error("Start time must be before end time");
    }
  }

  /**
   * Check if this assignment conflicts with a requested interval.
   * Intervals overlap if: (StartA < EndB) and (EndA > StartB)
   */
  public overlaps(start: Date, end: Date): boolean {
    return this.startTime < end && this.endTime > start;
  }
}
