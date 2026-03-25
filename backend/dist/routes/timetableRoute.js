"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const timetableController_1 = require("../controllers/timetableController");
const router = express_1.default.Router();
const timetableController = new timetableController_1.TimetableController();
// All routes are protected
router.use(authMiddleware_1.protect);
// Today's timetable (for current user)
router.get("/today", timetableController.getTodaysTimetable);
// View routes
router.get("/class/:classId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher", "student", "parent"), timetableController.getClassTimetable);
router.get("/teacher/:teacherId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher"), timetableController.getTeacherTimetable);
// Admin/Teacher routes
router.post("/", (0, authMiddleware_1.authorizeRoles)("admin", "teacher"), timetableController.createTimetable);
router.put("/:timetableId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher"), timetableController.updateTimetable);
router.delete("/:timetableId", (0, authMiddleware_1.authorizeRoles)("admin"), timetableController.deleteTimetable);
exports.default = router;
