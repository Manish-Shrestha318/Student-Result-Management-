import { Request, Response } from "express";
import { AttendanceService } from "../services/attendanceService";
import { AnalyticsService } from "../services/analyticsService";

const attendanceService = new AttendanceService();
const analyticsService = new AnalyticsService();

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { studentId, date, status, subjectId, remarks } = req.body;
    const markedBy = (req as any).user.id;

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

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required"
      });
    }

    const resolvedStudentId = await analyticsService.resolveStudentProfileId(String(studentId));

    const report = await attendanceService.getAttendanceReport(
      resolvedStudentId.toString(),
      parseInt(String(month)),
      parseInt(String(year))
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