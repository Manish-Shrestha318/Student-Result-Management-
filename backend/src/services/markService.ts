import Mark, { IMark } from "../models/Mark";
import Student from "../models/Student";
import Subject from "../models/Subject";
import { calculateGrade, calculateOverallGrade, calculatePercentage } from "../utils/gradeCalculator";
import { 
  MarkEntryDTO, 
  ReportQueryDTO, 
  StudentReport, 
  PerformanceTrend,
  SubjectResult 
} from "../types/markType";
import { Types } from "mongoose";

export class MarkService {
  
  // Create new mark entry
  async createMark(data: MarkEntryDTO): Promise<IMark> {
    // Convert string IDs to ObjectIds
    const studentObjectId = new Types.ObjectId(data.studentId);
    const subjectObjectId = new Types.ObjectId(data.subjectId);

    // Check if student exists
    const student = await Student.findById(studentObjectId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Check if subject exists
    const subject = await Subject.findById(subjectObjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    // Check for duplicate entry
    const existingMark = await Mark.findOne({
      studentId: studentObjectId,
      subjectId: subjectObjectId,
      examType: data.examType,
      term: data.term,
      year: data.year
    });

    if (existingMark) {
      throw new Error("Marks already entered for this subject and exam");
    }

    // Validate marks
    if (data.marksObtained > data.totalMarks) {
      throw new Error("Marks obtained cannot exceed total marks");
    }

    // Calculate grade automatically
    const grade = calculateGrade(data.marksObtained, data.totalMarks);

    // Create mark with ObjectIds
    const markData = {
      studentId: studentObjectId,
      subjectId: subjectObjectId,
      examType: data.examType,
      marksObtained: data.marksObtained,
      totalMarks: data.totalMarks,
      term: data.term,
      year: data.year,
      remarks: data.remarks,
      grade
    };
    
    const mark = await Mark.create(markData);
    return await mark.populate('subjectId');
  }

  // Get marks by student
  async getMarksByStudent(studentId: string): Promise<IMark[]> {
    const studentObjectId = new Types.ObjectId(studentId);
    const marks = await Mark.find({ studentId: studentObjectId })
      .populate('subjectId')
      .sort({ year: -1, term: 1, createdAt: -1 });
    
    return marks;
  }

  // Get marks by student and term
  async getMarksByStudentAndTerm(studentId: string, term: string, year: number): Promise<IMark[]> {
    const studentObjectId = new Types.ObjectId(studentId);
    const marks = await Mark.find({
      studentId: studentObjectId,
      term,
      year
    }).populate('subjectId');
    
    return marks;
  }

  // Update mark entry
  async updateMark(markId: string, data: Partial<MarkEntryDTO>): Promise<IMark | null> {
    const mark = await Mark.findById(markId);
    if (!mark) {
      throw new Error("Mark entry not found");
    }

    // Build update object properly
    const updateData: any = {};
    
    // Only add fields that are provided
    if (data.examType) updateData.examType = data.examType;
    if (data.term) updateData.term = data.term;
    if (data.year) updateData.year = data.year;
    if (data.remarks !== undefined) updateData.remarks = data.remarks;
    
    // Handle marks with grade recalculation
    if (data.marksObtained !== undefined || data.totalMarks !== undefined) {
      const marksObtained = data.marksObtained ?? mark.marksObtained;
      const totalMarks = data.totalMarks ?? mark.totalMarks;
      
      updateData.marksObtained = marksObtained;
      updateData.totalMarks = totalMarks;
      updateData.grade = calculateGrade(marksObtained, totalMarks);
    }
    
    // Handle ID conversions if provided
    if (data.studentId) {
      updateData.studentId = new Types.ObjectId(data.studentId);
    }
    
    if (data.subjectId) {
      updateData.subjectId = new Types.ObjectId(data.subjectId);
    }

    const updatedMark = await Mark.findByIdAndUpdate(
      markId,
      updateData,
      { new: true, runValidators: true }
    ).populate('subjectId');

    return updatedMark;
  }

  // Delete mark entry
  async deleteMark(markId: string): Promise<IMark | null> {
    const mark = await Mark.findByIdAndDelete(markId);
    return mark;
  }

  // Generate student report
  async generateStudentReport(query: ReportQueryDTO): Promise<StudentReport> {
    const { studentId, term, year } = query;
    const studentObjectId = new Types.ObjectId(studentId);

    // Get student details
    const student = await Student.findById(studentObjectId).populate('userId');
    if (!student) {
      throw new Error("Student not found");
    }

    // Get marks for the term
    const marks = await Mark.find({
      studentId: studentObjectId,
      term,
      year
    }).populate('subjectId');

    if (marks.length === 0) {
      throw new Error("No marks found for this term");
    }

    // Calculate statistics
    let totalMarks = 0;
    let totalObtained = 0;
    const subjectResults: SubjectResult[] = [];

    for (const mark of marks) {
      totalMarks += mark.totalMarks;
      totalObtained += mark.marksObtained;
      
      // Properly type the populated subject
      const subject = mark.subjectId as any;
      
      subjectResults.push({
        subjectName: subject?.name || 'Unknown',
        subjectCode: subject?.code || 'Unknown',
        marksObtained: mark.marksObtained,
        totalMarks: mark.totalMarks,
        percentage: calculatePercentage(mark.marksObtained, mark.totalMarks),
        grade: mark.grade || 'N/A',
        examType: mark.examType,
        remarks: mark.remarks
      });
    }

    const overallPercentage = (totalObtained / totalMarks) * 100;
    const passed = marks.every(m => m.grade !== 'F');

    // Properly type the populated user
    const user = (student as any).userId;

    return {
      student: {
        name: user?.name || 'Unknown',
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section
      },
      academicDetails: {
        term,
        year,
        totalSubjects: marks.length
      },
      subjectResults,
      summary: {
        totalMarksObtained: totalObtained,
        totalMarks: totalMarks,
        overallPercentage: overallPercentage.toFixed(2),
        overallGrade: calculateOverallGrade(overallPercentage),
        result: passed ? 'PASS' : 'FAIL'
      }
    };
  }

  // Get performance trend across terms
  async getPerformanceTrend(studentId: string): Promise<PerformanceTrend[]> {
    const studentObjectId = new Types.ObjectId(studentId);
    const marks = await Mark.find({ studentId: studentObjectId })
      .populate('subjectId')
      .sort({ year: 1, term: 1 });

    const trends = new Map<string, PerformanceTrend & { subjects: Array<{subject: string, percentage: string}> }>();

    for (const mark of marks) {
      const key = `${mark.term} ${mark.year}`;
      if (!trends.has(key)) {
        trends.set(key, {
          term: mark.term,
          year: mark.year,
          totalObtained: 0,
          totalMarks: 0,
          percentage: '0.00',
          subjects: []
        });
      }

      const termData = trends.get(key)!;
      termData.totalObtained += mark.marksObtained;
      termData.totalMarks += mark.totalMarks;
      
      const subject = mark.subjectId as any;
      
      termData.subjects.push({
        subject: subject?.name || 'Unknown',
        percentage: calculatePercentage(mark.marksObtained, mark.totalMarks)
      });
    }

    // Calculate percentages for each term
    const trendData: PerformanceTrend[] = Array.from(trends.values()).map(term => ({
      ...term,
      percentage: ((term.totalObtained / term.totalMarks) * 100).toFixed(2)
    }));

    return trendData;
  }
}