"""MeetingAdministration facade class."""

from typing import Dict, List
from meeting_room_booking.domain.meeting import Meeting
from meeting_room_booking.domain.exceptions import MeetingAlreadyExistsError, MeetingNotFoundError

class MeetingAdministration:
    """Facade for meeting definition management (Define, Add Attendee, Remove Attendee, Remove Meeting)."""
    _instance = None

    def __init__(self):
        self._meetings: Dict[str, Meeting] = {}

    @classmethod
    def instance(cls) -> "MeetingAdministration":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        cls._instance = None

    def defineMeeting(self, name: str, attendees: List[str]) -> Meeting:
        """Defines a new meeting with attendee list."""
        if name in self._meetings:
            raise MeetingAlreadyExistsError(f"Meeting with name '{name}' already exists.")
        m = Meeting(name=name, attendees=attendees)
        self._meetings[name] = m
        return m

    def addAttendee(self, meeting_name: str, employee_id: str) -> None:
        m = self.meeting(meeting_name)
        m.addAttendee(employee_id)

    def removeAttendee(self, meeting_name: str, employee_id: str) -> None:
        m = self.meeting(meeting_name)
        m.removeAttendee(employee_id)

    def removeMeeting(self, meeting_name: str) -> None:
        """Removes meeting definition and cancels all scheduled occurrences."""
        m = self.meeting(meeting_name)
        m.cancel()
        del self._meetings[meeting_name]

    def meeting(self, name: str) -> Meeting:
        if name not in self._meetings:
            raise MeetingNotFoundError(f"Meeting '{name}' not found.")
        return self._meetings[name]
