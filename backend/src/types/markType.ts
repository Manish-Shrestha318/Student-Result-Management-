import { Types } from "mongoose";

export interface MarkEntryDTO {
  studentId: string;
  subjectId: string;
  examType: string;
  marksObtained: number;
  totalMarks: number;
  term: string;
  year: number;
  remarks?: string;
  topicWise?: Array<{
    topicName: string;
    marksObtained: number;
    totalMarks: number;
  }>;
}

export interface ReportQueryDTO {
  studentId: string;
  term: string;
  year: number;
}

export interface SubjectResult {
  subjectName: string;
  subjectCode: string;
  marksObtained: number;
  totalMarks: number;
  percentage: string;
  grade: string;
  examType: string;
  remarks?: string;
}

export interface StudentReport {
  student: {
    name: string;
    rollNumber: string;
    class: string;
    section: string;
  };
  academicDetails: {
    term: string;
    year: number;
    totalSubjects: number;
  };
  subjectResults: SubjectResult[];
  summary: {
    totalMarksObtained: number;
    totalMarks: number;
    overallPercentage: string;
    overallGrade: string;
    result: 'PASS' | 'FAIL';
  };
}

export interface PerformanceTrend {
  term: string;
  year: number;
  totalObtained: number;
  totalMarks: number;
  percentage: string;
  subjects: Array<{
    subject: string;
    percentage: string;
  }>;
}