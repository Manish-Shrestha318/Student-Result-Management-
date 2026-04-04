import { z } from "zod";

export const createExamSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  examType: z.enum(["midterm", "final", "quarterly", "half-yearly", "annual"]),
  term: z.string().min(1, "Term is required"),
  year: z.number().int(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  classId: z.string().min(1, "Class ID is required"),
  subjects: z.array(z.object({
    subjectId: z.string(),
    fullMarks: z.number(),
    passMarks: z.number(),
    date: z.string().or(z.date())
  })),
  status: z.enum(["upcoming", "ongoing", "completed"]).optional(),
  createdBy: z.string().min(1, "Created by ID is required"),
});

export const updateExamSchema = createExamSchema.partial();
