# Meeting Room Booking System

An elegant, object-oriented Python implementation of the Meeting Room Booking Problem based on the architectural design specifications published by Objective Engineering, Inc. (Oeng / Charles Richter) in MeetSol.PDF.

## Architecture and Design Patterns

The architecture faithfully implements the Object-Oriented Analysis and Design (OOAD) models specified in the Oeng paper:

- Facade Pattern:
  - MeetingAdministration: API for defining meetings, adding/removing attendees, and deleting meeting definitions.
  - FacilitiesScheduler: API for scheduling rooms, scheduling pre-defined meetings, releasing rooms, and canceling meetings.
- Singleton Pattern:
  - RoomPool: Manages physical meeting rooms organized by capacity and handles conflict-free interval scheduling.
  - PostOffice: Handles electronic message delivery to attendees upon meeting creation or cancellation.
  - EmployeeManagement: External component adapter providing access to employee details and email addresses.
- Domain Model:
  - Meeting & ScheduledMeeting: Manages meeting definitions and temporal instances [start, end).
  - Room & RoomAssignment: Tracks room location, capacity, and interval allocations.

## Key Features

1. Capacity-Optimal Room Allocation: Automatically selects the smallest available room capable of accommodating all attendees.
2. Interval Conflict Prevention: Ensures no overlapping time slots using half-open temporal intervals [start_time, end_time).
3. Automated Notification System: Automatically triggers electronic mail invitations and retractions via PostOffice when meetings are scheduled or canceled.
4. Cascading Event Business Rules:
   - Adding an attendee to a meeting definition automatically sends invitations for future scheduled occurrences.
   - Removing the last attendee automatically cancels all future scheduled occurrences and releases assigned rooms.
   - Deleting a meeting definition automatically cancels all scheduled instances.

## Repository Structure

meeting-room-booking/
├── .gitignore
├── LICENSE
├── README.md
├── requirements.txt
├── setup.py
├── src/
│   └── meeting_room_booking/
│       ├── __init__.py
│       ├── domain/
│       │   ├── __init__.py
│       │   ├── exceptions.py
│       │   ├── meeting.py
│       │   └── room.py
│       ├── facades/
│       │   ├── __init__.py
│       │   ├── administration.py
│       │   └── scheduler.py
│       └── external/
│           ├── __init__.py
│           ├── employee_management.py
│           └── post_office.py
└── tests/
    └── test_meeting_room_booking.py

## Running Unit Tests

Run the test suite using Python's built-in unittest runner:

PYTHONPATH=src python3 -m unittest discover -s tests
