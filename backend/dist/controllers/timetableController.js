"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimetableController = void 0;
const timetableService_1 = require("../services/timetableService");
const timetableService = new timetableService_1.TimetableService();
class TimetableController {
    // Create timetable
    async createTimetable(req, res) {
        try {
            const { classId, day, periods, academicYear, term } = req.body;
            const createdBy = req.user.id;
            if (!classId || !day || !periods || !academicYear || !term) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
                return;
            }
            const timetable = await timetableService.createTimetable({
                classId,
                day,
                periods,
                academicYear,
                term,
                createdBy
            });
            res.status(201).json({
                success: true,
                message: "Timetable created successfully",
                data: timetable
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Get class timetable
    async getClassTimetable(req, res) {
        try {
            const { classId } = req.params;
            const { day, academicYear, term } = req.query;
            if (!classId) {
                res.status(400).json({
                    success: false,
                    message: "Class ID is required"
                });
                return;
            }
            const timetable = await timetableService.getClassTimetable(classId, day, academicYear, term);
            res.json({
                success: true,
                data: timetable
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Get teacher timetable
    async getTeacherTimetable(req, res) {
        try {
            const { teacherId } = req.params;
            const { academicYear, term } = req.query;
            if (!teacherId) {
                res.status(400).json({
                    success: false,
                    message: "Teacher ID is required"
                });
                return;
            }
            const timetable = await timetableService.getTeacherTimetable(teacherId, academicYear, term);
            res.json({
                success: true,
                data: timetable
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Update timetable
    async updateTimetable(req, res) {
        try {
            const { timetableId } = req.params;
            const updates = req.body;
            const timetable = await timetableService.updateTimetable(timetableId, updates);
            if (!timetable) {
                res.status(404).json({
                    success: false,
                    message: "Timetable not found"
                });
                return;
            }
            res.json({
                success: true,
                message: "Timetable updated",
                data: timetable
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Delete timetable
    async deleteTimetable(req, res) {
        try {
            const { timetableId } = req.params;
            const deleted = await timetableService.deleteTimetable(timetableId);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Timetable not found"
                });
                return;
            }
            res.json({
                success: true,
                message: "Timetable deleted"
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Get today's timetable
    async getTodaysTimetable(req, res) {
        try {
            const user = req.user;
            const { academicYear, term } = req.query;
            const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const today = days[new Date().getDay()];
            let timetable = [];
            if (user.role === 'teacher') {
                timetable = await timetableService.getTeacherTimetable(user.id, academicYear, term);
            }
            else if (user.role === 'student') {
                const Student = require('../models/Student').default;
                const student = await Student.findOne({ userId: user.id });
                if (student) {
                    timetable = await timetableService.getClassTimetable(student.class.toString(), today, academicYear, term);
                }
            }
            res.json({
                success: true,
                data: timetable
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
exports.TimetableController = TimetableController;
