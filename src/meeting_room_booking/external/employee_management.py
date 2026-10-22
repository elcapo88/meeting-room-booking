"""Employee Management package interface and component."""

from typing import Dict
from meeting_room_booking.external.post_office import Address

class Employee:
    """Represents an employee domain entity."""
    def __init__(self, employee_id: str, name: str, email: str):
        self._employee_id = employee_id
        self._name = name
        self._address = Address(email)

    def employee_id(self) -> str:
        return self._employee_id

    def name(self) -> str:
        return self._name

    def address(self) -> Address:
        return self._address

    def __repr__(self) -> str:
        return f"Employee({self._employee_id}, {self._name})"


class EmployeeManagement:
    """Singleton facade for Employee Management component."""
    _instance = None

    def __init__(self):
        self._employees: Dict[str, Employee] = {}

    @classmethod
    def instance(cls) -> "EmployeeManagement":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Reset singleton instance for testing."""
        cls._instance = None

    def register_employee(self, employee: Employee) -> None:
        """Registers an employee in directory."""
        self._employees[employee.employee_id()] = employee

    def employee(self, employee_id: str) -> Employee:
        """Returns Employee instance by employee identifier."""
        if employee_id not in self._employees:
            # Fallback mock for unregistered employee ID
            return Employee(employee_id, f"Employee_{employee_id}", f"emp_{employee_id}@company.com")
        return self._employees[employee_id]
