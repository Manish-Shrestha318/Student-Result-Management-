import { Request, Response } from "express";
import { ExamService } from "../services/examService";

const examService = new ExamService();

export class ExamController {
  
  // Create new exam
  async createExam(req: Request, res: Response): Promise<void> {
    try {
      const { name, examType, term, year, startDate, endDate, classId, subjects } = req.body;
      const createdBy = (req as any).user.id;

      // Validate required fields
      if (!name || !examType || !term || !year || !startDate || !endDate || !classId || !subjects) {
        res.status(400).json({
          success: false,
          message: "Missing required fields"
        });
        return;
      }

      const exam = await examService.createExam({
        name,
        examType,
        term,
        year: parseInt(year),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        classId,
        subjects,
        createdBy
      });

      res.status(201).json({
        success: true,
        message: "Exam created successfully",
        data: exam
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get exams by class
  async getExamsByClass(req: Request, res: Response): Promise<void> {
    try {
      const { classId } = req.params;
      const { term, year } = req.query;

      if (!classId) {
        res.status(400).json({
          success: false,
          message: "Class ID is required"
        });
        return;
      }

      const exams = await examService.getExamsByClass(
        classId as any,
        term as string,
        year ? parseInt(year as string) : undefined
      );

      res.json({
        success: true,
        data: exams
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get upcoming exams
  async getUpcomingExams(req: Request, res: Response): Promise<void> {
    try {
      const exams = await examService.getUpcomingExams();

      res.json({
        success: true,
        data: exams
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get exam by ID
  async getExamById(req: Request, res: Response): Promise<void> {
    try {
      const { examId } = req.params;

      const exam = await examService.getExamById(examId);

      if (!exam) {
        res.status(404).json({
          success: false,
          message: "Exam not found"
        });
        return;
      }

      res.json({
        success: true,
        data: exam
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update exam
  async updateExam(req: Request, res: Response): Promise<void> {
    try {
      const { examId } = req.params;
      const updates = req.body;

      const exam = await examService.updateExam(examId, updates);

      if (!exam) {
        res.status(404).json({
          success: false,
          message: "Exam not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Exam updated successfully",
        data: exam
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete exam
  async deleteExam(req: Request, res: Response): Promise<void> {
    try {
      const { examId } = req.params;

      const deleted = await examService.deleteExam(examId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Exam not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Exam deleted successfully"
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update exam status (cron job)
  async updateExamStatuses(req: Request, res: Response): Promise<void> {
    try {
      await examService.updateExamStatus();

      res.json({
        success: true,
        message: "Exam statuses updated"
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}