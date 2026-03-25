"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamController = void 0;
const examService_1 = require("../services/examService");
const examService = new examService_1.ExamService();
class ExamController {
    // Create new exam
    async createExam(req, res) {
        try {
            const { name, examType, term, year, startDate, endDate, classId, subjects } = req.body;
            const createdBy = req.user.id;
            // Validate required fields
            if (!name || !examType || !term || !year || !startDate || !endDate || !classId || !subjects) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
                return;
            }
            const exam = await examService.createExam({
                name,
                examType,
                term,
                year: parseInt(year),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                classId,
                subjects,
                createdBy
            });
            res.status(201).json({
                success: true,
                message: "Exam created successfully",
                data: exam
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Get exams by class
    async getExamsByClass(req, res) {
        try {
            const { classId } = req.params;
            const { term, year } = req.query;
            if (!classId) {
                res.status(400).json({
                    success: false,
                    message: "Class ID is required"
                });
                return;
            }
            const exams = await examService.getExamsByClass(classId, term, year ? parseInt(year) : undefined);
            res.json({
                success: true,
                data: exams
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Get upcoming exams
    async getUpcomingExams(req, res) {
        try {
            const exams = await examService.getUpcomingExams();
            res.json({
                success: true,
                data: exams
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Get exam by ID
    async getExamById(req, res) {
        try {
            const { examId } = req.params;
            const exam = await examService.getExamById(examId);
            if (!exam) {
                res.status(404).json({
                    success: false,
                    message: "Exam not found"
                });
                return;
            }
            res.json({
                success: true,
                data: exam
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Update exam
    async updateExam(req, res) {
        try {
            const { examId } = req.params;
            const updates = req.body;
            const exam = await examService.updateExam(examId, updates);
            if (!exam) {
                res.status(404).json({
                    success: false,
                    message: "Exam not found"
                });
                return;
            }
            res.json({
                success: true,
                message: "Exam updated successfully",
                data: exam
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Delete exam
    async deleteExam(req, res) {
        try {
            const { examId } = req.params;
            const deleted = await examService.deleteExam(examId);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Exam not found"
                });
                return;
            }
            res.json({
                success: true,
                message: "Exam deleted successfully"
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Update exam status (cron job)
    async updateExamStatuses(req, res) {
        try {
            await examService.updateExamStatus();
            res.json({
                success: true,
                message: "Exam statuses updated"
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}
exports.ExamController = ExamController;
