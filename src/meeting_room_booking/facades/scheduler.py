"""FacilitiesScheduler facade class."""

from datetime import datetime
from meeting_room_booking.domain.room import RoomPool
from meeting_room_booking.facades.administration import MeetingAdministration

class FacilitiesScheduler:
    """Facade for scheduling and canceling meetings and room reservations."""
    _instance = None

    @classmethod
    def instance(cls) -> "FacilitiesScheduler":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        cls._instance = None

    def scheduleRoom(self, size: int, start_time: datetime, end_time: datetime) -> int:
        """Schedules smallest room >= size for period [start_time, end_time). Returns room number."""
        return RoomPool.instance().scheduleRoom(size, start_time, end_time)

    def releaseRoom(self, room_number: int, start_time: datetime, end_time: datetime) -> bool:
        """Releases room reservation."""
        return RoomPool.instance().releaseRoom(room_number, start_time, end_time)

    def scheduleMeeting(self, name: str, start_time: datetime, end_time: datetime) -> int:
        """Schedules pre-defined meeting for period [start_time, end_time). Returns room number."""
        meeting = MeetingAdministration.instance().meeting(name)
        return meeting.schedule(start_time, end_time)

    def cancelMeeting(self, name: str, start_time: datetime) -> None:
        """Cancels scheduled instance starting at start_time."""
        meeting = MeetingAdministration.instance().meeting(name)
        meeting.cancel(start_time)
