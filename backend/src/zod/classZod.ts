import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required").max(30, "Class name cannot exceed 30 characters"),
  section: z.string().min(1, "Section is required").max(30, "Section name too long"),
  academicYear: z.string().min(1, "Academic year is required"),
  classTeacher: z.string().min(1, "Class teacher ID is required"),
  students: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  roomNumber: z.string().optional(),
});

export const updateClassSchema = createClassSchema.partial();
