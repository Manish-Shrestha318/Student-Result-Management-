import { Request, Response } from "express";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, uploadProfilePicture } from "../services/userService";
import { logActivity } from "../services/activityLogService";
import User from "../models/User";
import Student from "../models/Student";
import bcrypt from "bcryptjs";

// ===== SELF-SERVICE ENDPOINTS (any authenticated user) =====

// Get own profile
export const getMyProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    let user: any = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpire').lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // If student, attach profile data
    if (user.role === 'student') {
      const studentProfile = await Student.findOne({ userId }).lean();
      if (studentProfile) {
        user = { ...user, studentProfile };
      }
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update own profile (name only, no role/status escalation)
export const updateMyProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.name = name.trim();
    await user.save();

    res.json({ success: true, message: "Profile updated successfully", user: { name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change own password (requires current password)
export const changeMyPassword = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.password) {
      return res.status(400).json({ success: false, message: "No password set for this account. Use forgot-password instead." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== ADMIN ENDPOINTS =====

export const getUsers = async (req: Request, res: Response) => {
  try {
    const rawRole = req.query.role;
    const rawStatus = req.query.status;
    const role = rawRole ? String(rawRole).trim().toLowerCase() : undefined;
    const status = rawStatus ? String(rawStatus).trim().toLowerCase() : undefined;
    
    console.log(`[CONTROLLER] Fetching users. RawRole: "${rawRole}", ExtractedRole: "${role}", RawStatus: "${rawStatus}"`);
    
    const users = await getAllUsers(role as string, status as string);
    console.log(`[CONTROLLER] Successfully fetched ${users.length} users. Role: ${role || 'any'}, Status: ${status || 'any'}. Returning success:true.`);
    res.json({ success: true, users });
  } catch (error: any) {
    console.error("[CONTROLLER] Error fetching users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.params.id as any);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUserController = async (req: Request, res: Response) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const updatedUser = await updateUser(req.params.id as any, req.body);
    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
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

// This controller is redundant now, but we'll map its logic into the frontend calling GET /api/users?role=student
// Removing getStudentsProfilesController

export const getStudentProfileController = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'name email profilePicture role');
    if (!student) return res.status(404).json({ success: false, message: "Student record not found" });
    res.json({ success: true, student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudentProfileController = async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ success: false, message: "Student record not found" });
    res.json({ success: true, student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStudentProfileController = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: "Student record not found" });

    await deleteUser(student.userId.toString());
    res.json({ success: true, message: "Student and associated user deleted successfully" });
  } catch (error: any) {
    console.error("DEBUG Error in deleteStudentProfileController:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingTeachersController = async (req: Request, res: Response) => {
  try {
    console.log("DEBUG: getPendingTeachersController hit!");
    const users = await User.find({ role: 'teacher', status: 'pending' });
    console.log(`DEBUG: Found ${users.length} pending teachers.`);
    res.json({ success: true, users });
  } catch (error: any) {
    console.error("DEBUG Error in getPendingTeachersController:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyTeacherController = async (req: Request, res: Response) => {
  try {
    const { action } = req.body;
    console.log(`DEBUG: verifyTeacherController hit! id: ${req.params.id}, action: ${action}`);
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Teacher not found" });
    
    if (action === 'reject') {
      user.status = "rejected";
    } else {
      user.status = "active";
    }
    
    await user.save();
    console.log(`DEBUG: Teacher ${user.name} status updated to ${user.status}`);

    // Log this action
    await logActivity({
      userId: (req as any).user.id,
      action: action === "reject" ? "Teacher Rejected" : "Teacher Approved",
      category: "user_management",
      details: `Admin ${action === "reject" ? "rejected" : "verified"} teacher: ${user.name} (${user.email})`
    });

    res.json({ success: true, message: `Teacher ${action === "reject" ? "rejected" : "verified"} successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
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