import User, { IUserDocument } from "../models/User";
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinaryConfig";
import streamifier from "streamifier";

// Get all users
export const getAllUsers = async (): Promise<IUserDocument[]> => {
  return await User.find();
};

// Get single user by ID
export const getUserById = async (id: string): Promise<IUserDocument | null> => {
  return await User.findById(id);
};

// Create user
export const createUser = async (data: any): Promise<IUserDocument> => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return await User.create(data);
};

// Update user
export const updateUser = async (
  id: string,
  data: Partial<{ name: string; email: string; password: string; role: string; profilePicture: string }>
): Promise<IUserDocument | null> => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10); // hash new password
  }
  return await User.findByIdAndUpdate(id, data, { new: true });
};

// Delete user
export const deleteUser = async (id: string): Promise<IUserDocument | null> => {
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
          const user = await User.findByIdAndUpdate(
            id,
            { profilePicture: result.secure_url },
            { new: true }
          );
          resolve(user);
        } catch (dbError) {
          reject(dbError);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};