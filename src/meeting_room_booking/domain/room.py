"""Room, RoomAssignment, and RoomPool classes."""

from datetime import datetime
from typing import List
from meeting_room_booking.domain.exceptions import RoomUnavailableError

class RoomAssignment:
    """Models scheduling of a Room for a particular temporal interval [start_time, end_time)."""
    def __init__(self, start_time: datetime, end_time: datetime):
        if start_time >= end_time:
            raise ValueError("start_time must be strictly earlier than end_time.")
        self.start_time = start_time
        self.end_time = end_time

    def overlaps(self, start_time: datetime, end_time: datetime) -> bool:
        """Half-open interval overlap check: [s1, e1) overlaps [s2, e2) iff max(s1, s2) < min(e1, e2)."""
        return max(self.start_time, start_time) < min(self.end_time, end_time)

    def __repr__(self) -> str:
        return f"RoomAssignment({self.start_time} to {self.end_time})"


class Room:
    """Models a physical meeting room with capacity and location number."""
    def __init__(self, location: int, capacity: int):
        self.location = location  # Room number
        self.capacity = capacity
        self.assignments: List[RoomAssignment] = []

    def is_available(self, start_time: datetime, end_time: datetime) -> bool:
        return not any(assignment.overlaps(start_time, end_time) for assignment in self.assignments)

    def schedule(self, start_time: datetime, end_time: datetime) -> bool:
        """Schedules room if available during given time period."""
        if self.is_available(start_time, end_time):
            assignment = RoomAssignment(start_time, end_time)
            self.assignments.append(assignment)
            self.assignments.sort(key=lambda a: a.start_time)
            return True
        return False

    def release(self, start_time: datetime, end_time: datetime) -> bool:
        """Releases room assignment matching given time period."""
        for assignment in list(self.assignments):
            if assignment.start_time == start_time and assignment.end_time == end_time:
                self.assignments.remove(assignment)
                return True
        return False

    def __repr__(self) -> str:
        return f"Room(location={self.location}, capacity={self.capacity})"


class RoomPool:
    """Singleton Room Pool managing room instances ordered by size."""
    _instance = None

    def __init__(self):
        self._rooms: List[Room] = []

    @classmethod
    def instance(cls) -> "RoomPool":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        cls._instance = None

    def add_room(self, room: Room) -> None:
        """Adds a room and maintains order by capacity ascending."""
        self._rooms.append(room)
        self._rooms.sort(key=lambda r: r.capacity)

    def room(self, room_number: int) -> Room:
        """Look up Room by room location number."""
        for r in self._rooms:
            if r.location == room_number:
                return r
        raise RoomUnavailableError(f"Room number {room_number} does not exist in pool.")

    def scheduleRoom(self, size: int, start_time: datetime, end_time: datetime) -> int:
        """Schedules the smallest available room with capacity >= size. Returns room number."""
        for r in self._rooms:
            if r.capacity >= size:
                if r.schedule(start_time, end_time):
                    return r.location
        raise RoomUnavailableError(f"No available room for size {size} between {start_time} and {end_time}.")

    def releaseRoom(self, room_number: int, start_time: datetime, end_time: datetime) -> bool:
        """Releases assignment for specified room number."""
        r = self.room(room_number)
        return r.release(start_time, end_time)
