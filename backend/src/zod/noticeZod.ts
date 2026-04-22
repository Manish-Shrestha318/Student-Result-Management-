import { z } from "zod";

export const createNoticeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["academic", "exam", "event", "holiday", "general"]),
  targetRoles: z.array(z.enum(["admin", "teacher", "student", "parent"])),
  targetClasses: z.array(z.string()).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    url: z.string()
  })).optional(),
  publishDate: z.string().or(z.date()).optional(),
  expiryDate: z.string().or(z.date()).optional(),
  createdBy: z.string().min(1, "Created by ID is required"),
  isActive: z.boolean().optional()
});

export const updateNoticeSchema = createNoticeSchema.partial();
