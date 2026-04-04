import User, { IUserDocument } from "../models/User";
import Student from "../models/Student";
import Teacher from "../models/Teacher";
import Parent from "../models/Parent";
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinaryConfig";
import streamifier from "streamifier";

/**
 * Get all users with optional role filtering and profile joining
 */
export const getAllUsers = async (role?: string, status?: string): Promise<any[]> => {
  const cleanRole = role ? String(role).trim().toLowerCase() : undefined;
  const cleanStatus = status ? String(status).trim().toLowerCase() : undefined;
  
  console.log(`[SERVICE] getAllUsers - role: "${cleanRole}", status: "${cleanStatus}"`);

  // MANDATORY: If role is 'student', we MUST return only students with their profile data
  // This is the specific branch for the Student Records dashboard
  if (cleanRole === 'student') {
    const students = await Student.find().populate('userId').lean();
    return students.map(s => {
      const userData = s.userId as any;
      if (!userData) return null;
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
    const teachers = await Teacher.find().populate('userId').lean();
    return teachers.map(t => {
      const userData = t.userId as any;
      if (!userData) return null;
      if (cleanStatus && userData.status !== cleanStatus) return null;
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
    const parents = await Parent.find().populate('userId').populate('children').lean();
    return parents.map(p => {
      const userData = p.userId as any;
      if (!userData) return null;
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
  const filter: any = {};
  if (cleanRole && cleanRole !== 'any') filter.role = cleanRole;
  if (cleanStatus && cleanStatus !== 'any') filter.status = cleanStatus;
  
  return await User.find(filter).lean();
};

// Get single user by ID
export const getUserById = async (id: string): Promise<IUserDocument | null> => {
  return await User.findById(id);
};

// Create user
export const createUser = async (data: any): Promise<IUserDocument> => {
  if (data.password) data.password = await bcrypt.hash(data.password, 10);
  return await User.create(data);
};

// Update user
export const updateUser = async (id: string, data: any): Promise<IUserDocument | null> => {
  const user = await User.findById(id);
  if (!user) return null;
  if (data.name) user.name = data.name;
  if (data.email) user.email = data.email.toLowerCase();
  if (data.password) user.password = await bcrypt.hash(data.password, 10);
  if (data.status) user.status = data.status;
  if (data.role) user.role = data.role;
  await user.save();
  return user;
};

// Delete user and associated profiles
export const deleteUser = async (id: string): Promise<any | null> => {
  await Student.findOneAndDelete({ userId: id });
  await Teacher.findOneAndDelete({ userId: id });
  await Parent.findOneAndDelete({ userId: id });
  return await User.findByIdAndDelete(id);
};

// Upload user profile picture
export const uploadProfilePicture = async (id: string, fileBuffer: Buffer): Promise<IUserDocument | null> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "user_profiles" },
      async (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed"));
        try {
          const user = await User.findByIdAndUpdate(id, { profilePicture: result.secure_url }, { returnDocument: "after" });
          resolve(user);
        } catch (dbError) { reject(dbError); }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};