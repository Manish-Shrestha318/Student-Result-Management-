import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger_output.json";
import connectDB from "./config/database";
import authRoutes from "./routes/authRoute";
import dashboardRoutes from "./routes/dashboardRoute";
import publicRoutes from "./routes/publicRoute";
import userRoutes from "./routes/userRoute";
import attendanceRoutes from "./routes/attendanceRoute";
import markRoutes from "./routes/markRoute";
import analyticsRoutes from "./routes/analyticsRoute"; 
import reportCardRoutes from "./routes/reportCardRoute";
import examRoutes from "./routes/examRoute"; 
import feeRoutes from "./routes/feeRoute"; 
import noticeRoutes from "./routes/noticeRoute"; 
import timetableRoutes from "./routes/timetableRoute";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRoutes);
app.use("/", publicRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

app.use("/api/academics/marks", markRoutes);
app.use("/api/academics/attendance", attendanceRoutes); 
app.use("/api/analytics", analyticsRoutes); 
app.use("/api/reports", reportCardRoutes);
app.use("/api/academics/exams", examRoutes);
app.use("/api/academics/timetable", timetableRoutes);
app.use("/api/fees", feeRoutes); 
app.use("/api/notices", noticeRoutes); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});