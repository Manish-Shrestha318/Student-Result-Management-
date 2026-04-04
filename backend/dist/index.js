"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_output_json_1 = __importDefault(require("./docs/swagger_output.json"));
const database_1 = __importDefault(require("./config/database"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const dashboardRoute_1 = __importDefault(require("./routes/dashboardRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const classRoute_1 = __importDefault(require("./routes/classRoute"));
const activityLogRoute_1 = __importDefault(require("./routes/activityLogRoute"));
const subjectRoute_1 = __importDefault(require("./routes/subjectRoute"));
const attendanceRoute_1 = __importDefault(require("./routes/attendanceRoute"));
const markRoute_1 = __importDefault(require("./routes/markRoute"));
const analyticsRoute_1 = __importDefault(require("./routes/analyticsRoute"));
const reportCardRoute_1 = __importDefault(require("./routes/reportCardRoute"));
const examRoute_1 = __importDefault(require("./routes/examRoute"));
const feeRoute_1 = __importDefault(require("./routes/feeRoute"));
const noticeRoute_1 = __importDefault(require("./routes/noticeRoute"));
const timetableRoute_1 = __importDefault(require("./routes/timetableRoute"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const cronJobs_1 = __importDefault(require("./utils/cronJobs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Database
(0, database_1.default)();
// Initialize Cron Jobs (e.g. Expired Token Cleanup)
(0, cronJobs_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use("/api/auth", authRoute_1.default);
app.use("/api/dashboard", dashboardRoute_1.default);
app.use("/api/users", userRoute_1.default);
app.use("/api/classes", classRoute_1.default);
app.use("/api/logs", activityLogRoute_1.default);
app.use("/api/subjects", subjectRoute_1.default);
app.use("/api/academics/marks", markRoute_1.default);
app.use("/api/academics/attendance", attendanceRoute_1.default);
app.use("/api/analytics", analyticsRoute_1.default);
app.use("/api/reports", reportCardRoute_1.default);
app.use("/api/academics/exams", examRoute_1.default);
app.use("/api/academics/timetable", timetableRoute_1.default);
app.use("/api/fees", feeRoute_1.default);
app.use("/api/notices", noticeRoute_1.default);
app.use("/api/chats", chatRoutes_1.default);
// Documentation
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default));
// Home message
app.get("/", (req, res) => {
    res.json({ message: "SmartResults Core API" });
});
// Final JSON 404 handler for API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: `API Route ${req.method} ${req.originalUrl} not found`
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
