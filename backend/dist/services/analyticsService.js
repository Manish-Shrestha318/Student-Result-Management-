"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceImpactService = exports.TopicAnalysisService = exports.AnalyticsService = void 0;
const Mark_1 = __importDefault(require("../models/Mark"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Student_1 = __importDefault(require("../models/Student"));
const mongoose_1 = require("mongoose");
class AnalyticsService {
    // Get student performance summary
    async getStudentPerformanceSummary(studentId) {
        const studentObjectId = new mongoose_1.Types.ObjectId(studentId);
        // Get all marks
        const marks = await Mark_1.default.find({ studentId: studentObjectId })
            .populate('subjectId')
            .sort({ year: -1, term: -1 });
        // Get attendance
        const attendance = await Attendance_1.default.find({ studentId: studentObjectId });
        // Calculate statistics
        const totalSubjects = marks.length;
        const averageMarks = marks.reduce((sum, m) => sum + m.marksObtained, 0) / totalSubjects || 0;
        const passedSubjects = marks.filter(m => m.grade !== 'F').length;
        const failedSubjects = marks.filter(m => m.grade === 'F').length;
        // Attendance stats
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'present').length;
        const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
        // Group by term
        const termPerformance = this.groupMarksByTerm(marks);
        return {
            studentId,
            summary: {
                totalSubjects,
                averageMarks: averageMarks.toFixed(2),
                passedSubjects,
                failedSubjects,
                attendancePercentage: attendancePercentage.toFixed(2) + '%'
            },
            termPerformance,
            recentMarks: marks.slice(0, 5)
        };
    }
    // Get class performance report
    async getClassPerformanceReport(classId, term, year) {
        // Get all students in class
        const Class = require('../models/Class').default;
        const classData = await Class.findById(classId).populate('students');
        if (!classData) {
            throw new Error("Class not found");
        }
        const studentIds = classData.students.map((s) => s._id);
        // Get marks for all students
        const marks = await Mark_1.default.find({
            studentId: { $in: studentIds },
            term,
            year
        }).populate('subjectId').populate('studentId');
        // Group by student
        const studentPerformance = [];
        const subjectAverages = {};
        for (const studentId of studentIds) {
            const studentMarks = marks.filter(m => m.studentId.toString() === studentId.toString());
            if (studentMarks.length > 0) {
                const total = studentMarks.reduce((sum, m) => sum + m.marksObtained, 0);
                const average = total / studentMarks.length;
                const student = await Student_1.default.findById(studentId).populate('userId');
                studentPerformance.push({
                    studentId,
                    studentName: student?.userId?.name || 'Unknown',
                    average: average.toFixed(2),
                    totalMarks: total,
                    subjects: studentMarks.length,
                    passed: studentMarks.every(m => m.grade !== 'F')
                });
                // Calculate subject averages - FIXED HERE
                for (const mark of studentMarks) {
                    const subjectName = mark.subjectId?.name || 'Unknown';
                    if (!subjectAverages[subjectName]) {
                        subjectAverages[subjectName] = { total: 0, count: 0 };
                    }
                    subjectAverages[subjectName].total += mark.marksObtained;
                    subjectAverages[subjectName].count += 1;
                }
            }
        }
        // Calculate final subject averages
        const subjectStats = Object.keys(subjectAverages).map(subject => ({
            subject,
            average: (subjectAverages[subject].total / subjectAverages[subject].count).toFixed(2)
        }));
        // Sort students by average
        studentPerformance.sort((a, b) => parseFloat(b.average) - parseFloat(a.average));
        return {
            class: classData.name + ' ' + classData.section,
            term,
            year,
            totalStudents: studentPerformance.length,
            topper: studentPerformance[0] || null,
            classAverage: (studentPerformance.reduce((sum, s) => sum + parseFloat(s.average), 0) / studentPerformance.length).toFixed(2),
            studentPerformance,
            subjectAverages: subjectStats
        };
    }
    // Get teacher workload and performance
    async getTeacherPerformance(teacherId) {
        const Subject = require('../models/Subject').default;
        const Class = require('../models/Class').default;
        // Get subjects taught by teacher
        const subjects = await Subject.find({ teacherId });
        // Get classes where teacher is class teacher
        const classes = await Class.find({ classTeacher: teacherId });
        return {
            teacherId,
            subjectsTaught: subjects.length,
            subjects: subjects.map(s => s.name),
            classesManaged: classes.map(c => `${c.name} ${c.section}`),
        };
    }
    // Helper: Group marks by term - FIXED HERE
    groupMarksByTerm(marks) {
        const termMap = new Map();
        for (const mark of marks) {
            const key = `${mark.term} ${mark.year}`;
            if (!termMap.has(key)) {
                termMap.set(key, {
                    term: mark.term,
                    year: mark.year,
                    totalMarks: 0,
                    subjects: []
                });
            }
            const termData = termMap.get(key);
            termData.totalMarks += mark.marksObtained;
            termData.subjects.push({
                subject: mark.subjectId?.name || 'Unknown',
                marks: mark.marksObtained,
                grade: mark.grade
            });
        }
        return Array.from(termMap.values());
    }
    // Get performance trend 
    async getPerformanceTrend(studentId) {
        const marks = await Mark_1.default.find({ studentId: new mongoose_1.Types.ObjectId(studentId) })
            .populate('subjectId')
            .sort({ year: 1, term: 1 });
        const trends = [];
        let cumulative = 0;
        for (const mark of marks) {
            cumulative += mark.marksObtained;
            trends.push({
                date: `${mark.term} ${mark.year}`,
                subject: mark.subjectId?.name || 'Unknown',
                marks: mark.marksObtained,
                grade: mark.grade,
                cumulativeAverage: (cumulative / (trends.length + 1)).toFixed(2)
            });
        }
        return trends;
    }
}
exports.AnalyticsService = AnalyticsService;
/**
 * Simple Topic Analysis Service
 * This analyzes performance by topic/subject
 */
class TopicAnalysisService {
    async analyzeTopicPerformance(studentId) {
        const marks = await Mark_1.default.find({ studentId: new mongoose_1.Types.ObjectId(studentId) })
            .populate('subjectId');
        const subjectAnalysis = {};
        for (const mark of marks) {
            const subjectName = mark.subjectId?.name || 'Unknown';
            const percentage = (mark.marksObtained / mark.totalMarks) * 100;
            if (!subjectAnalysis[subjectName]) {
                subjectAnalysis[subjectName] = {
                    subject: subjectName,
                    scores: [],
                    average: 0
                };
            }
            subjectAnalysis[subjectName].scores.push({
                examType: mark.examType,
                term: mark.term,
                year: mark.year,
                marks: mark.marksObtained,
                total: mark.totalMarks,
                percentage: percentage.toFixed(2),
                grade: mark.grade
            });
        }
        // Calculate averages and identify weak/strong subjects
        const results = [];
        let weakest = { subject: '', score: 101 };
        let strongest = { subject: '', score: -1 };
        for (const subject in subjectAnalysis) {
            const data = subjectAnalysis[subject];
            const avg = data.scores.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / data.scores.length;
            data.average = avg.toFixed(2);
            // Track weakest/strongest
            if (avg < weakest.score) {
                weakest = { subject, score: avg };
            }
            if (avg > strongest.score) {
                strongest = { subject, score: avg };
            }
            results.push({
                subject: data.subject,
                averageScore: data.average,
                status: avg >= 70 ? 'STRONG' : avg >= 50 ? 'AVERAGE' : 'WEAK',
                attempts: data.scores.length
            });
        }
        return {
            studentId,
            summary: {
                weakestSubject: weakest.subject,
                weakestScore: weakest.score.toFixed(2),
                strongestSubject: strongest.subject,
                strongestScore: strongest.score.toFixed(2),
            },
            subjectWise: results
        };
    }
}
exports.TopicAnalysisService = TopicAnalysisService;
/**
 * Simple Attendance Impact Service
 * This analyzes how attendance affects performance
 */
class AttendanceImpactService {
    async analyzeAttendanceImpact(studentId) {
        const studentObjectId = new mongoose_1.Types.ObjectId(studentId);
        // Get attendance by month
        const attendance = await Attendance_1.default.aggregate([
            { $match: { studentId: studentObjectId } },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    presentCount: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
                    totalDays: { $sum: 1 }
                }
            }
        ]);
        // Get marks by month
        const marks = await Mark_1.default.aggregate([
            { $match: { studentId: studentObjectId } },
            {
                $group: {
                    _id: { month: "$month", year: "$year" },
                    avgScore: { $avg: "$marksObtained" }
                }
            }
        ]);
        // Correlate attendance with performance
        const correlation = [];
        let totalEffect = 0;
        let count = 0;
        for (const att of attendance) {
            const markData = marks.find(m => m._id.year === att._id.year && m._id.month === att._id.month);
            const attendanceRate = (att.presentCount / att.totalDays) * 100;
            correlation.push({
                month: this.getMonthName(att._id.month),
                year: att._id.year,
                attendanceRate: attendanceRate.toFixed(2) + '%',
                avgScore: markData?.avgScore?.toFixed(2) || 'No data',
                impact: markData ? this.getImpact(attendanceRate, markData.avgScore) : 'No data'
            });
            if (markData) {
                totalEffect += attendanceRate > 80 ? 1 : -1;
                count++;
            }
        }
        return {
            studentId,
            summary: {
                overallImpact: count > 0 ? (totalEffect > 0 ? 'Positive' : 'Negative') : 'Unknown',
                recommendation: this.getRecommendation(correlation)
            },
            monthlyAnalysis: correlation
        };
    }
    getMonthName(month) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1];
    }
    getImpact(attendanceRate, avgScore) {
        if (attendanceRate >= 85 && avgScore >= 70)
            return 'Excellent - Good attendance leads to good grades';
        if (attendanceRate >= 85 && avgScore < 70)
            return 'Good attendance but needs academic improvement';
        if (attendanceRate < 75 && avgScore < 50)
            return '⚠️ Low attendance affecting grades';
        if (attendanceRate < 75 && avgScore >= 70)
            return 'Good grades despite low attendance';
        return 'Moderate impact';
    }
    getRecommendation(correlation) {
        const lowAttendanceMonths = correlation.filter(c => parseFloat(c.attendanceRate) < 75 && c.avgScore !== 'No data').length;
        if (lowAttendanceMonths > 2) {
            return ' Critical: Improve attendance to boost academic performance';
        }
        else if (lowAttendanceMonths > 0) {
            return 'Attendance needs improvement for better results';
        }
        else {
            return ' Good attendance - maintain this habit';
        }
    }
}
exports.AttendanceImpactService = AttendanceImpactService;
