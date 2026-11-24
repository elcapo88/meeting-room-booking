import { Room } from "./Room";
import { RoomAssignment } from "./RoomAssignment";

/**
 * Singleton RoomPool managing room collection ordered by capacity (MeetSol.PDF specification).
 * Allocates the smallest available room fitting the requested capacity.
 */
export class RoomPool {
  private static instance: RoomPool | null = null;
  private rooms: Room[] = [];

  private constructor() {
    this.seedDefaultRooms();
  }

  public static getInstance(): RoomPool {
    if (!RoomPool.instance) {
      RoomPool.instance = new RoomPool();
    }
    return RoomPool.instance;
  }

  public registerRoom(location: string, capacity: number): Room {
    const id = `room_${location.replace(/\s+/g, "_").toLowerCase()}`;
    const existing = this.rooms.find((r) => r.location.toLowerCase() === location.toLowerCase());
    if (existing) {
      throw new Error(`Room with location '${location}' already exists`);
    }

    const newRoom = new Room(id, location, capacity);
    this.rooms.push(newRoom);
    // Keep rooms sorted by capacity ascending
    this.rooms.sort((a, b) => a.capacity - b.capacity);
    return newRoom;
  }

  public getRooms(): readonly Room[] {
    return [...this.rooms];
  }

  public getRoomByLocation(location: string): Room | undefined {
    return this.rooms.find((r) => r.location.toLowerCase() === location.toLowerCase());
  }

  public getRoomById(id: string): Room | undefined {
    return this.rooms.find((r) => r.id === id);
  }

  /**
   * Capacity-Optimal Allocation:
   * Finds the SMALLEST room with capacity >= size that is available during [start, end)
   */
  public scheduleRoom(
    size: number,
    start: Date,
    end: Date,
    meetingId?: string,
    meetingName?: string
  ): { room: Room; assignment: RoomAssignment } {
    // Rooms are already sorted in ascending order of capacity
    const eligibleRooms = this.rooms.filter((room) => room.capacity >= size);

    if (eligibleRooms.length === 0) {
      throw new Error(`No room in the facility has a capacity of at least ${size} people.`);
    }

    for (const room of eligibleRooms) {
      if (room.isAvailable(start, end)) {
        const assignment = room.schedule(start, end, meetingId, meetingName);
        return { room, assignment };
      }
    }

    throw new Error(
      `No available room with capacity >= ${size} between ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} and ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`
    );
  }

  /**
   * Release a room by room location and time interval or assignmentId
   */
  public releaseRoom(roomLocation: string, assignmentId: string): boolean {
    const room = this.getRoomByLocation(roomLocation);
    if (!room) return false;
    return room.release(assignmentId);
  }

  private seedDefaultRooms() {
    // Seed standard conference rooms
    this.registerRoom("Huddle Room 101", 4);
    this.registerRoom("Meeting Room 204", 8);
    this.registerRoom("Conference Room 312", 12);
    this.registerRoom("Boardroom 604", 25);
    this.registerRoom("Auditorium Hall", 60);
  }
}
