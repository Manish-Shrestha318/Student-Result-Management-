import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { 
  enterMarks, 
  getStudentMarks, 
  generateReport, 
  updateMarks, 
  deleteMarks,
  getPerformanceTrend 
} from "../controllers/markController";

const router = express.Router();

// All routes are protected
router.use(protect);

// Teacher & Admin routes
router.post("/marks", authorizeRoles("teacher", "admin"), enterMarks);
router.put("/marks/:markId", authorizeRoles("teacher", "admin"), updateMarks);
router.delete("/marks/:markId", authorizeRoles("teacher", "admin"), deleteMarks);

// Routes accessible by multiple roles
router.get("/marks/student/:studentId", authorizeRoles("teacher", "admin", "student", "parent"), getStudentMarks);
router.get("/reports", authorizeRoles("teacher", "admin", "student", "parent"), generateReport);
router.get("/trends/:studentId", authorizeRoles("teacher", "admin", "student", "parent"), getPerformanceTrend);

export default router;