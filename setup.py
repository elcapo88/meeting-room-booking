from setuptools import setup, find_packages

setup(
    name="meeting-room-booking",
    version="1.0.0",
    description="Meeting Room Booking System based on OOAD by Objective Engineering, Inc.",
    author="Developer",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    python_requires=">=3.8",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
