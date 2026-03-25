import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { TimetableController } from "../controllers/timetableController";

const router = express.Router();
const timetableController = new TimetableController();

// All routes are protected
router.use(protect);

// Today's timetable (for current user)
router.get("/today", timetableController.getTodaysTimetable);

// View routes
router.get("/class/:classId", authorizeRoles("admin", "teacher", "student", "parent"), timetableController.getClassTimetable);
router.get("/teacher/:teacherId", authorizeRoles("admin", "teacher"), timetableController.getTeacherTimetable);

// Admin/Teacher routes
router.post("/", authorizeRoles("admin", "teacher"), timetableController.createTimetable);
router.put("/:timetableId", authorizeRoles("admin", "teacher"), timetableController.updateTimetable);
router.delete("/:timetableId", authorizeRoles("admin"), timetableController.deleteTimetable);

export default router;