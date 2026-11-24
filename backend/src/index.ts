import express from "express";
import cors from "cors";
import path from "path";
import { roomRoutes } from "./routes/roomRoutes";
import { meetingRoutes } from "./routes/meetingRoutes";
import { facilityRoutes } from "./routes/facilityRoutes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/rooms", roomRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/facilities", facilityRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Meeting Room & Facilities Scheduling Service",
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend static files if available
const clientBuildPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientBuildPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
    if (err) {
      res.status(200).send(`
        <html>
          <head><title>MeetSol API</title></head>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h2>MeetSol Facilities & Meeting Scheduling API</h2>
            <p>API is active on port ${PORT}. Access <a href="/api/health">/api/health</a> or <a href="/api/rooms">/api/rooms</a>.</p>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MeetSol Backend API listening on http://localhost:${PORT}`);
});
