import { Router, Request, Response } from "express";
import { FacilitiesScheduler } from "../facades/FacilitiesScheduler";
import { NotificationService } from "../services/NotificationService";

export const facilityRoutes = Router();
const scheduler = new FacilitiesScheduler();
const notifications = NotificationService.getInstance();

// GET all scheduled meetings
facilityRoutes.get("/scheduled", (req: Request, res: Response) => {
  const scheduled = scheduler.getAllScheduledMeetings();
  res.json({ success: true, count: scheduled.length, scheduled });
});

// POST schedule an existing meeting (capacity-optimal allocation)
facilityRoutes.post("/schedule-meeting", (req: Request, res: Response) => {
  try {
    const { meetingName, startTime, endTime } = req.body;
    if (!meetingName || !startTime || !endTime) {
      res.status(400).json({ error: "meetingName, startTime, and endTime are required" });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: "Invalid date format for startTime or endTime" });
      return;
    }

    const scheduled = scheduler.scheduleMeeting(meetingName, start, end);
    res.status(201).json({ success: true, scheduled });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST direct room reservation (by size and time window)
facilityRoutes.post("/schedule-room", (req: Request, res: Response) => {
  try {
    const { size, startTime, endTime, purpose } = req.body;
    if (!size || !startTime || !endTime) {
      res.status(400).json({ error: "size (number), startTime, and endTime are required" });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: "Invalid date format for startTime or endTime" });
      return;
    }

    const result = scheduler.scheduleRoom(Number(size), start, end, purpose);
    res.status(201).json({ success: true, reservation: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE cancel a scheduled meeting
facilityRoutes.delete("/scheduled/:id", (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    scheduler.cancelMeeting(id);
    res.json({ success: true, message: `Meeting instance '${id}' canceled and room released` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE cancel a direct room assignment
facilityRoutes.delete("/rooms/:location/assignments/:assignmentId", (req: Request, res: Response) => {
  try {
    const location = Array.isArray(req.params.location) ? req.params.location[0] : req.params.location;
    const assignmentId = Array.isArray(req.params.assignmentId) ? req.params.assignmentId[0] : req.params.assignmentId;
    const released = scheduler.cancelRoomAssignment(location, assignmentId);
    if (!released) {
      res.status(404).json({ error: "Assignment not found or could not be released" });
      return;
    }
    res.json({ success: true, message: `Assignment ${assignmentId} released from ${location}` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET recent notifications (Post Office audit log)
facilityRoutes.get("/notifications", (req: Request, res: Response) => {
  res.json({ success: true, notifications: notifications.getRecentNotifications() });
});
