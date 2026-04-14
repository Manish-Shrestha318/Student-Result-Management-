import User, { IUserDocument } from "../models/User";
import Student from "../models/Student";
import Teacher from "../models/Teacher";
import Parent from "../models/Parent";
import Subject from "../models/Subject";
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

  // Student Branch
  if (cleanRole === 'student') {
    const students = await Student.find().populate('userId').lean();
    return students.map(s => {
      const userData = s.userId as any;
      if (!userData) return null;
      if (cleanStatus && userData.status !== cleanStatus) return null;
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

  // Teacher Branch
  if (cleanRole === 'teacher') {
    const [teachers, allSubjects] = await Promise.all([
      Teacher.find().populate('userId').lean(),
      Subject.find().lean() // Still fetching all subjects, but parallelized. Ideally paginate this later.
    ]);
    
    return teachers.map(t => {
      const userData = t.userId as any;
      if (!userData) return null;
      if (cleanStatus && userData.status !== cleanStatus) return null;
      return {
        ...userData,
        profileId: t._id,
        employeeId: t.employeeId,
        qualification: t.qualification,
        phone: t.phone,
        phoneNumber: t.phone,
        subject: t.specialization?.[0] || '',
        assignedSubjects: allSubjects.filter(sub => sub.teacherId?.toString() === userData._id.toString())
      };
    }).filter(t => t !== null);
  }

  // Parent Branch
  if (cleanRole === 'parent') {
    const parents = await Parent.find().populate('userId').populate('children').lean();
    return parents.map(p => {
      const userData = p.userId as any;
      if (!userData) return null;
      if (cleanStatus && userData.status !== cleanStatus) return null;
      return {
        ...userData,
        profileId: p._id,
        phone: p.phone,
        children: p.children
      };
    }).filter(p => p !== null);
  }

  // Fallback
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

  // Handle Teacher Specific Profile Updates during User Edit
  if (user.role === 'teacher') {
    const updateData: any = {};
    if (data.phoneNumber || data.phone) updateData.phone = data.phoneNumber || data.phone;
    if (data.primarySubject) updateData.specialization = [data.primarySubject];
    
    await Teacher.findOneAndUpdate(
        { userId: user._id },
        { 
            $set: updateData
        }
    );

    // Subject/Class Synchronization
    if (data.assignedSubjectIds && Array.isArray(data.assignedSubjectIds)) {
        // Clear old subject assignments for this teacher
        await Subject.updateMany({ teacherId: user._id }, { $unset: { teacherId: "" } });
        // Set new subject assignments
        if (data.assignedSubjectIds.length > 0) {
            await Subject.updateMany({ _id: { $in: data.assignedSubjectIds } }, { $set: { teacherId: user._id } });
        }
    }
  }

  // Handle Parent Specific Profile Updates
  if (user.role === 'parent') {
    const updateData: any = {};
    if (data.phoneNumber || data.phone) updateData.phone = data.phoneNumber || data.phone;
    
    await Parent.findOneAndUpdate(
        { userId: user._id },
        { $set: updateData }
    );

    // Sync Children
    if (data.assignedStudentIds && Array.isArray(data.assignedStudentIds)) {
        await Parent.findOneAndUpdate(
            { userId: user._id },
            { $set: { children: data.assignedStudentIds } }
        );
        
        // Cascade contact info to the linked students
        if (data.assignedStudentIds.length > 0) {
            await Student.updateMany(
                { _id: { $in: data.assignedStudentIds } },
                { $set: { parentName: user.name, parentPhone: data.phoneNumber || data.phone || '' } }
            );
        }
    }
  }

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