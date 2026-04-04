"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfilePicture = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Student_1 = __importDefault(require("../models/Student"));
const Teacher_1 = __importDefault(require("../models/Teacher"));
const Parent_1 = __importDefault(require("../models/Parent"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinaryConfig_1 = __importDefault(require("../utils/cloudinaryConfig"));
const streamifier_1 = __importDefault(require("streamifier"));
/**
 * Get all users with optional role filtering and profile joining
 */
const getAllUsers = async (role, status) => {
    const cleanRole = role ? String(role).trim().toLowerCase() : undefined;
    const cleanStatus = status ? String(status).trim().toLowerCase() : undefined;
    console.log(`[SERVICE] getAllUsers - role: "${cleanRole}", status: "${cleanStatus}"`);
    // MANDATORY: If role is 'student', we MUST return only students with their profile data
    // This is the specific branch for the Student Records dashboard
    if (cleanRole === 'student') {
        const students = await Student_1.default.find().populate('userId').lean();
        return students.map(s => {
            const userData = s.userId;
            if (!userData)
                return null;
            return {
                _id: userData._id,
                profileId: s._id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                status: userData.status,
                rollNumber: s.rollNumber,
                class: s.class,
                section: s.section,
                parentName: s.parentName,
                parentPhone: s.parentPhone,
                address: s.address,
                dateOfBirth: s.dateOfBirth
            };
        }).filter(s => s !== null);
    }
    // Teacher Join Branch
    if (cleanRole === 'teacher') {
        const teachers = await Teacher_1.default.find().populate('userId').lean();
        return teachers.map(t => {
            const userData = t.userId;
            if (!userData)
                return null;
            if (cleanStatus && userData.status !== cleanStatus)
                return null;
            return {
                ...userData,
                profileId: t._id,
                employeeId: t.employeeId,
                qualification: t.qualification,
                phone: t.phone
            };
        }).filter(t => t !== null);
    }
    // Parent Join Branch
    if (cleanRole === 'parent') {
        const parents = await Parent_1.default.find().populate('userId').populate('children').lean();
        return parents.map(p => {
            const userData = p.userId;
            if (!userData)
                return null;
            return {
                ...userData,
                profileId: p._id,
                phone: p.phone,
                children: p.children
            };
        }).filter(p => p !== null);
    }
    // FALLBACK: If no specialized branch hit, return users filtered by role/status
    // CRITICAL: We MUST ensure we don't return everyone if a role was specified but branch wasn't hit
    const filter = {};
    if (cleanRole && cleanRole !== 'any')
        filter.role = cleanRole;
    if (cleanStatus && cleanStatus !== 'any')
        filter.status = cleanStatus;
    return await User_1.default.find(filter).lean();
};
exports.getAllUsers = getAllUsers;
// Get single user by ID
const getUserById = async (id) => {
    return await User_1.default.findById(id);
};
exports.getUserById = getUserById;
// Create user
const createUser = async (data) => {
    if (data.password)
        data.password = await bcryptjs_1.default.hash(data.password, 10);
    return await User_1.default.create(data);
};
exports.createUser = createUser;
// Update user
const updateUser = async (id, data) => {
    const user = await User_1.default.findById(id);
    if (!user)
        return null;
    if (data.name)
        user.name = data.name;
    if (data.email)
        user.email = data.email.toLowerCase();
    if (data.password)
        user.password = await bcryptjs_1.default.hash(data.password, 10);
    await user.save();
    return user;
};
exports.updateUser = updateUser;
// Delete user and associated profiles
const deleteUser = async (id) => {
    await Student_1.default.findOneAndDelete({ userId: id });
    await Teacher_1.default.findOneAndDelete({ userId: id });
    await Parent_1.default.findOneAndDelete({ userId: id });
    return await User_1.default.findByIdAndDelete(id);
};
exports.deleteUser = deleteUser;
// Upload user profile picture
const uploadProfilePicture = async (id, fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinaryConfig_1.default.uploader.upload_stream({ folder: "user_profiles" }, async (error, result) => {
            if (error)
                return reject(error);
            if (!result)
                return reject(new Error("Cloudinary upload failed"));
            try {
                const user = await User_1.default.findByIdAndUpdate(id, { profilePicture: result.secure_url }, { returnDocument: "after" });
                resolve(user);
            }
            catch (dbError) {
                reject(dbError);
            }
        });
        streamifier_1.default.createReadStream(fileBuffer).pipe(uploadStream);
    });
};
exports.uploadProfilePicture = uploadProfilePicture;
