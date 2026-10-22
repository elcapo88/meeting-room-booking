"""Meeting and ScheduledMeeting domain entities."""

from datetime import datetime
from typing import List, Optional
from meeting_room_booking.domain.room import Room, RoomPool
from meeting_room_booking.external.post_office import PostOffice
from meeting_room_booking.external.employee_management import EmployeeManagement
from meeting_room_booking.domain.exceptions import AttendeeNotFoundError

class ScheduledMeeting:
    """Represents a specific scheduled occurrence of a meeting."""
    def __init__(self, meeting_name: str, start_time: datetime, end_time: datetime, room: Room, attendees: List[str]):
        self.meeting_name = meeting_name
        self.start_time = start_time
        self.end_time = end_time
        self.room = room
        self.attendees = list(attendees)

    def notify_attendee_scheduled(self, employee_id: str) -> None:
        emp = EmployeeManagement.instance().employee(employee_id)
        msg = f"Invitation: Meeting '{self.meeting_name}' scheduled from {self.start_time} to {self.end_time} in Room {self.room.location}."
        PostOffice.instance().deliverMessage(emp.address(), msg)

    def notify_attendee_canceled(self, employee_id: str) -> None:
        emp = EmployeeManagement.instance().employee(employee_id)
        msg = f"Cancellation: Meeting '{self.meeting_name}' scheduled from {self.start_time} to {self.end_time} in Room {self.room.location} has been canceled."
        PostOffice.instance().deliverMessage(emp.address(), msg)

    def addAttendee(self, employee_id: str) -> None:
        if employee_id not in self.attendees:
            self.attendees.append(employee_id)
            self.notify_attendee_scheduled(employee_id)

    def removeAttendee(self, employee_id: str) -> None:
        if employee_id in self.attendees:
            self.attendees.remove(employee_id)
            self.notify_attendee_canceled(employee_id)

    def cancel(self) -> None:
        """Releases assigned room and informs all attendees of cancellation."""
        self.room.release(self.start_time, self.end_time)
        for emp_id in list(self.attendees):
            self.notify_attendee_canceled(emp_id)


class Meeting:
    """Represents a meeting definition with name, attendee list, and scheduled instances."""
    def __init__(self, name: str, attendees: List[str]):
        self.name = name
        self.attendees = list(attendees)
        self.scheduled_meetings: List[ScheduledMeeting] = []

    def addAttendee(self, employee_id: str) -> None:
        if employee_id not in self.attendees:
            self.attendees.append(employee_id)
            # Inform attendee of any future scheduled instances
            now = datetime.now()
            for sm in self.scheduled_meetings:
                if sm.start_time >= now:
                    sm.addAttendee(employee_id)

    def removeAttendee(self, employee_id: str) -> None:
        if employee_id not in self.attendees:
            raise AttendeeNotFoundError(f"Attendee '{employee_id}' is not in meeting '{self.name}'.")
        self.attendees.remove(employee_id)

        now = datetime.now()
        future_scheduled = [sm for sm in self.scheduled_meetings if sm.start_time >= now]

        for sm in future_scheduled:
            sm.removeAttendee(employee_id)

        # Postcondition: If attendee list becomes empty, cancel all future scheduled instances
        if len(self.attendees) == 0:
            for sm in list(future_scheduled):
                sm.cancel()
                self.scheduled_meetings.remove(sm)

    def schedule(self, start_time: datetime, end_time: datetime) -> int:
        """Schedules meeting for given time period. Returns assigned room number."""
        room_pool = RoomPool.instance()
        capacity_needed = len(self.attendees)
        room_number = room_pool.scheduleRoom(capacity_needed, start_time, end_time)
        assigned_room = room_pool.room(room_number)

        scheduled_inst = ScheduledMeeting(
            meeting_name=self.name,
            start_time=start_time,
            end_time=end_time,
            room=assigned_room,
            attendees=self.attendees
        )
        self.scheduled_meetings.append(scheduled_inst)
        self.scheduled_meetings.sort(key=lambda sm: sm.start_time)

        # Inform all attendees
        for emp_id in self.attendees:
            scheduled_inst.notify_attendee_scheduled(emp_id)

        return room_number

    def cancel(self, start_time: Optional[datetime] = None) -> None:
        """Cancels a specific scheduled instance if start_time is given, else cancels all instances."""
        if start_time is not None:
            target = None
            for sm in self.scheduled_meetings:
                if sm.start_time == start_time:
                    target = sm
                    break
            if target:
                target.cancel()
                self.scheduled_meetings.remove(target)
        else:
            for sm in list(self.scheduled_meetings):
                sm.cancel()
                self.scheduled_meetings.remove(sm)
