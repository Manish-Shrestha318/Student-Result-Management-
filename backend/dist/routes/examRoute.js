"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const examController_1 = require("../controllers/examController");
const router = express_1.default.Router();
const examController = new examController_1.ExamController();
// All routes are protected
router.use(authMiddleware_1.protect);
// Public routes (accessible by multiple roles)
router.get("/upcoming", (0, authMiddleware_1.authorizeRoles)("admin", "teacher", "student", "parent"), examController.getUpcomingExams);
router.get("/class/:classId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher", "student", "parent"), examController.getExamsByClass);
router.get("/:examId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher", "student", "parent"), examController.getExamById);
// Admin/Teacher only routes
router.post("/", (0, authMiddleware_1.authorizeRoles)("admin", "teacher"), examController.createExam);
router.put("/:examId", (0, authMiddleware_1.authorizeRoles)("admin", "teacher"), examController.updateExam);
router.delete("/:examId", (0, authMiddleware_1.authorizeRoles)("admin"), examController.deleteExam);
router.patch("/update-status", (0, authMiddleware_1.authorizeRoles)("admin"), examController.updateExamStatuses);
exports.default = router;
