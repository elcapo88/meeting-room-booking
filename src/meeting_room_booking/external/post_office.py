"""Post Office package interface and adapter."""

from typing import List, NamedTuple

class Address:
    """Represents an electronic mail address."""
    def __init__(self, email: str):
        self.email = email

    def __repr__(self) -> str:
        return f"Address('{self.email}')"

    def __eq__(self, other: object) -> bool:
        return isinstance(other, Address) and self.email == other.email


class SentMessage(NamedTuple):
    recipient: Address
    message: str


class PostOffice:
    """Singleton adapter representing external Post Office messaging component."""
    _instance = None

    def __init__(self):
        self.outbox: List[SentMessage] = []

    @classmethod
    def instance(cls) -> "PostOffice":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Reset singleton instance for testing."""
        cls._instance = None

    def deliverMessage(self, recipient: Address, message: str) -> None:
        """Delivers the specified message to the specified recipient."""
        entry = SentMessage(recipient=recipient, message=message)
        self.outbox.append(entry)
