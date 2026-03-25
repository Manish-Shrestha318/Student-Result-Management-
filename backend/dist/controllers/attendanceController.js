"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceReport = exports.getStudentAttendance = exports.markAttendance = void 0;
const attendanceService_1 = require("../services/attendanceService");
const attendanceService = new attendanceService_1.AttendanceService();
const markAttendance = async (req, res) => {
    try {
        const { studentId, date, status, subjectId, remarks } = req.body;
        const markedBy = req.user.id; // Get from auth middleware
        const attendance = await attendanceService.markAttendance({
            studentId,
            date: new Date(date),
            status,
            subjectId,
            remarks,
            markedBy
        });
        res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            data: attendance
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.markAttendance = markAttendance;
const getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate } = req.query;
        const attendance = await attendanceService.getAttendanceByStudent(studentId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        res.json({
            success: true,
            data: attendance
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.getStudentAttendance = getStudentAttendance;
const getAttendanceReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: "Month and year are required"
            });
        }
        const report = await attendanceService.getAttendanceReport(studentId, parseInt(month), parseInt(year));
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
exports.getAttendanceReport = getAttendanceReport;
