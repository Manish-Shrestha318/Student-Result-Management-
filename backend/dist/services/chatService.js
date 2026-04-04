"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Chat_1 = __importDefault(require("../models/Chat"));
class ChatService {
    async sendMessage(senderId, receiverId, message) {
        const newChat = new Chat_1.default({ senderId, receiverId, message });
        return await newChat.save();
    }
    async getConversation(userId1, userId2) {
        return await Chat_1.default.find({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 },
            ],
        }).sort({ createdAt: 1 });
    }
    async getUnreadMessagesCount(userId) {
        return await Chat_1.default.countDocuments({ receiverId: userId, read: false });
    }
    async markAsRead(chatId, receiverId) {
        return await Chat_1.default.findOneAndUpdate({ _id: chatId, receiverId }, { read: true }, { new: true });
    }
    async markAllAsRead(senderId, receiverId) {
        await Chat_1.default.updateMany({ senderId, receiverId, read: false }, { $set: { read: true } });
    }
}
exports.default = new ChatService();
