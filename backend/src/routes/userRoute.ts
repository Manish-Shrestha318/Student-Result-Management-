import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { getUsers, getUser, createUserController, updateUserController, deleteUserController, uploadProfileController, getPendingTeachersController, verifyTeacherController, deleteStudentProfileController, updateStudentProfileController, getMyProfile, updateMyProfile, changeMyPassword } from "../controllers/userController";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

// ===== SELF-SERVICE ROUTES (any authenticated user) =====
router.get("/me", protect, getMyProfile);                  // Get own profile
router.put("/me", protect, updateMyProfile);                // Update own name
router.put("/me/password", protect, changeMyPassword);      // Change own password (requires current password)
router.post("/photo", protect, upload.single("photo"), uploadProfileController); // Upload own profile photo

// ===== ADMIN-ONLY ROUTES =====
router.use(protect, authorizeRoles("admin"));

router.get("/", getUsers);           // Get all users
router.delete("/students/:id", deleteStudentProfileController); // Delete student record
router.put("/students/:id", updateStudentProfileController); // Update student profile
router.get("/pending-teachers", getPendingTeachersController); // Get pending teachers
router.put("/verify-teacher/:id", verifyTeacherController); // Verify teacher
router.post("/", createUserController);       // Create new user (Admin)
router.get("/:id", getUser);         // Get single user by ID
router.put("/:id", updateUserController);   // Update user
router.delete("/:id", deleteUserController); // Delete user

export default router;