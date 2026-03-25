import { Request, Response } from "express";
import { AnalyticsService, TopicAnalysisService, AttendanceImpactService } from "../services/analyticsService";

const analyticsService = new AnalyticsService();
const topicAnalysisService = new TopicAnalysisService();
const attendanceImpactService = new AttendanceImpactService();


export const getStudentPerformance = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const data = await analyticsService.getStudentPerformanceSummary(studentId as any);
    
    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getClassPerformance = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { term, year } = req.query;

    if (!term || !year) {
      return res.status(400).json({
        success: false,
        message: "Term and year are required"
      });
    }

    const data = await analyticsService.getClassPerformanceReport(
      classId as any,
      term as string,
      parseInt(year as string)
    );

    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getTeacherPerformance = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;
    const data = await analyticsService.getTeacherPerformance(teacherId as any);

    res.json({
      success: true,
      data
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
    const data = await analyticsService.getPerformanceTrend(studentId as any);

    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


/**
 * NEW: Get subject-wise analysis (strengths & weaknesses)
 * This tells you which subjects the student is strong/weak in
 */
export const getSubjectWiseAnalysis = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required"
      });
    }

    const data = await topicAnalysisService.analyzeTopicPerformance(studentId as any);

    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * NEW: Get attendance impact analysis
 * This shows how attendance affects student's grades
 */
export const getAttendanceImpact = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required"
      });
    }

    const data = await attendanceImpactService.analyzeAttendanceImpact(studentId as any);

    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get comprehensive student report
 * Combines performance, subject analysis, and attendance impact
 */
export const getComprehensiveStudentReport = async (req: Request, res: Response) => {
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
      analyticsService.getStudentPerformanceSummary(studentId as any),
      topicAnalysisService.analyzeTopicPerformance(studentId as any),
      attendanceImpactService.analyzeAttendanceImpact(studentId as any)
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * NEW: Compare two students
 */
export const compareStudents = async (req: Request, res: Response) => {
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
      topicAnalysisService.analyzeTopicPerformance(studentId1 as any),
      topicAnalysisService.analyzeTopicPerformance(studentId2 as any)
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};