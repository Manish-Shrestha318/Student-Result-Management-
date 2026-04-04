import Student, { IStudent } from "../models/Student";
import User from "../models/User";
import mongoose from "mongoose";

export const getAllStudents = async (): Promise<any[]> => {
  return await Student.find().populate('userId', 'name email profilePicture');
};

export const getStudentById = async (id: string): Promise<any | null> => {
  return await Student.findById(id).populate('userId', 'name email profilePicture');
};

export const createStudent = async (studentData: any): Promise<IStudent> => {
  // Check if user exists or create one if needed, but normally student creation comes after user creation
  // For simplicity, let's assume we create both or the user exists
  return await Student.create(studentData);
};

export const updateStudent = async (id: string, data: any): Promise<IStudent | null> => {
  return await Student.findByIdAndUpdate(id, data, { new: true });
};

export const deleteStudent = async (id: string): Promise<any | null> => {
  const student = await Student.findById(id);
  if (student) {
    // Optionally delete the associated user as well
    await User.findByIdAndDelete(student.userId);
    return await Student.findByIdAndDelete(id);
  }
  return null;
};
