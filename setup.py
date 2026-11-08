from setuptools import setup, find_packages

setup(
    name="meeting-room-booking",
    version="1.1.0",
    description="Meeting Room Booking System based on OOAD by Objective Engineering, Inc.",
    author="elcapo88",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    package_data={
        "meeting_room_booking.web": ["static/*"],
    },
    include_package_data=True,
    install_requires=[
        "fastapi>=0.100.0",
        "uvicorn>=0.20.0",
        "pydantic>=2.0.0",
    ],
    python_requires=">=3.8",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
