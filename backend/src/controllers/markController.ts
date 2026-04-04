import { Request, Response } from "express";
import { MarkService } from "../services/markService";

const markService = new MarkService();

export const enterMarks = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getStudentMarks = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const user = (req as any).user;

    // Resolve student ID
    const { AnalyticsService } = require("../services/analyticsService");
    const analyticsService = new AnalyticsService();
    const resolvedStudentId = await analyticsService.resolveStudentProfileId(studentId);

    // Authorization check: Admin and Teacher can view any student's marks. 
    // Students and Parents can only view their own data.
    if (user.role === "student" || user.role === "parent") {
       const userStudentId = await analyticsService.resolveStudentProfileId(user.id);
       if (userStudentId.toString() !== resolvedStudentId.toString()) {
         return res.status(403).json({ success: false, message: "Forbidden: You can only view your own marks" });
       }
    }

    const marks = await markService.getMarksByStudent(resolvedStudentId.toString());
    
    res.json({ 
      success: true, 
      data: marks 
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { studentId, term, year } = req.query;
    
    if (!studentId || !term || !year) {
      return res.status(400).json({
        success: false,
        message: "studentId, term, and year are required"
      });
    }

    const report = await markService.generateStudentReport({
      studentId: studentId as string,
      term: term as string,
      year: parseInt(year as string)
    });
    
    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateMarks = async (req: Request, res: Response) => {
  try {
    const { markId } = req.params;
    const updatedMark = await markService.updateMark(markId as any, req.body);
    
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteMarks = async (req: Request, res: Response) => {
  try {
    const { markId } = req.params;
    const deletedMark = await markService.deleteMark(markId as any);
    
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getPerformanceTrend = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const user = (req as any).user;

    // Resolve student ID
    const { AnalyticsService } = require("../services/analyticsService");
    const analyticsService = new AnalyticsService();
    const resolvedStudentId = await analyticsService.resolveStudentProfileId(studentId);

    // Authorization check
    if (user.role === "student" || user.role === "parent") {
       const userStudentId = await analyticsService.resolveStudentProfileId(user.id);
       if (userStudentId.toString() !== resolvedStudentId.toString()) {
         return res.status(403).json({ success: false, message: "Forbidden: You can only view your own trends" });
       }
    }

    const trends = await markService.getPerformanceTrend(resolvedStudentId.toString());
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};