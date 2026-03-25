"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerformanceTrend = exports.deleteMarks = exports.updateMarks = exports.generateReport = exports.getStudentMarks = exports.enterMarks = void 0;
const markService_1 = require("../services/markService");
const markService = new markService_1.MarkService();
const enterMarks = async (req, res) => {
    try {
        const { studentId, subjectId, examType, marksObtained, totalMarks, term, year, remarks } = req.body;
        const mark = await markService.createMark({
            studentId, subjectId, examType, marksObtained, totalMarks, term, year, remarks
        });
        res.status(201).json({
            success: true,
            message: "Marks entered successfully",
            data: mark
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.enterMarks = enterMarks;
const getStudentMarks = async (req, res) => {
    try {
        const { studentId } = req.params;
        const marks = await markService.getMarksByStudent(studentId);
        res.json({
            success: true,
            data: marks
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.getStudentMarks = getStudentMarks;
const generateReport = async (req, res) => {
    try {
        const { studentId, term, year } = req.query;
        if (!studentId || !term || !year) {
            return res.status(400).json({
                success: false,
                message: "studentId, term, and year are required"
            });
        }
        const report = await markService.generateStudentReport({
            studentId: studentId,
            term: term,
            year: parseInt(year)
        });
        res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.generateReport = generateReport;
const updateMarks = async (req, res) => {
    try {
        const { markId } = req.params;
        const updatedMark = await markService.updateMark(markId, req.body);
        if (!updatedMark) {
            return res.status(404).json({
                success: false,
                message: "Mark entry not found"
            });
        }
        res.json({
            success: true,
            message: "Marks updated successfully",
            data: updatedMark
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.updateMarks = updateMarks;
const deleteMarks = async (req, res) => {
    try {
        const { markId } = req.params;
        const deletedMark = await markService.deleteMark(markId);
        if (!deletedMark) {
            return res.status(404).json({
                success: false,
                message: "Mark entry not found"
            });
        }
        res.json({
            success: true,
            message: "Mark entry deleted successfully"
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.deleteMarks = deleteMarks;
const getPerformanceTrend = async (req, res) => {
    try {
        const { studentId } = req.params;
        const trends = await markService.getPerformanceTrend(studentId);
        res.json({
            success: true,
            data: trends
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.getPerformanceTrend = getPerformanceTrend;
