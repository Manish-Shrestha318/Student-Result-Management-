import { z } from "zod";

export const createStudentSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  class: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  admissionDate: z.string().or(z.date()).optional(),
  parentName: z.string().min(1, "Parent name is required"),
  parentPhone: z.string().min(1, "Parent phone is required"),
  address: z.string().min(1, "Address is required"),
  dateOfBirth: z.string().or(z.date()),
});

export const updateStudentSchema = createStudentSchema.partial();
