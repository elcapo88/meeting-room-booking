import { Router, Request, Response } from "express";
import { MeetingAdministration } from "../facades/MeetingAdministration";

export const meetingRoutes = Router();
const admin = new MeetingAdministration();

// GET all defined meetings
meetingRoutes.get("/", (req: Request, res: Response) => {
  const meetings = admin.getAllMeetings().map((m) => ({
    id: m.id,
    name: m.name,
    attendees: m.getAttendees(),
    scheduledCount: m.getScheduledInstances().length,
  }));
  res.json({ success: true, count: meetings.length, meetings });
});

// POST define a new meeting
meetingRoutes.post("/", (req: Request, res: Response) => {
  try {
    const { name, attendees } = req.body;
    if (!name) {
      res.status(400).json({ error: "Meeting name is required" });
      return;
    }
    const meeting = admin.defineMeeting(name, Array.isArray(attendees) ? attendees : []);
    res.status(201).json({
      success: true,
      meeting: {
        id: meeting.id,
        name: meeting.name,
        attendees: meeting.getAttendees(),
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST add attendee to meeting
meetingRoutes.post("/:name/attendees", (req: Request, res: Response) => {
  try {
    const meetingName = req.params.name;
    const { employeeId } = req.body;
    if (!employeeId) {
      res.status(400).json({ error: "employeeId (string/email) is required" });
      return;
    }
    admin.addAttendee(meetingName, employeeId);
    res.json({ success: true, message: `Added ${employeeId} to ${meetingName}` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE attendee from meeting
meetingRoutes.delete("/:name/attendees/:employeeId", (req: Request, res: Response) => {
  try {
    const { name, employeeId } = req.params;
    const result = admin.removeAttendee(name, employeeId);
    res.json({
      success: true,
      message: `Removed ${employeeId} from ${name}`,
      cascadeCanceledInstances: result.canceledInstancesCount,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE remove entire meeting definition
meetingRoutes.delete("/:name", (req: Request, res: Response) => {
  try {
    const meetingName = req.params.name;
    const result = admin.removeMeeting(meetingName);
    res.json({
      success: true,
      message: `Meeting '${meetingName}' removed`,
      cascadeCanceledInstances: result.canceledInstancesCount,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
