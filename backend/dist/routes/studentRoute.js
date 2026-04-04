"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const studentController_1 = require("../controllers/studentController");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect); // Only users can access student records
router.use((0, authMiddleware_1.authorizeRoles)("admin", "teacher")); // Only admin/teacher can manage records
router.get("/", studentController_1.getStudentsController); // Get all students
router.get("/:id", studentController_1.getStudentController); // Get single student
router.post("/", studentController_1.createStudentController); // Create student
router.put("/:id", studentController_1.updateStudentController); // Update student
router.delete("/:id", studentController_1.deleteStudentController); // Delete student
exports.default = router;
