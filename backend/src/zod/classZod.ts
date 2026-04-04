import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  section: z.string().min(1, "Section is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  classTeacher: z.string().min(1, "Class teacher ID is required"),
  students: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  roomNumber: z.string().optional(),
});

export const updateClassSchema = createClassSchema.partial();
