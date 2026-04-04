import { z } from "zod";

export const createTeacherSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  qualification: z.string().min(1, "Qualification is required"),
  specialization: z.array(z.string()),
  subjects: z.array(z.string()).optional(),
  joinDate: z.string().or(z.date()).optional(),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
});

export const updateTeacherSchema = createTeacherSchema.partial();
