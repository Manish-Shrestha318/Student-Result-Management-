"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController_1 = require("../controllers/userController");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = express_1.default.Router();
// All users can upload their own profile photo
router.post("/photo", authMiddleware_1.protect, uploadMiddleware_1.default.single("photo"), userController_1.uploadProfileController);
// Only admin can perform CRUD
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"));
router.get("/", userController_1.getUsers); // Get all users
router.delete("/students/:id", userController_1.deleteStudentProfileController); // Delete student record
router.put("/students/:id", userController_1.updateStudentProfileController); // Update student profile
router.get("/pending-teachers", userController_1.getPendingTeachersController); // Get pending teachers
router.put("/verify-teacher/:id", userController_1.verifyTeacherController); // Verify teacher
router.post("/", userController_1.createUserController); // Create new user (Admin)
router.get("/:id", userController_1.getUser); // Get single user by ID
router.put("/:id", userController_1.updateUserController); // Update user
router.delete("/:id", userController_1.deleteUserController); // Delete user
exports.default = router;
