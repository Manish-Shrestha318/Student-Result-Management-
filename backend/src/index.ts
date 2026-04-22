import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger_output.json";
import connectDB from "./config/database";
import authRoutes from "./routes/authRoute";
import dashboardRoutes from "./routes/dashboardRoute";
import userRoutes from "./routes/userRoute";
import classRoutes from "./routes/classRoute";
import activityLogRoutes from "./routes/activityLogRoute";
import subjectRoutes from "./routes/subjectRoute";
import attendanceRoutes from "./routes/attendanceRoute";
import markRoutes from "./routes/markRoute";
import analyticsRoutes from "./routes/analyticsRoute";
import reportCardRoutes from "./routes/reportCardRoute";
// Fee route removed
import noticeRoutes from "./routes/noticeRoute";
import chatRoutes from "./routes/chatRoutes";
import publicRoutes from "./routes/publicRoute";
import initCronJobs from "./utils/cronJobs";
import Chat from "./models/Chat";
import User from "./models/User";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: { origin: true, credentials: true }
});

// Map userId -> socketId for targeted delivery
const userSocketMap = new Map<string, string>();

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId as string;
  if (userId) {
    userSocketMap.set(userId, socket.id);
    console.log(`[Socket.IO] User ${userId} connected`);
  }

  socket.on("send_message", async (data: { senderId: string; receiverId: string; message: string }) => {
    try {
      const saved = await Chat.create({
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
      });
      const sender = await User.findById(data.senderId, "name role");
      const payload = { ...saved.toObject(), senderName: sender?.name, senderRole: sender?.role };

      // Deliver to receiver if online
      const receiverSocketId = userSocketMap.get(data.receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("receive_message", payload);

      // Confirm to sender
      socket.emit("message_sent", payload);
    } catch (err) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    userSocketMap.forEach((sid, uid) => {
      if (sid === socket.id) userSocketMap.delete(uid);
    });
    console.log(`[Socket.IO] User ${userId} disconnected`);
  });
});

// Database
connectDB();
initCronJobs();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/logs", activityLogRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/academics/marks", markRoutes);
app.use("/api/academics/attendance", attendanceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportCardRoutes);
// app.use("/api/fees") removed
app.use("/api/notices", noticeRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/public", publicRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "SmartResults Core API" });
});

app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "API Route not found" });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});