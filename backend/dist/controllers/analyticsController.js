"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareStudents = exports.getComprehensiveStudentReport = exports.getAttendanceImpact = exports.getSubjectWiseAnalysis = exports.getPerformanceTrend = exports.getTeacherPerformance = exports.getClassPerformance = exports.getStudentPerformance = void 0;
const analyticsService_1 = require("../services/analyticsService");
const analyticsService = new analyticsService_1.AnalyticsService();
const topicAnalysisService = new analyticsService_1.TopicAnalysisService();
const attendanceImpactService = new analyticsService_1.AttendanceImpactService();
const getStudentPerformance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const data = await analyticsService.getStudentPerformanceSummary(studentId);
        res.json({
            success: true,
            data
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.getStudentPerformance = getStudentPerformance;
const getClassPerformance = async (req, res) => {
    try {
        const { classId } = req.params;
        const { term, year } = req.query;
        if (!term || !year) {
            return res.status(400).json({
                success: false,
                message: "Term and year are required"
            });
        }
        const data = await analyticsService.getClassPerformanceReport(classId, term, parseInt(year));
        res.json({
            success: true,
            data
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.getClassPerformance = getClassPerformance;
const getTeacherPerformance = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const data = await analyticsService.getTeacherPerformance(teacherId);
        res.json({
            success: true,
            data
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.getTeacherPerformance = getTeacherPerformance;
const getPerformanceTrend = async (req, res) => {
    try {
        const { studentId } = req.params;
        const data = await analyticsService.getPerformanceTrend(studentId);
        res.json({
            success: true,
            data
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
/**
 * NEW: Get subject-wise analysis (strengths & weaknesses)
 * This tells you which subjects the student is strong/weak in
 */
const getSubjectWiseAnalysis = async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "Student ID is required"
            });
        }
        const data = await topicAnalysisService.analyzeTopicPerformance(studentId);
        res.json({
            success: true,
            data
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.getSubjectWiseAnalysis = getSubjectWiseAnalysis;
/**
 * NEW: Get attendance impact analysis
 * This shows how attendance affects student's grades
 */
const getAttendanceImpact = async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "Student ID is required"
            });
        }
        const data = await attendanceImpactService.analyzeAttendanceImpact(studentId);
        res.json({
            success: true,
            data
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.getAttendanceImpact = getAttendanceImpact;
/**
 * Get comprehensive student report
 * Combines performance, subject analysis, and attendance impact
 */
const getComprehensiveStudentReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "Student ID is required"
            });
        }
        // Run all analyses in parallel
        const [performance, subjectAnalysis, attendanceImpact] = await Promise.all([
            analyticsService.getStudentPerformanceSummary(studentId),
            topicAnalysisService.analyzeTopicPerformance(studentId),
            attendanceImpactService.analyzeAttendanceImpact(studentId)
        ]);
        res.json({
            success: true,
            data: {
                performance,
                subjectAnalysis,
                attendanceImpact,
                // Add a simple summary at the top
                quickSummary: {
                    weakestSubject: subjectAnalysis?.summary?.weakestSubject,
                    strongestSubject: subjectAnalysis?.summary?.strongestSubject,
                    attendanceImpact: attendanceImpact?.summary?.overallImpact,
                    recommendation: attendanceImpact?.summary?.recommendation
                }
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.getComprehensiveStudentReport = getComprehensiveStudentReport;
/**
 * NEW: Compare two students
 */
const compareStudents = async (req, res) => {
    try {
        const { studentId1, studentId2 } = req.params;
        const { term, year } = req.query;
        if (!studentId1 || !studentId2) {
            return res.status(400).json({
                success: false,
                message: "Both student IDs are required"
            });
        }
        // Get data for both students
        const [student1Data, student2Data] = await Promise.all([
            topicAnalysisService.analyzeTopicPerformance(studentId1),
            topicAnalysisService.analyzeTopicPerformance(studentId2)
        ]);
        res.json({
            success: true,
            data: {
                student1: student1Data,
                student2: student2Data,
                comparison: {
                    student1Stronger: student1Data?.summary?.strongestScore > student2Data?.summary?.strongestScore ? 'Yes' : 'No',
                    student2Stronger: student2Data?.summary?.strongestScore > student1Data?.summary?.strongestScore ? 'Yes' : 'No'
                }
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.compareStudents = compareStudents;
