import { z } from "zod";

export const createAttendanceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  date: z.string().or(z.date()),
  status: z.enum(["present", "absent", "late", "holiday"]),
  subjectId: z.string().optional(),
  remarks: z.string().optional(),
  markedBy: z.string().min(1, "markedBy ID is required"),
});

export const updateAttendanceSchema = createAttendanceSchema.partial();
