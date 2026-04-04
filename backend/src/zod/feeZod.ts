import { z } from "zod";

export const createFeeSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  feeType: z.enum(["tuition", "exam", "transport", "library", "sports", "other"]),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.string().or(z.date()),
  paidAmount: z.number().min(0).optional(),
  paidDate: z.string().or(z.date()).optional(),
  status: z.enum(["pending", "partial", "paid", "overdue"]).optional(),
  paymentMethod: z.enum(["cash", "card", "bank", "online"]).optional(),
  transactionId: z.string().optional(),
  remarks: z.string().optional(),
  createdBy: z.string().min(1, "Created by ID is required"),
});

export const updateFeeSchema = createFeeSchema.partial();
