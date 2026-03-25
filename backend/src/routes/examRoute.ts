import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { ExamController } from "../controllers/examController";

const router = express.Router();
const examController = new ExamController();

// All routes are protected
router.use(protect);

// Public routes (accessible by multiple roles)
router.get("/upcoming", authorizeRoles("admin", "teacher", "student", "parent"), examController.getUpcomingExams);
router.get("/class/:classId", authorizeRoles("admin", "teacher", "student", "parent"), examController.getExamsByClass);
router.get("/:examId", authorizeRoles("admin", "teacher", "student", "parent"), examController.getExamById);

// Admin/Teacher only routes
router.post("/", authorizeRoles("admin", "teacher"), examController.createExam);
router.put("/:examId", authorizeRoles("admin", "teacher"), examController.updateExam);
router.delete("/:examId", authorizeRoles("admin"), examController.deleteExam);
router.patch("/update-status", authorizeRoles("admin"), examController.updateExamStatuses);

export default router;