import { Request, Response } from "express";
import { AttendanceService } from "../services/attendanceService";
import { AnalyticsService } from "../services/analyticsService";

const attendanceService = new AttendanceService();
const analyticsService = new AnalyticsService();

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { studentId, date, status, subjectId, remarks } = req.body;
    const markedBy = (req as any).user.id;

    if (status === 'normal') {
      await attendanceService.removeAttendance(studentId, new Date(date));
      return res.status(200).json({
        success: true,
        message: "Attendance cleared"
      });
    }

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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Resolve student profile ID from userId or studentId
    const resolvedStudentId = await analyticsService.resolveStudentProfileId(studentId as string);

    const attendance = await attendanceService.getAttendanceByStudent(
      resolvedStudentId.toString(),
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data: attendance
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAttendanceReport = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;

    const resolvedStudentId = await analyticsService.resolveStudentProfileId(String(studentId));

    if (month && year) {
      const parsedMonth = parseInt(String(month));
      const parsedYear = parseInt(String(year));
      
      const report = await attendanceService.getAttendanceReport(
        resolvedStudentId.toString(),
        parsedMonth,
        parsedYear
      );
      return res.json({ success: true, data: report });
    }

    const report = await attendanceService.getAttendanceReport(
      resolvedStudentId.toString()
    );

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