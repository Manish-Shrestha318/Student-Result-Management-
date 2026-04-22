import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import {
  getStudentPerformance,
  getClassPerformance,
  getTeacherPerformance,
  getPerformanceTrend,
  getSubjectWiseAnalysis,
  getAttendanceImpact,
  getComprehensiveStudentReport,
  compareStudents,
  getStudentResultWithAttendance
} from "../controllers/analyticsController";

const router = express.Router();

// All routes are protected
router.use(protect);

// Student performance
router.get(
  "/student/:studentId", 
  authorizeRoles("admin", "teacher", "student", "parent"), 
  getStudentPerformance
);

// Performance trend
router.get(
  "/trend/:studentId", 
  authorizeRoles("admin", "teacher", "student", "parent"), 
  getPerformanceTrend
);

// Class performance
router.get(
  "/class/:classId", 
  authorizeRoles("admin", "teacher"), 
  getClassPerformance
);

// Teacher performance
router.get(
  "/teacher/:teacherId", 
  authorizeRoles("admin", "teacher"), 
  getTeacherPerformance
);

 // Subject-wise analysis (strengths & weaknesses)
 
router.get(
  "/subject-analysis/:studentId", 
  authorizeRoles("admin", "teacher", "student", "parent"), 
  getSubjectWiseAnalysis
);

// Attendance impact analysis

router.get(
  "/attendance-impact/:studentId", 
  authorizeRoles("admin", "teacher", "student", "parent"), 
  getAttendanceImpact
);

//Comprehensive student report (all in one)

router.get(
  "/comprehensive/:studentId", 
  authorizeRoles("admin", "teacher", "student", "parent"), 
  getComprehensiveStudentReport
);

/**
 *Compare two students
 * GET /api/analytics/compare/:studentId1/:studentId2
 */
router.get(
  "/compare/:studentId1/:studentId2", 
  authorizeRoles("admin", "teacher"), 
  compareStudents
);

// Attendance-aware effective result
router.get(
  "/result-with-attendance/:studentId",
  authorizeRoles("admin", "teacher", "student", "parent"),
  getStudentResultWithAttendance
);

export default router;