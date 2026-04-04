import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  class: z.string().min(1, "Class is required"),
  teacherId: z.string().min(1, "Teacher ID is required"),
  fullMarks: z.number().positive().optional(),
  passMarks: z.number().positive().optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();
