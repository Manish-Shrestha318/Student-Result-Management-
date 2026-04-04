"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudentController = exports.updateStudentController = exports.createStudentController = exports.getStudentController = exports.getStudentsController = void 0;
const studentService_1 = require("../services/studentService");
const getStudentsController = async (req, res) => {
    try {
        const students = await (0, studentService_1.getAllStudents)();
        res.json({ success: true, students });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getStudentsController = getStudentsController;
const getStudentController = async (req, res) => {
    try {
        const student = await (0, studentService_1.getStudentById)(req.params.id);
        if (!student)
            return res.status(404).json({ success: false, message: "Student not found" });
        res.json({ success: true, student });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getStudentController = getStudentController;
const createStudentController = async (req, res) => {
    try {
        // Expecting body to contain both user fields (if needed) and student fields
        // Assuming user is already created for now, or just focus on Student creation
        const student = await (0, studentService_1.createStudent)(req.body);
        res.status(201).json({ success: true, student });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createStudentController = createStudentController;
const updateStudentController = async (req, res) => {
    try {
        const updatedStudent = await (0, studentService_1.updateStudent)(req.params.id, req.body);
        if (!updatedStudent)
            return res.status(404).json({ success: false, message: "Student not found" });
        res.json({ success: true, student: updatedStudent });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateStudentController = updateStudentController;
const deleteStudentController = async (req, res) => {
    try {
        const deleted = await (0, studentService_1.deleteStudent)(req.params.id);
        if (!deleted)
            return res.status(404).json({ success: false, message: "Student not found" });
        res.json({ success: true, message: "Student record deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteStudentController = deleteStudentController;
