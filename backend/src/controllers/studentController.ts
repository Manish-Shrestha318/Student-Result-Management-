import { Request, Response } from "express";
import { 
  getAllStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent 
} from "../services/studentService";

export const getStudentsController = async (req: Request, res: Response) => {
  try {
    const students = await getAllStudents();
    res.json({ success: true, students });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentController = async (req: Request, res: Response) => {
  try {
    const student = await getStudentById(req.params.id as string);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStudentController = async (req: Request, res: Response) => {
  try {
    // Expecting body to contain both user fields (if needed) and student fields
    // Assuming user is already created for now, or just focus on Student creation
    const student = await createStudent(req.body);
    res.status(201).json({ success: true, student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudentController = async (req: Request, res: Response) => {
  try {
    const updatedStudent = await updateStudent(req.params.id as string, req.body);
    if (!updatedStudent) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, student: updatedStudent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStudentController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteStudent(req.params.id as string);
    if (!deleted) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student record deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
