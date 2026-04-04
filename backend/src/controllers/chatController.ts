import { Request, Response } from "express";
import chatService from "../services/chatService";
import { createChatSchema, updateChatSchema } from "../zod/chatZod";

class ChatController {
  // Send a message
  async sendMessage(req: any, res: Response) {
    try {
      const validatedData = createChatSchema.parse(req.body);
      const senderId = req.user?.id; // Assuming you have authentication middleware that sets req.user

      if (!senderId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const chat = await chatService.sendMessage(
        senderId,
        validatedData.receiverId,
        validatedData.message
      );

      return res.status(201).json({ success: true, data: chat });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get conversation between two users
  async getConversation(req: any, res: Response) {
    try {
      const userId1 = req.user?.id;
      const userId2 = req.params.userId2 as string;

      if (!userId1) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const chats = await chatService.getConversation(userId1, userId2);

      // Optionally mark messages as read when fetched
      await chatService.markAllAsRead(userId2, userId1);

      return res.status(200).json({ success: true, data: chats });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get unread messages count
  async getUnreadCount(req: any, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const count = await chatService.getUnreadMessagesCount(userId);

      return res.status(200).json({ success: true, data: { count } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Mark a specific message as read
  async markAsRead(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      const { chatId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const chat = await chatService.markAsRead(chatId as string, userId);

      if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found or unauthorized to mark as read" });
      }

      return res.status(200).json({ success: true, data: chat });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new ChatController();
