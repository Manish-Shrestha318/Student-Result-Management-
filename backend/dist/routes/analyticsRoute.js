"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const analyticsController_1 = require("../controllers/analyticsController");
const router = express_1.default.Router();
// All routes are protected
router.use(authMiddleware_1.protect);
// Student performance
router.get("/student/:studentId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher", "student", "parent"), analyticsController_1.getStudentPerformance);
// Performance trend
router.get("/trend/:studentId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher", "student", "parent"), analyticsController_1.getPerformanceTrend);
// Class performance
router.get("/class/:classId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher"), analyticsController_1.getClassPerformance);
// Teacher performance
router.get("/teacher/:teacherId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher"), analyticsController_1.getTeacherPerformance);
//NEW: Subject-wise analysis (strengths & weaknesses)
router.get("/subject-analysis/:studentId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher", "student", "parent"), analyticsController_1.getSubjectWiseAnalysis);
//NEW: Attendance impact analysis
router.get("/attendance-impact/:studentId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher", "student", "parent"), analyticsController_1.getAttendanceImpact);
//NEW: Comprehensive student report (all in one)
router.get("/comprehensive/:studentId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher", "student", "parent"), analyticsController_1.getComprehensiveStudentReport);
/**
 * NEW: Compare two students
 * GET /api/analytics/compare/:studentId1/:studentId2
 */
router.get("/compare/:studentId1/:studentId2", (0, authMiddleware_1.authorizeRoles)("admin", "teacher"), analyticsController_1.compareStudents);
exports.default = router;
