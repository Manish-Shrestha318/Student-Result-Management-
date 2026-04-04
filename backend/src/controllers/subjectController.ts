import { Request, Response } from "express";
import { getAllSubjects, createSubject, updateSubject, deleteSubject } from "../services/subjectService";

export const getSubjectsController = async (req: Request, res: Response) => {
  try {
    const subjects = await getAllSubjects();
    res.json(subjects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubjectController = async (req: Request, res: Response) => {
  try {
    const newSubject = await createSubject(req.body);
    res.status(201).json(newSubject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubjectController = async (req: Request, res: Response) => {
  try {
    const updatedSubject = await updateSubject(req.params.id as string, req.body);
    if (!updatedSubject) return res.status(404).json({ message: "Subject not found" });
    res.json(updatedSubject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubjectController = async (req: Request, res: Response) => {
  try {
    const deletedSubject = await deleteSubject(req.params.id as string);
    if (!deletedSubject) return res.status(404).json({ message: "Subject not found" });
    res.json({ message: "Subject deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
