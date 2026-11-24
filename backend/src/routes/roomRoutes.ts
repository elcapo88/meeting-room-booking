import { Router, Request, Response } from "express";
import { RoomPool } from "../domain/RoomPool";

export const roomRoutes = Router();
const roomPool = RoomPool.getInstance();

// GET all rooms with capacity & active assignments
roomRoutes.get("/", (req: Request, res: Response) => {
  const rooms = roomPool.getRooms().map((room) => ({
    id: room.id,
    location: room.location,
    capacity: room.capacity,
    assignments: room.getAssignments(),
  }));
  res.json({ success: true, count: rooms.length, rooms });
});

// POST add a new room to the pool
roomRoutes.post("/", (req: Request, res: Response) => {
  try {
    const { location, capacity } = req.body;
    if (!location || !capacity || typeof capacity !== "number") {
      res.status(400).json({ error: "Location (string) and capacity (number) are required" });
      return;
    }
    const room = roomPool.registerRoom(location, capacity);
    res.status(201).json({ success: true, room });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
