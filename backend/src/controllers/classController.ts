import { Request, Response } from "express";
import { getAllClasses, createClass, updateClass, deleteClass } from "../services/classService";

export const getClassesController = async (req: Request, res: Response) => {
  try {
    const classes = await getAllClasses();
    res.json(classes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createClassController = async (req: Request, res: Response) => {
  try {
    const newClass = await createClass(req.body);
    res.status(201).json(newClass);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClassController = async (req: Request, res: Response) => {
  try {
    const updatedClass = await updateClass(req.params.id as string, req.body);
    if (!updatedClass) return res.status(404).json({ message: "Class not found" });
    res.json(updatedClass);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteClassController = async (req: Request, res: Response) => {
  try {
    const deletedClass = await deleteClass(req.params.id as string);
    if (!deletedClass) return res.status(404).json({ message: "Class not found" });
    res.json({ message: "Class deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
