"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudentById = exports.getAllStudents = void 0;
const Student_1 = __importDefault(require("../models/Student"));
const User_1 = __importDefault(require("../models/User"));
const getAllStudents = async () => {
    return await Student_1.default.find().populate('userId', 'name email profilePicture');
};
exports.getAllStudents = getAllStudents;
const getStudentById = async (id) => {
    return await Student_1.default.findById(id).populate('userId', 'name email profilePicture');
};
exports.getStudentById = getStudentById;
const createStudent = async (studentData) => {
    // Check if user exists or create one if needed, but normally student creation comes after user creation
    // For simplicity, let's assume we create both or the user exists
    return await Student_1.default.create(studentData);
};
exports.createStudent = createStudent;
const updateStudent = async (id, data) => {
    return await Student_1.default.findByIdAndUpdate(id, data, { new: true });
};
exports.updateStudent = updateStudent;
const deleteStudent = async (id) => {
    const student = await Student_1.default.findById(id);
    if (student) {
        // Optionally delete the associated user as well
        await User_1.default.findByIdAndDelete(student.userId);
        return await Student_1.default.findByIdAndDelete(id);
    }
    return null;
};
exports.deleteStudent = deleteStudent;
