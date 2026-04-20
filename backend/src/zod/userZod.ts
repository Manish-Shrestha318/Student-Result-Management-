import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2).max(30, "Name too long").optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["student", "teacher", "admin", "parent"]).optional(),
});
