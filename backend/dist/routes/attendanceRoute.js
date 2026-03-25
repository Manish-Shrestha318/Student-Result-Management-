"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const attendanceController_1 = require("../controllers/attendanceController");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
// Teacher & Admin routes
router.post("/mark", (0, authMiddleware_1.authorizeRoles)("teacher", "admin"), attendanceController_1.markAttendance);
router.get("/student/:studentId", (0, authMiddleware_1.authorizeRoles)("teacher", "admin", "student", "parent"), attendanceController_1.getStudentAttendance);
router.get("/report/:studentId", (0, authMiddleware_1.authorizeRoles)("teacher", "admin", "student", "parent"), attendanceController_1.getAttendanceReport);
exports.default = router;
