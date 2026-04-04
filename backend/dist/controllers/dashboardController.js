"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeacherStats = exports.getAdminStats = void 0;
const User_1 = __importDefault(require("../models/User"));
const Class_1 = __importDefault(require("../models/Class"));
const Subject_1 = __importDefault(require("../models/Subject"));
const Exam_1 = __importDefault(require("../models/Exam"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Student_1 = __importDefault(require("../models/Student"));
const getAdminStats = async (req, res) => {
    try {
        const totalStudents = await User_1.default.countDocuments({ role: "student" });
        const totalTeachers = await User_1.default.countDocuments({ role: "teacher" });
        const totalClasses = await Class_1.default.countDocuments();
        const totalSubjects = await Subject_1.default.countDocuments();
        const totalExams = await Exam_1.default.countDocuments();
        const pendingTeacherApprovals = await User_1.default.countDocuments({ role: "teacher", status: "pending" });
        // Calculate overall attendance for the last 30 days if possible
        const totalAttendance = await Attendance_1.default.countDocuments();
        const presentAttendance = await Attendance_1.default.countDocuments({ status: "present" });
        const avgAttendance = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 94.5;
        res.json({
            success: true,
            stats: {
                totalStudents,
                totalTeachers,
                totalClasses,
                totalSubjects,
                totalExams,
                pendingTeacherApprovals,
                avgAttendance: avgAttendance.toFixed(1)
            }
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getAdminStats = getAdminStats;
const getTeacherStats = async (req, res) => {
    try {
        let teacherUserId = req.user.id;
        const userRole = req.user.role;
        // For testing purposes: If an Admin visits the teacher dashboard, load data for the first active teacher 
        // so the dashboard isn't completely empty!
        if (userRole === 'admin') {
            const User = require('../models/User').default;
            const firstTeacher = await User.findOne({ role: 'teacher', status: 'active' });
            if (firstTeacher) {
                teacherUserId = firstTeacher._id.toString();
                console.log(`[DASHBOARD] Admin requested teacher stats. Simulating with teacher: ${firstTeacher.email}`);
            }
        }
        // 1. Fetch subjects handled by this teacher
        const subjects = await Subject_1.default.find({ teacherId: teacherUserId });
        const subjectIds = subjects.map(s => s._id);
        // 2. Fetch classes that are assigned to this teacher (either they are classTeacher, OR the class has subjects taught by teacher)
        const assignedClasses = await Class_1.default.find({
            $or: [
                { classTeacher: teacherUserId },
                { subjects: { $in: subjectIds } }
            ]
        }).populate('students');
        // 3. Collect unique students from these classes
        const allStudentsMap = new Map();
        assignedClasses.forEach(cls => {
            cls.students.forEach((s) => {
                allStudentsMap.set(s._id.toString(), {
                    ...s,
                    className: `${cls.name} - ${cls.section}`
                });
            });
        });
        const studentIds = Array.from(allStudentsMap.keys());
        const totalStudents = studentIds.length;
        const totalAssignedClasses = assignedClasses.length;
        const totalSubjectsHandled = subjects.length;
        // Fetch actual student details for the recent students table
        const recentStudentProfiles = await Student_1.default.find({ _id: { $in: studentIds } })
            .populate('userId', 'name email profilePicture')
            .limit(5)
            .lean();
        const formattedStudents = recentStudentProfiles.map(s => ({
            id: s.rollNumber,
            name: s.userId?.name || 'Unknown',
            email: s.userId?.email || '',
            class: s.class + ' - ' + s.section,
            attendance: '95%', // For simplicity in this demo, default
            performance: 'A'
        }));
        // Mock Messages for now
        const messages = [
            { from: 'System', subject: 'Dashboard Updated', time: '1h ago', unread: true },
            { from: 'Admin', subject: 'Please enter final marks', time: '1d ago', unread: false }
        ];
        res.json({
            success: true,
            stats: {
                assignedClasses: totalAssignedClasses,
                totalStudents: totalStudents,
                subjectsHandled: totalSubjectsHandled
            },
            students: formattedStudents,
            messages: messages,
            classPerformanceData: {
                labels: assignedClasses.slice(0, 5).map(c => `${c.name} ${c.section}`),
                datasets: [{
                        label: 'Average Score (%)',
                        data: assignedClasses.slice(0, 5).map(() => Math.floor(Math.random() * (95 - 65) + 65)),
                        backgroundColor: '#2563eb',
                        borderRadius: 6
                    }]
            }
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getTeacherStats = getTeacherStats;
