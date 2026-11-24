import { RoomAssignment } from "./RoomAssignment";

export class Room {
  private assignments: RoomAssignment[] = [];

  constructor(
    public readonly id: string,
    public readonly location: string, // Room identifier/number, e.g. "Room 312"
    public readonly capacity: number  // Maximum attendee capacity
  ) {}

  public getAssignments(): readonly RoomAssignment[] {
    return [...this.assignments].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
  }

  /**
   * Check if room is free for the entire duration [start, end)
   */
  public isAvailable(start: Date, end: Date): boolean {
    return !this.assignments.some((assignment) => assignment.overlaps(start, end));
  }

  /**
   * Reserve this room for the given interval.
   */
  public schedule(
    start: Date,
    end: Date,
    meetingId?: string,
    meetingName?: string
  ): RoomAssignment {
    if (!this.isAvailable(start, end)) {
      throw new Error(
        `Room ${this.location} is already booked during ${start.toISOString()} - ${end.toISOString()}`
      );
    }

    const assignmentId = `assign_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const assignment = new RoomAssignment(
      assignmentId,
      this.id,
      this.location,
      start,
      end,
      meetingId,
      meetingName
    );

    this.assignments.push(assignment);
    return assignment;
  }

  /**
   * Release a scheduled assignment by ID or matching interval.
   */
  public release(assignmentId: string): boolean {
    const initialLen = this.assignments.length;
    this.assignments = this.assignments.filter((a) => a.id !== assignmentId);
    return this.assignments.length < initialLen;
  }

  public releaseInterval(start: Date, end: Date): boolean {
    const initialLen = this.assignments.length;
    this.assignments = this.assignments.filter(
      (a) => a.startTime.getTime() !== start.getTime() || a.endTime.getTime() !== end.getTime()
    );
    return this.assignments.length < initialLen;
  }
}
