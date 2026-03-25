"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportCardService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const Mark_1 = __importDefault(require("../models/Mark"));
const Student_1 = __importDefault(require("../models/Student"));
const mongoose_1 = require("mongoose");
const analyticsService_1 = require("./analyticsService");
const jszip_1 = __importDefault(require("jszip"));
class ReportCardService {
    analyticsService;
    constructor() {
        this.analyticsService = new analyticsService_1.AnalyticsService();
    }
    // Generate report card as PDF
    async generateReportCard(studentId, term, year) {
        try {
            // Get student data
            const student = await Student_1.default.findById(studentId).populate('userId');
            if (!student) {
                throw new Error("Student not found");
            }
            // Get marks
            const marks = await Mark_1.default.find({
                studentId: new mongoose_1.Types.ObjectId(studentId),
                term,
                year
            }).populate('subjectId');
            if (marks.length === 0) {
                throw new Error("No marks found for this term");
            }
            // Get performance summary
            const performance = await this.analyticsService.getStudentPerformanceSummary(studentId);
            // Create PDF document
            const doc = new pdfkit_1.default({
                margin: 50,
                size: 'A4',
                layout: 'portrait'
            });
            const buffers = [];
            // Collect PDF data
            doc.on('data', (chunk) => buffers.push(chunk));
            return new Promise((resolve, reject) => {
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });
                doc.on('error', reject);
                try {
                    // Generate PDF content
                    this.generatePDFContent(doc, student, marks, performance, term, year);
                    doc.end();
                }
                catch (error) {
                    reject(error);
                }
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Get report card data as JSON (for preview)
    async getReportCardData(studentId, term, year) {
        const student = await Student_1.default.findById(studentId).populate('userId');
        if (!student) {
            throw new Error("Student not found");
        }
        const marks = await Mark_1.default.find({
            studentId: new mongoose_1.Types.ObjectId(studentId),
            term,
            year
        }).populate('subjectId');
        if (marks.length === 0) {
            throw new Error("No marks found for this term");
        }
        const performance = await this.analyticsService.getStudentPerformanceSummary(studentId);
        const marksData = marks.map(m => ({
            subject: m.subjectId?.name || 'Unknown',
            subjectCode: m.subjectId?.code || 'N/A',
            marksObtained: m.marksObtained,
            totalMarks: m.totalMarks,
            percentage: ((m.marksObtained / m.totalMarks) * 100).toFixed(2),
            grade: m.grade || 'N/A',
            remarks: m.remarks || '-'
        }));
        const totalMarks = marks.reduce((sum, m) => sum + m.marksObtained, 0);
        const totalPossible = marks.reduce((sum, m) => sum + m.totalMarks, 0);
        const overallPercentage = (totalMarks / totalPossible) * 100;
        const passed = marks.every(m => m.grade !== 'F');
        return {
            student: {
                name: student.userId?.name || 'Unknown',
                rollNumber: student.rollNumber,
                class: student.class,
                section: student.section,
                parentName: student.parentName
            },
            academicDetails: {
                term,
                year,
                totalSubjects: marks.length
            },
            marks: marksData,
            summary: {
                totalMarksObtained: totalMarks,
                totalMarks: totalPossible,
                overallPercentage: overallPercentage.toFixed(2),
                overallGrade: this.calculateOverallGrade(overallPercentage),
                result: passed ? 'PASS' : 'FAIL',
                attendance: performance.summary?.attendancePercentage || 'N/A'
            },
            generatedOn: new Date().toISOString()
        };
    }
    // Generate bulk report cards for a class
    async generateBulkReportCards(classId, term, year) {
        try {
            const Class = require('../models/Class').default;
            const zip = new jszip_1.default();
            const classData = await Class.findById(classId).populate('students');
            if (!classData) {
                throw new Error("Class not found");
            }
            const students = classData.students || [];
            if (students.length === 0) {
                throw new Error("No students found in this class");
            }
            for (const student of students) {
                try {
                    const pdfBuffer = await this.generateReportCard(student._id.toString(), term, year);
                    zip.file(`report-card-${student.rollNumber || student._id}.pdf`, pdfBuffer);
                }
                catch (error) {
                    console.error(`Failed to generate report for student ${student._id}:`, error);
                    // Add error file for failed generations
                    zip.file(`error-${student._id}.txt`, `Failed to generate report: ${error.message}`);
                }
            }
            return await zip.generateAsync({ type: 'nodebuffer' });
        }
        catch (error) {
            throw error;
        }
    }
    // Email report card (placeholder - requires nodemailer setup)
    async emailReportCard(studentId, term, year, parentEmail) {
        const pdfBuffer = await this.generateReportCard(studentId, term, year);
        console.log(`📧 Email would be sent to ${parentEmail}`);
        console.log(`📎 PDF attachment size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
        // TODO: Implement actual email sending with nodemailer
        // const transporter = nodemailer.createTransport({
        //   host: process.env.EMAIL_HOST,
        //   port: parseInt(process.env.EMAIL_PORT || '587'),
        //   secure: false,
        //   auth: {
        //     user: process.env.EMAIL_USER,
        //     pass: process.env.EMAIL_PASS
        //   }
        // });
        // 
        // await transporter.sendMail({
        //   from: '"School System" <noreply@school.com>',
        //   to: parentEmail,
        //   subject: `Report Card - Term ${term} ${year}`,
        //   text: `Please find attached the report card for your child.`,
        //   attachments: [{
        //     filename: `report-card-${studentId}.pdf`,
        //     content: pdfBuffer
        //   }]
        // });
    }
    // Generate PDF content
    generatePDFContent(doc, student, marks, performance, term, year) {
        try {
            // School Header
            doc.fontSize(22)
                .font('Helvetica-Bold')
                .text('School Result Making & Tracking System', { align: 'center' })
                .moveDown(0.5);
            doc.fontSize(18)
                .text('Student Report Card', { align: 'center' })
                .moveDown(1);
            // Draw line
            doc.moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke()
                .moveDown(1);
            // Student Details in two columns
            const startY = doc.y;
            doc.fontSize(11)
                .font('Helvetica-Bold')
                .text('Student Details:', 50, startY)
                .font('Helvetica');
            doc.text(`Name: ${student.userId?.name || 'Unknown'}`, 70, startY + 20);
            doc.text(`Roll Number: ${student.rollNumber}`, 70, startY + 35);
            doc.text(`Class: ${student.class} ${student.section}`, 70, startY + 50);
            doc.text(`Term: ${term} ${year}`, 300, startY + 20);
            doc.text(`Parent: ${student.parentName || 'N/A'}`, 300, startY + 35);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 300, startY + 50);
            doc.moveDown(5);
            // Marks Table
            const tableTop = doc.y;
            const col1 = 50;
            const col2 = 200;
            const col3 = 300;
            const col4 = 380;
            const col5 = 450;
            // Table Header
            doc.font('Helvetica-Bold')
                .fontSize(10)
                .text('Subject', col1, tableTop)
                .text('Marks', col2, tableTop)
                .text('Total', col3, tableTop)
                .text('Percentage', col4, tableTop)
                .text('Grade', col5, tableTop);
            doc.font('Helvetica');
            // Draw header line
            doc.moveTo(50, tableTop + 15)
                .lineTo(550, tableTop + 15)
                .stroke();
            let y = tableTop + 25;
            // Table Rows
            marks.forEach((mark, index) => {
                const subject = mark.subjectId?.name || 'Unknown';
                const percentage = ((mark.marksObtained / mark.totalMarks) * 100).toFixed(1);
                doc.text(subject.substring(0, 20), col1, y)
                    .text(mark.marksObtained.toString(), col2, y)
                    .text(mark.totalMarks.toString(), col3, y)
                    .text(percentage + '%', col4, y)
                    .text(mark.grade || 'N/A', col5, y);
                y += 20;
                // Add new page if needed
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
            });
            // Draw table bottom line
            doc.moveTo(50, y - 5)
                .lineTo(550, y - 5)
                .stroke();
            doc.moveDown(2);
            // Summary Section
            const summaryY = y + 20;
            doc.font('Helvetica-Bold')
                .fontSize(12)
                .text('Performance Summary', 50, summaryY);
            doc.font('Helvetica')
                .fontSize(10);
            let summaryX = 70;
            let summaryY2 = summaryY + 20;
            doc.text(`Total Subjects: ${marks.length}`, 50, summaryY2);
            doc.text(`Total Marks: ${marks.reduce((sum, m) => sum + m.marksObtained, 0)}`, 200, summaryY2);
            doc.text(`Average: ${(marks.reduce((sum, m) => sum + m.marksObtained, 0) / marks.length).toFixed(2)}`, 350, summaryY2);
            summaryY2 += 20;
            doc.text(`Passed Subjects: ${marks.filter(m => m.grade !== 'F').length}`, 50, summaryY2);
            doc.text(`Failed Subjects: ${marks.filter(m => m.grade === 'F').length}`, 200, summaryY2);
            doc.text(`Attendance: ${performance.summary?.attendancePercentage || 'N/A'}`, 350, summaryY2);
            summaryY2 += 30;
            // Final Result
            const passed = marks.every(m => m.grade !== 'F');
            doc.font('Helvetica-Bold')
                .fontSize(14)
                .text(`FINAL RESULT: ${passed ? 'PASS' : 'FAIL'}`, 50, summaryY2, { align: 'center', width: 500 });
            summaryY2 += 30;
            // Overall Grade
            const overallPercentage = (marks.reduce((sum, m) => sum + m.marksObtained, 0) /
                marks.reduce((sum, m) => sum + m.totalMarks, 0)) * 100;
            doc.fontSize(12)
                .text(`Overall Grade: ${this.calculateOverallGrade(overallPercentage)}`, 50, summaryY2, { align: 'center', width: 500 });
            // Footer
            doc.fontSize(8)
                .font('Helvetica-Oblique')
                .text('This is a computer generated document. No signature required.', 50, 750, { align: 'center', width: 500 });
        }
        catch (error) {
            console.error("Error generating PDF content:", error);
            throw error;
        }
    }
    // Calculate overall grade
    calculateOverallGrade(percentage) {
        if (percentage >= 90)
            return 'A+';
        if (percentage >= 80)
            return 'A';
        if (percentage >= 70)
            return 'B+';
        if (percentage >= 60)
            return 'B';
        if (percentage >= 50)
            return 'C+';
        if (percentage >= 40)
            return 'C';
        return 'F';
    }
}
exports.ReportCardService = ReportCardService;
