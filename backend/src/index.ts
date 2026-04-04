import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger_output.json";
import connectDB from "./config/database";
import authRoutes from "./routes/authRoute";
import dashboardRoutes from "./routes/dashboardRoute";
import userRoutes from "./routes/userRoute";
import studentRoutes from "./routes/studentRoute";
import classRoutes from "./routes/classRoute";
import activityLogRoutes from "./routes/activityLogRoute";
import subjectRoutes from "./routes/subjectRoute";
import attendanceRoutes from "./routes/attendanceRoute";
import markRoutes from "./routes/markRoute";
import analyticsRoutes from "./routes/analyticsRoute"; 
import reportCardRoutes from "./routes/reportCardRoute";
import examRoutes from "./routes/examRoute"; 
import feeRoutes from "./routes/feeRoute"; 
import noticeRoutes from "./routes/noticeRoute"; 
import timetableRoutes from "./routes/timetableRoute";
import chatRoutes from "./routes/chatRoutes";
import initCronJobs from "./utils/cronJobs";

dotenv.config();

const app = express();

// Database
connectDB();

// Initialize Cron Jobs (e.g. Expired Token Cleanup)
initCronJobs();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Main Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/logs", activityLogRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);

app.use("/api/academics/marks", markRoutes);
app.use("/api/academics/attendance", attendanceRoutes); 
app.use("/api/analytics", analyticsRoutes); 
app.use("/api/reports", reportCardRoutes);
app.use("/api/academics/exams", examRoutes);
app.use("/api/academics/timetable", timetableRoutes);
app.use("/api/fees", feeRoutes); 
app.use("/api/notices", noticeRoutes); 
app.use("/api/chats", chatRoutes);

// Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Home message
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "SmartResults Core API" });
});

// Final JSON 404 handler for API routes
app.use("/api", (req: Request, res: Response) => {
  res.status(404).json({ 
    success: false,
    message: `API Route ${req.method} ${req.originalUrl} not found` 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  
});