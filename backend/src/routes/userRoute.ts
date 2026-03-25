import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { getUsers, getUser, updateUserController, deleteUserController } from "../controllers/userController";

const router = express.Router();

// Only admin can perform CRUD
router.use(protect, authorizeRoles("admin"));

router.get("/", getUsers);           // Get all users
router.get("/:id", getUser);         // Get single user by ID
router.put("/:id", updateUserController);   // Update user
router.delete("/:id", deleteUserController); // Delete user

export default router;