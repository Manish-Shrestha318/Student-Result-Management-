import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(30, "Subject name cannot exceed 30 characters"),
  code: z.string().min(1, "Subject code is required").max(30, "Code cannot exceed 30 characters"),
  class: z.string().min(1, "Class is required").max(30, "Class name too long"),
  teacherId: z.string().min(1, "Teacher ID is required"),
  fullMarks: z.number().positive().optional(),
  passMarks: z.number().positive().optional(),
  subtopics: z.array(z.string().max(30, "Topic name cannot exceed 30 characters")).optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();
