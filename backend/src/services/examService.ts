import Exam, { IExam } from "../models/Exam";
import { Types } from "mongoose";

interface CreateExamDTO {
  name: string;
  examType: string;
  term: string;
  year: number;
  startDate: Date;
  endDate: Date;
  classId: string;
  subjects: Array<{
    subjectId: string;
    fullMarks: number;
    passMarks: number;
    date: Date;
  }>;
  createdBy: string;
}

export class ExamService {
  [x: string]: any;
  
  async createExam(data: CreateExamDTO): Promise<IExam> {
    const examData = {
      ...data,
      classId: new Types.ObjectId(data.classId),
      subjects: data.subjects.map(s => ({
        ...s,
        subjectId: new Types.ObjectId(s.subjectId)
      })),
      createdBy: new Types.ObjectId(data.createdBy)
    };

    const exam = await Exam.create(examData);
    return exam;
  }

  async getExamsByClass(classId: string, term?: string, year?: number): Promise<IExam[]> {
    const query: any = { classId: new Types.ObjectId(classId) };
    if (term) query.term = term;
    if (year) query.year = year;

    return await Exam.find(query)
      .populate('subjects.subjectId')
      .sort({ startDate: -1 });
  }

  async getUpcomingExams(): Promise<IExam[]> {
    const today = new Date();
    return await Exam.find({
      startDate: { $gte: today },
      status: "upcoming"
    }).populate('classId').sort({ startDate: 1 });
  }

  async updateExamStatus(): Promise<void> {
    const today = new Date();
    
    // Update to ongoing
    await Exam.updateMany({
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: "upcoming"
    }, { status: "ongoing" });

    // Update to completed
    await Exam.updateMany({
      endDate: { $lt: today },
      status: "ongoing"
    }, { status: "completed" });
  }
}