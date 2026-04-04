import { Request, Response } from "express";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, uploadProfilePicture } from "../services/userService";
import { logActivity } from "../services/activityLogService";
import User from "../models/User";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.params.id as any);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createUserController = async (req: Request, res: Response) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const updatedUser = await updateUser(req.params.id as any, req.body);
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const deletedUser = await deleteUser(req.params.id as string);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingTeachersController = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: 'teacher', isVerified: false });
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyTeacherController = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Teacher not found" });
    user.isVerified = true;
    await user.save();

    // Log this action
    await logActivity({
      userId: (req as any).user.id,
      action: "Teacher Verified",
      category: "user_management",
      details: `Admin verified teacher account: ${user.name} (${user.email})`
    });

    res.json({ success: true, message: "Teacher verified successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfileController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    const user = await uploadProfilePicture(userId, req.file.buffer);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile picture uploaded successfully", profilePicture: user.profilePicture });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};