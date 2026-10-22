"""Domain exception definitions."""

class MeetingBookingError(Exception):
    """Base exception for meeting room booking system."""

class RoomUnavailableError(MeetingBookingError):
    """Raised when no room of requested size is available for the given time period."""

class MeetingNotFoundError(MeetingBookingError):
    """Raised when a meeting definition is not found."""

class MeetingAlreadyExistsError(MeetingBookingError):
    """Raised when attempting to define a meeting that already exists."""

class AttendeeNotFoundError(MeetingBookingError):
    """Raised when attendee is not found in meeting definition."""
