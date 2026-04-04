"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chatService_1 = __importDefault(require("../services/chatService"));
const chatZod_1 = require("../zod/chatZod");
class ChatController {
    // Send a message
    async sendMessage(req, res) {
        try {
            const validatedData = chatZod_1.createChatSchema.parse(req.body);
            const senderId = req.user?.id; // Assuming you have authentication middleware that sets req.user
            if (!senderId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const chat = await chatService_1.default.sendMessage(senderId, validatedData.receiverId, validatedData.message);
            return res.status(201).json({ success: true, data: chat });
        }
        catch (error) {
            if (error.name === "ZodError") {
                return res.status(400).json({ success: false, errors: error.errors });
            }
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // Get conversation between two users
    async getConversation(req, res) {
        try {
            const userId1 = req.user?.id;
            const userId2 = req.params.userId2;
            if (!userId1) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const chats = await chatService_1.default.getConversation(userId1, userId2);
            // Optionally mark messages as read when fetched
            await chatService_1.default.markAllAsRead(userId2, userId1);
            return res.status(200).json({ success: true, data: chats });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // Get unread messages count
    async getUnreadCount(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const count = await chatService_1.default.getUnreadMessagesCount(userId);
            return res.status(200).json({ success: true, data: { count } });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // Mark a specific message as read
    async markAsRead(req, res) {
        try {
            const userId = req.user?.id;
            const { chatId } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const chat = await chatService_1.default.markAsRead(chatId, userId);
            if (!chat) {
                return res.status(404).json({ success: false, message: "Chat not found or unauthorized to mark as read" });
            }
            return res.status(200).json({ success: true, data: chat });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.default = new ChatController();
