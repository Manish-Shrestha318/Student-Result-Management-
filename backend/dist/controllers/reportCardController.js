"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewReportCard = exports.emailReportCard = exports.generateBulkReportCards = exports.getReportCardData = exports.generateReportCard = void 0;
const reportCardService_1 = require("../services/reportCardService");
const reportCardService = new reportCardService_1.ReportCardService();
// Generate report card as PDF
const generateReportCard = async (req, res) => {
    try {
        const studentId = req.query.studentId;
        const term = req.query.term;
        const yearStr = req.query.year;
        if (!studentId || !term || !yearStr) {
            return res.status(400).json({
                success: false,
                message: "studentId, term, and year are required"
            });
        }
        const year = parseInt(yearStr);
        if (isNaN(year)) {
            return res.status(400).json({
                success: false,
                message: "Year must be a valid number"
            });
        }
        const pdfBuffer = await reportCardService.generateReportCard(studentId, term, year);
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-card-${studentId}-${term}-${year}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        // Send PDF
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error("Error generating report card:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to generate report card"
        });
    }
};
exports.generateReportCard = generateReportCard;
// Generate report card as JSON (for preview)
const getReportCardData = async (req, res) => {
    try {
        const studentId = req.query.studentId;
        const term = req.query.term;
        const yearStr = req.query.year;
        if (!studentId || !term || !yearStr) {
            return res.status(400).json({
                success: false,
                message: "studentId, term, and year are required"
            });
        }
        const year = parseInt(yearStr);
        if (isNaN(year)) {
            return res.status(400).json({
                success: false,
                message: "Year must be a valid number"
            });
        }
        const data = await reportCardService.getReportCardData(studentId, term, year);
        res.json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error("Error getting report card data:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to get report card data"
        });
    }
};
exports.getReportCardData = getReportCardData;
// Generate report card for multiple students (bulk)
const generateBulkReportCards = async (req, res) => {
    try {
        const { classId, term, year: yearStr } = req.body;
        if (!classId || !term || !yearStr) {
            return res.status(400).json({
                success: false,
                message: "classId, term, and year are required"
            });
        }
        const year = parseInt(yearStr);
        if (isNaN(year)) {
            return res.status(400).json({
                success: false,
                message: "Year must be a valid number"
            });
        }
        const zipBuffer = await reportCardService.generateBulkReportCards(classId, term, year);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=report-cards-class-${classId}-${term}-${year}.zip`);
        res.setHeader('Content-Length', zipBuffer.length);
        res.send(zipBuffer);
    }
    catch (error) {
        console.error("Error generating bulk report cards:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to generate bulk report cards"
        });
    }
};
exports.generateBulkReportCards = generateBulkReportCards;
// Email report card to parent
const emailReportCard = async (req, res) => {
    try {
        const { studentId, term, year: yearStr, parentEmail } = req.body;
        if (!studentId || !term || !yearStr || !parentEmail) {
            return res.status(400).json({
                success: false,
                message: "studentId, term, year, and parentEmail are required"
            });
        }
        const year = parseInt(yearStr);
        if (isNaN(year)) {
            return res.status(400).json({
                success: false,
                message: "Year must be a valid number"
            });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(parentEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        await reportCardService.emailReportCard(studentId, term, year, parentEmail);
        res.json({
            success: true,
            message: "Report card emailed successfully"
        });
    }
    catch (error) {
        console.error("Error emailing report card:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to email report card"
        });
    }
};
exports.emailReportCard = emailReportCard;
// Preview report card in browser (HTML)
const previewReportCard = async (req, res) => {
    try {
        const studentId = req.query.studentId;
        const term = req.query.term;
        const yearStr = req.query.year;
        if (!studentId || !term || !yearStr) {
            return res.status(400).json({
                success: false,
                message: "studentId, term, and year are required"
            });
        }
        const year = parseInt(yearStr);
        if (isNaN(year)) {
            return res.status(400).json({
                success: false,
                message: "Year must be a valid number"
            });
        }
        const data = await reportCardService.getReportCardData(studentId, term, year);
        // Generate simple HTML preview
        const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report Card Preview</title>
      <style>
        body { font-family: Arial; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .student-info { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #4CAF50; color: white; }
        .summary { background: #e8f5e9; padding: 20px; border-radius: 5px; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>School Result Making & Tracking System</h1>
        <h2>Student Report Card</h2>
      </div>
      
      <div class="student-info">
        <h3>Student Details</h3>
        <p><strong>Name:</strong> ${data.student.name}</p>
        <p><strong>Roll Number:</strong> ${data.student.rollNumber}</p>
        <p><strong>Class:</strong> ${data.student.class} ${data.student.section}</p>
        <p><strong>Term:</strong> ${data.academicDetails.term} ${data.academicDetails.year}</p>
      </div>

      <h3>Marks Sheet</h3>
      <table>
        <tr>
          <th>Subject</th>
          <th>Marks Obtained</th>
          <th>Total Marks</th>
          <th>Percentage</th>
          <th>Grade</th>
          <th>Remarks</th>
        </tr>
        ${data.marks.map((m) => `
        <tr>
          <td>${m.subject}</td>
          <td>${m.marksObtained}</td>
          <td>${m.totalMarks}</td>
          <td>${m.percentage}%</td>
          <td>${m.grade}</td>
          <td>${m.remarks}</td>
        </tr>
        `).join('')}
      </table>

      <div class="summary">
        <h3>Performance Summary</h3>
        <p><strong>Total Marks Obtained:</strong> ${data.summary.totalMarksObtained}</p>
        <p><strong>Total Marks:</strong> ${data.summary.totalMarks}</p>
        <p><strong>Overall Percentage:</strong> ${data.summary.overallPercentage}%</p>
        <p><strong>Overall Grade:</strong> ${data.summary.overallGrade}</p>
        <p><strong>Attendance:</strong> ${data.summary.attendance}</p>
        <p><strong>Final Result:</strong> <span class="${data.summary.result === 'PASS' ? 'pass' : 'fail'}">${data.summary.result}</span></p>
      </div>
      
      <p style="text-align: center; margin-top: 40px; color: #666;">
        Generated on: ${new Date(data.generatedOn).toLocaleString()}
      </p>
    </body>
    </html>
    `;
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    }
    catch (error) {
        console.error("Error previewing report card:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to preview report card"
        });
    }
};
exports.previewReportCard = previewReportCard;
