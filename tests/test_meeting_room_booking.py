import unittest
from datetime import datetime, timedelta

from meeting_room_booking.domain.room import Room, RoomPool, RoomAssignment
from meeting_room_booking.domain.meeting import Meeting
from meeting_room_booking.domain.exceptions import (
    RoomUnavailableError,
    MeetingAlreadyExistsError,
    MeetingNotFoundError,
    AttendeeNotFoundError
)
from meeting_room_booking.external.post_office import PostOffice, Address
from meeting_room_booking.external.employee_management import EmployeeManagement, Employee
from meeting_room_booking.facades.administration import MeetingAdministration
from meeting_room_booking.facades.scheduler import FacilitiesScheduler


class TestMeetingRoomBookingSystem(unittest.TestCase):

    def setUp(self):
        # Reset singletons before each test
        PostOffice.reset_instance()
        EmployeeManagement.reset_instance()
        RoomPool.reset_instance()
        MeetingAdministration.reset_instance()
        FacilitiesScheduler.reset_instance()

        # Register standard rooms in RoomPool (Capacity 10, 20, 50)
        self.room_pool = RoomPool.instance()
        self.room_pool.add_room(Room(location=101, capacity=10))
        self.room_pool.add_room(Room(location=201, capacity=20))
        self.room_pool.add_room(Room(location=501, capacity=50))

        # Register standard employees
        self.emp_mgmt = EmployeeManagement.instance()
        self.emp_mgmt.register_employee(Employee("E001", "Alice", "alice@company.com"))
        self.emp_mgmt.register_employee(Employee("E002", "Bob", "bob@company.com"))
        self.emp_mgmt.register_employee(Employee("E003", "Charlie", "charlie@company.com"))

        self.post_office = PostOffice.instance()
        self.admin = MeetingAdministration.instance()
        self.scheduler = FacilitiesScheduler.instance()

        self.t1 = datetime(2026, 11, 1, 10, 0)
        self.t2 = datetime(2026, 11, 1, 11, 0)
        self.t3 = datetime(2026, 11, 1, 12, 0)

    def test_room_assignment_overlap(self):
        assign = RoomAssignment(self.t1, self.t2)
        # Overlapping intervals
        self.assertTrue(assign.overlaps(self.t1, self.t2))
        self.assertTrue(assign.overlaps(self.t1 + timedelta(minutes=30), self.t2 + timedelta(minutes=30)))
        # Non-overlapping adjacent interval [11:00, 12:00)
        self.assertFalse(assign.overlaps(self.t2, self.t3))

    def test_schedule_room_smallest_available_capacity(self):
        # Request room for 15 people -> Should assign Room 201 (Cap 20), not 101 or 501
        room_num = self.scheduler.scheduleRoom(15, self.t1, self.t2)
        self.assertEqual(room_num, 201)

        # Request another room for 15 people at same time -> Room 201 is occupied, should assign Room 501 (Cap 50)
        room_num_2 = self.scheduler.scheduleRoom(15, self.t1, self.t2)
        self.assertEqual(room_num_2, 501)

    def test_schedule_and_release_room(self):
        room_num = self.scheduler.scheduleRoom(8, self.t1, self.t2)
        self.assertEqual(room_num, 101)  # Smallest capacity >= 8 is 10

        # Attempt to schedule same time slot should pick next room (201)
        room_num_2 = self.scheduler.scheduleRoom(8, self.t1, self.t2)
        self.assertEqual(room_num_2, 201)

        # Release Room 101
        released = self.scheduler.releaseRoom(101, self.t1, self.t2)
        self.assertTrue(released)

        # Now Room 101 should be available again
        room_num_3 = self.scheduler.scheduleRoom(8, self.t1, self.t2)
        self.assertEqual(room_num_3, 101)

    def test_define_and_schedule_meeting(self):
        # Define meeting "Project Sync" with 2 attendees
        self.admin.defineMeeting("Project Sync", ["E001", "E002"])
        
        # Schedule meeting
        room_num = self.scheduler.scheduleMeeting("Project Sync", self.t1, self.t2)
        self.assertEqual(room_num, 101)  # 2 attendees fit in Room 101

        # Check Post Office messages delivered to Alice and Bob
        outbox = self.post_office.outbox
        self.assertEqual(len(outbox), 2)
        recipients = [m.recipient.email for m in outbox]
        self.assertIn("alice@company.com", recipients)
        self.assertIn("bob@company.com", recipients)

    def test_add_attendee_to_future_scheduled_meeting(self):
        self.admin.defineMeeting("Tech Talk", ["E001"])
        room_num = self.scheduler.scheduleMeeting("Tech Talk", self.t1, self.t2)

        initial_msg_count = len(self.post_office.outbox)
        self.assertEqual(initial_msg_count, 1)

        # Add Bob to "Tech Talk"
        self.admin.addAttendee("Tech Talk", "E002")

        # Bob should receive an invitation message for the scheduled instance
        new_msg_count = len(self.post_office.outbox)
        self.assertEqual(new_msg_count, 2)
        self.assertEqual(self.post_office.outbox[-1].recipient.email, "bob@company.com")

    def test_cancel_meeting_releases_room_and_notifies(self):
        self.admin.defineMeeting("Board Meeting", ["E001", "E002"])
        room_num = self.scheduler.scheduleMeeting("Board Meeting", self.t1, self.t2)

        # Cancel meeting
        self.scheduler.cancelMeeting("Board Meeting", self.t1)

        # Room 101 should be released and available again for same slot
        new_room_num = self.scheduler.scheduleRoom(5, self.t1, self.t2)
        self.assertEqual(new_room_num, 101)

        # Check cancellation email sent
        cancellation_msgs = [m for m in self.post_office.outbox if "Cancellation:" in m.message]
        self.assertEqual(len(cancellation_msgs), 2)

    def test_remove_last_attendee_cancels_future_meetings(self):
        self.admin.defineMeeting("1-on-1", ["E001"])
        room_num = self.scheduler.scheduleMeeting("1-on-1", self.t1, self.t2)

        # Remove the only attendee
        self.admin.removeAttendee("1-on-1", "E001")

        # Future meeting should be automatically canceled and room released
        new_room_num = self.scheduler.scheduleRoom(5, self.t1, self.t2)
        self.assertEqual(new_room_num, 101)

    def test_remove_meeting_cancels_all_scheduled_instances(self):
        self.admin.defineMeeting("Weekly All Hands", ["E001", "E002", "E003"])
        self.scheduler.scheduleMeeting("Weekly All Hands", self.t1, self.t2)

        # Remove meeting definition
        self.admin.removeMeeting("Weekly All Hands")

        # Meeting should no longer exist
        with self.assertRaises(MeetingNotFoundError):
            self.admin.meeting("Weekly All Hands")

        # Room should be free
        new_room_num = self.scheduler.scheduleRoom(3, self.t1, self.t2)
        self.assertEqual(new_room_num, 101)


if __name__ == "__main__":
    unittest.main()
