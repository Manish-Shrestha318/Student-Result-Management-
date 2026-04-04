import { z } from "zod";

export const createTimetableSchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
  day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]),
  periods: z.array(z.object({
    periodNumber: z.number().int().positive(),
    startTime: z.string(),
    endTime: z.string(),
    subjectId: z.string().min(1),
    teacherId: z.string().min(1),
    roomNumber: z.string().optional()
  })),
  academicYear: z.string().min(1, "Academic year is required"),
  term: z.string().min(1, "Term is required"),
  createdBy: z.string().min(1, "Created by ID is required"),
});

export const updateTimetableSchema = createTimetableSchema.partial();
