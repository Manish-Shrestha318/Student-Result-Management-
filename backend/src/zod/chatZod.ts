import { z } from "zod";

export const createChatSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
  message: z.string().min(1, "Message cannot be empty"),
});

export const updateChatSchema = z.object({
  read: z.boolean().optional(),
});
