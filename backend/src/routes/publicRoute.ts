import express from "express";
import { getAllClasses } from "../services/classService";
import { getAllSubjects } from "../services/subjectService";
import User from "../models/User";
import Student from "../models/Student";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the School Platform Homepage!" });
});

// Registration Helpers (Unauthenticated)
router.get("/classes", async (req, res) => {
  try {
    const classes = await getAllClasses();
    res.json({ success: true, classes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/subjects", async (req, res) => {
  try {
    const subjects = await getAllSubjects();
    res.json(subjects); 
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/students", async (req, res) => {
  try {
    // Return student name and rollNumber for parent registration picker
    const studentProfiles = await Student.find().populate('userId', 'name active');
    const students = studentProfiles.map(s => ({
      _id: s._id,
      name: (s.userId as any)?.name || 'Unknown',
      studentID: s.rollNumber,
      class: s.class
    }));
    res.json({ success: true, students });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;