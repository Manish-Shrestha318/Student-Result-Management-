import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { 
  markAttendance, 
  getStudentAttendance, 
  getAttendanceReport 
} from "../controllers/attendanceController";

const router = express.Router();

router.use(protect);

// Teacher & Admin routes
router.post("/mark", authorizeRoles("teacher", "admin"), markAttendance);
router.get("/student/:studentId", authorizeRoles("teacher", "admin", "student", "parent"), getStudentAttendance);
router.get("/report/:studentId", authorizeRoles("teacher", "admin", "student", "parent"), getAttendanceReport);

export default router;