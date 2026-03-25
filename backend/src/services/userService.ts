import User, { IUserDocument } from "../models/User";
import bcrypt from "bcryptjs";

// Get all users
export const getAllUsers = async (): Promise<IUserDocument[]> => {
  return await User.find();
};

// Get single user by ID
export const getUserById = async (id: string): Promise<IUserDocument | null> => {
  return await User.findById(id);
};

// Update user
export const updateUser = async (
  id: string,
  data: Partial<{ name: string; email: string; password: string; role: string }>
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