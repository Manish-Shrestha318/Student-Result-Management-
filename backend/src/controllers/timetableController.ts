import { Request, Response } from "express";
import { TimetableService } from "../services/timetableService";

const timetableService = new TimetableService();

export class TimetableController {
  
  // Create timetable
  async createTimetable(req: Request, res: Response): Promise<void> {
    try {
      const { classId, day, periods, academicYear, term } = req.body;
      const createdBy = (req as any).user.id;

      if (!classId || !day || !periods || !academicYear || !term) {
        res.status(400).json({
          success: false,
          message: "Missing required fields"
        });
        return;
      }

      const timetable = await timetableService.createTimetable({
        classId,
        day,
        periods,
        academicYear,
        term,
        createdBy
      });

      res.status(201).json({
        success: true,
        message: "Timetable created successfully",
        data: timetable
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get class timetable
  async getClassTimetable(req: Request, res: Response): Promise<void> {
    try {
      const { classId } = req.params;
      const { day, academicYear, term } = req.query;

      if (!classId) {
        res.status(400).json({
          success: false,
          message: "Class ID is required"
        });
        return;
      }

      const timetable = await timetableService.getClassTimetable(
        classId as any,
        day as string,
        academicYear as string,
        term as string
      );

      res.json({
        success: true,
        data: timetable
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get teacher timetable
  async getTeacherTimetable(req: Request, res: Response): Promise<void> {
    try {
      const { teacherId } = req.params;
      const { academicYear, term } = req.query;

      if (!teacherId) {
        res.status(400).json({
          success: false,
          message: "Teacher ID is required"
        });
        return;
      }

      const timetable = await timetableService.getTeacherTimetable(
        teacherId as any,
        academicYear as string,
        term as string
      );

      res.json({
        success: true,
        data: timetable
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update timetable
  async updateTimetable(req: Request, res: Response): Promise<void> {
    try {
      const { timetableId } = req.params;
      const updates = req.body;

      const timetable = await timetableService.updateTimetable(timetableId as any, updates);

      if (!timetable) {
        res.status(404).json({
          success: false,
          message: "Timetable not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Timetable updated",
        data: timetable
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete timetable
  async deleteTimetable(req: Request, res: Response): Promise<void> {
    try {
      const { timetableId } = req.params;

      const deleted = await timetableService.deleteTimetable(timetableId as any);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Timetable not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Timetable deleted"
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get today's timetable
  async getTodaysTimetable(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { academicYear, term } = req.query;

      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const today = days[new Date().getDay()];

      let timetable = [];

      if (user.role === 'teacher') {
        timetable = await timetableService.getTeacherTimetable(
          user.id,
          academicYear as string,
          term as string
        );
      } else if (user.role === 'student') {
        const Student = require('../models/Student').default;
        const student = await Student.findOne({ userId: user.id });
        if (student) {
          timetable = await timetableService.getClassTimetable(
            student.class.toString(),
            today,
            academicYear as string,
            term as string
          );
        }
      }

      res.json({
        success: true,
        data: timetable
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}