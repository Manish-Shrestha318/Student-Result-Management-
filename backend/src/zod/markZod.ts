import { z } from "zod";

export const createMarkSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  examType: z.string().min(1, "Exam type is required"),
  marksObtained: z.number().min(0),
  totalMarks: z.number().positive(),
  grade: z.string().optional(),
  remarks: z.string().optional(),
  term: z.string().min(1, "Term is required"),
  year: z.number().int(),
  topicWise: z.array(z.object({
    topicName: z.string(),
    marksObtained: z.number(),
    totalMarks: z.number(),
    percentage: z.number()
  })).optional()
});

export const updateMarkSchema = createMarkSchema.partial();
