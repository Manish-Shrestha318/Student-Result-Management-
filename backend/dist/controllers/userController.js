"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfileController = exports.verifyTeacherController = exports.getPendingTeachersController = exports.deleteStudentProfileController = exports.updateStudentProfileController = exports.getStudentProfileController = exports.deleteUserController = exports.updateUserController = exports.createUserController = exports.getUser = exports.getUsers = void 0;
const userService_1 = require("../services/userService");
const activityLogService_1 = require("../services/activityLogService");
const User_1 = __importDefault(require("../models/User"));
const Student_1 = __importDefault(require("../models/Student"));
const getUsers = async (req, res) => {
    try {
        const rawRole = req.query.role;
        const rawStatus = req.query.status;
        const role = rawRole ? String(rawRole).trim().toLowerCase() : undefined;
        const status = rawStatus ? String(rawStatus).trim().toLowerCase() : undefined;
        console.log(`[CONTROLLER] Fetching users. RawRole: "${rawRole}", ExtractedRole: "${role}", RawStatus: "${rawStatus}"`);
        const users = await (0, userService_1.getAllUsers)(role, status);
        console.log(`[CONTROLLER] Successfully fetched ${users.length} users. Role: ${role || 'any'}, Status: ${status || 'any'}. Returning success:true.`);
        res.json({ success: true, users });
    }
    catch (error) {
        console.error("[CONTROLLER] Error fetching users:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    try {
        const user = await (0, userService_1.getUserById)(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUser = getUser;
const createUserController = async (req, res) => {
    try {
        const user = await (0, userService_1.createUser)(req.body);
        res.status(201).json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createUserController = createUserController;
const updateUserController = async (req, res) => {
    try {
        const updatedUser = await (0, userService_1.updateUser)(req.params.id, req.body);
        if (!updatedUser)
            return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user: updatedUser });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateUserController = updateUserController;
const deleteUserController = async (req, res) => {
    try {
        const deletedUser = await (0, userService_1.deleteUser)(req.params.id);
        if (!deletedUser)
            return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteUserController = deleteUserController;
// This controller is redundant now, but we'll map its logic into the frontend calling GET /api/users?role=student
// Removing getStudentsProfilesController
const getStudentProfileController = async (req, res) => {
    try {
        const student = await Student_1.default.findById(req.params.id).populate('userId', 'name email profilePicture role');
        if (!student)
            return res.status(404).json({ success: false, message: "Student record not found" });
        res.json({ success: true, student });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getStudentProfileController = getStudentProfileController;
const updateStudentProfileController = async (req, res) => {
    try {
        const student = await Student_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!student)
            return res.status(404).json({ success: false, message: "Student record not found" });
        res.json({ success: true, student });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateStudentProfileController = updateStudentProfileController;
const deleteStudentProfileController = async (req, res) => {
    try {
        const student = await Student_1.default.findById(req.params.id);
        if (!student)
            return res.status(404).json({ success: false, message: "Student record not found" });
        await (0, userService_1.deleteUser)(student.userId.toString());
        res.json({ success: true, message: "Student and associated user deleted successfully" });
    }
    catch (error) {
        console.error("DEBUG Error in deleteStudentProfileController:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteStudentProfileController = deleteStudentProfileController;
const getPendingTeachersController = async (req, res) => {
    try {
        console.log("DEBUG: getPendingTeachersController hit!");
        const users = await User_1.default.find({ role: 'teacher', status: 'pending' });
        console.log(`DEBUG: Found ${users.length} pending teachers.`);
        res.json({ success: true, users });
    }
    catch (error) {
        console.error("DEBUG Error in getPendingTeachersController:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPendingTeachersController = getPendingTeachersController;
const verifyTeacherController = async (req, res) => {
    try {
        const { action } = req.body;
        console.log(`DEBUG: verifyTeacherController hit! id: ${req.params.id}, action: ${action}`);
        const user = await User_1.default.findById(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, message: "Teacher not found" });
        if (action === 'reject') {
            user.status = "rejected";
        }
        else {
            user.status = "active";
        }
        await user.save();
        console.log(`DEBUG: Teacher ${user.name} status updated to ${user.status}`);
        // ...
        // Log this action
        await (0, activityLogService_1.logActivity)({
            userId: req.user.id,
            action: action === "reject" ? "Teacher Rejected" : "Teacher Approved",
            category: "user_management",
            details: `Admin ${action === "reject" ? "rejected" : "verified"} teacher: ${user.name} (${user.email})`
        });
        res.json({ success: true, message: `Teacher ${action === "reject" ? "rejected" : "verified"} successfully` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.verifyTeacherController = verifyTeacherController;
const uploadProfileController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        if (!req.file)
            return res.status(400).json({ message: "No file provided" });
        const user = await (0, userService_1.uploadProfilePicture)(userId, req.file.buffer);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({ message: "Profile picture uploaded successfully", profilePicture: user.profilePicture });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.uploadProfileController = uploadProfileController;
