import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { getUsers, getUser, createUserController, updateUserController, deleteUserController, uploadProfileController, getPendingTeachersController, verifyTeacherController } from "../controllers/userController";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

// All users can upload their own profile photo
router.post("/photo", protect, upload.single("photo"), uploadProfileController);

// Only admin can perform CRUD
router.use(protect, authorizeRoles("admin"));

router.get("/", getUsers);           // Get all users
router.get("/pending-teachers", getPendingTeachersController); // Get pending teachers
router.put("/verify-teacher/:id", verifyTeacherController); // Verify teacher
router.post("/", createUserController);       // Create new user (Admin)
router.get("/:id", getUser);         // Get single user by ID
router.put("/:id", updateUserController);   // Update user
router.delete("/:id", deleteUserController); // Delete user

export default router;