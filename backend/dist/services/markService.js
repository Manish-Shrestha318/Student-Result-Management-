"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkService = void 0;
const Mark_1 = __importDefault(require("../models/Mark"));
const Student_1 = __importDefault(require("../models/Student"));
const Subject_1 = __importDefault(require("../models/Subject"));
const gradeCalculator_1 = require("../utils/gradeCalculator");
const mongoose_1 = require("mongoose");
class MarkService {
    // Create new mark entry
    async createMark(data) {
        // Convert string IDs to ObjectIds
        const studentObjectId = new mongoose_1.Types.ObjectId(data.studentId);
        const subjectObjectId = new mongoose_1.Types.ObjectId(data.subjectId);
        // Check if student exists
        const student = await Student_1.default.findById(studentObjectId);
        if (!student) {
            throw new Error("Student not found");
        }
        // Check if subject exists
        const subject = await Subject_1.default.findById(subjectObjectId);
        if (!subject) {
            throw new Error("Subject not found");
        }
        // Check for duplicate entry
        const existingMark = await Mark_1.default.findOne({
            studentId: studentObjectId,
            subjectId: subjectObjectId,
            examType: data.examType,
            term: data.term,
            year: data.year
        });
        if (existingMark) {
            throw new Error("Marks already entered for this subject and exam");
        }
        // Validate marks
        if (data.marksObtained > data.totalMarks) {
            throw new Error("Marks obtained cannot exceed total marks");
        }
        // Calculate grade automatically
        const grade = (0, gradeCalculator_1.calculateGrade)(data.marksObtained, data.totalMarks);
        // Create mark with ObjectIds
        const markData = {
            studentId: studentObjectId,
            subjectId: subjectObjectId,
            examType: data.examType,
            marksObtained: data.marksObtained,
            totalMarks: data.totalMarks,
            term: data.term,
            year: data.year,
            remarks: data.remarks,
            grade
        };
        const mark = await Mark_1.default.create(markData);
        return await mark.populate('subjectId');
    }
    // Get marks by student
    async getMarksByStudent(studentId) {
        const studentObjectId = new mongoose_1.Types.ObjectId(studentId);
        const marks = await Mark_1.default.find({ studentId: studentObjectId })
            .populate('subjectId')
            .sort({ year: -1, term: 1, createdAt: -1 });
        return marks;
    }
    // Get marks by student and term
    async getMarksByStudentAndTerm(studentId, term, year) {
        const studentObjectId = new mongoose_1.Types.ObjectId(studentId);
        const marks = await Mark_1.default.find({
            studentId: studentObjectId,
            term,
            year
        }).populate('subjectId');
        return marks;
    }
    // Update mark entry
    async updateMark(markId, data) {
        const mark = await Mark_1.default.findById(markId);
        if (!mark) {
            throw new Error("Mark entry not found");
        }
        // Build update object properly
        const updateData = {};
        // Only add fields that are provided
        if (data.examType)
            updateData.examType = data.examType;
        if (data.term)
            updateData.term = data.term;
        if (data.year)
            updateData.year = data.year;
        if (data.remarks !== undefined)
            updateData.remarks = data.remarks;
        // Handle marks with grade recalculation
        if (data.marksObtained !== undefined || data.totalMarks !== undefined) {
            const marksObtained = data.marksObtained ?? mark.marksObtained;
            const totalMarks = data.totalMarks ?? mark.totalMarks;
            updateData.marksObtained = marksObtained;
            updateData.totalMarks = totalMarks;
            updateData.grade = (0, gradeCalculator_1.calculateGrade)(marksObtained, totalMarks);
        }
        // Handle ID conversions if provided
        if (data.studentId) {
            updateData.studentId = new mongoose_1.Types.ObjectId(data.studentId);
        }
        if (data.subjectId) {
            updateData.subjectId = new mongoose_1.Types.ObjectId(data.subjectId);
        }
        const updatedMark = await Mark_1.default.findByIdAndUpdate(markId, updateData, { new: true, runValidators: true }).populate('subjectId');
        return updatedMark;
    }
    // Delete mark entry
    async deleteMark(markId) {
        const mark = await Mark_1.default.findByIdAndDelete(markId);
        return mark;
    }
    // Generate student report
    async generateStudentReport(query) {
        const { studentId, term, year } = query;
        const studentObjectId = new mongoose_1.Types.ObjectId(studentId);
        // Get student details
        const student = await Student_1.default.findById(studentObjectId).populate('userId');
        if (!student) {
            throw new Error("Student not found");
        }
        // Get marks for the term
        const marks = await Mark_1.default.find({
            studentId: studentObjectId,
            term,
            year
        }).populate('subjectId');
        if (marks.length === 0) {
            throw new Error("No marks found for this term");
        }
        // Calculate statistics
        let totalMarks = 0;
        let totalObtained = 0;
        const subjectResults = [];
        for (const mark of marks) {
            totalMarks += mark.totalMarks;
            totalObtained += mark.marksObtained;
            // Properly type the populated subject
            const subject = mark.subjectId;
            subjectResults.push({
                subjectName: subject?.name || 'Unknown',
                subjectCode: subject?.code || 'Unknown',
                marksObtained: mark.marksObtained,
                totalMarks: mark.totalMarks,
                percentage: (0, gradeCalculator_1.calculatePercentage)(mark.marksObtained, mark.totalMarks),
                grade: mark.grade || 'N/A',
                examType: mark.examType,
                remarks: mark.remarks
            });
        }
        const overallPercentage = (totalObtained / totalMarks) * 100;
        const passed = marks.every(m => m.grade !== 'F');
        // Properly type the populated user
        const user = student.userId;
        return {
            student: {
                name: user?.name || 'Unknown',
                rollNumber: student.rollNumber,
                class: student.class,
                section: student.section
            },
            academicDetails: {
                term,
                year,
                totalSubjects: marks.length
            },
            subjectResults,
            summary: {
                totalMarksObtained: totalObtained,
                totalMarks: totalMarks,
                overallPercentage: overallPercentage.toFixed(2),
                overallGrade: (0, gradeCalculator_1.calculateOverallGrade)(overallPercentage),
                result: passed ? 'PASS' : 'FAIL'
            }
        };
    }
    // Get performance trend across terms
    async getPerformanceTrend(studentId) {
        const studentObjectId = new mongoose_1.Types.ObjectId(studentId);
        const marks = await Mark_1.default.find({ studentId: studentObjectId })
            .populate('subjectId')
            .sort({ year: 1, term: 1 });
        const trends = new Map();
        for (const mark of marks) {
            const key = `${mark.term} ${mark.year}`;
            if (!trends.has(key)) {
                trends.set(key, {
                    term: mark.term,
                    year: mark.year,
                    totalObtained: 0,
                    totalMarks: 0,
                    percentage: '0.00',
                    subjects: []
                });
            }
            const termData = trends.get(key);
            termData.totalObtained += mark.marksObtained;
            termData.totalMarks += mark.totalMarks;
            const subject = mark.subjectId;
            termData.subjects.push({
                subject: subject?.name || 'Unknown',
                percentage: (0, gradeCalculator_1.calculatePercentage)(mark.marksObtained, mark.totalMarks)
            });
        }
        // Calculate percentages for each term
        const trendData = Array.from(trends.values()).map(term => ({
            ...term,
            percentage: ((term.totalObtained / term.totalMarks) * 100).toFixed(2)
        }));
        return trendData;
    }
}
exports.MarkService = MarkService;
