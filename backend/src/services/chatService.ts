import Chat, { IChat } from "../models/Chat";

class ChatService {
  async sendMessage(senderId: string, receiverId: string, message: string): Promise<IChat> {
    const newChat = new Chat({ senderId, receiverId, message });
    return await newChat.save();
  }

  async getConversation(userId1: string, userId2: string): Promise<IChat[]> {
    return await Chat.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    }).sort({ createdAt: 1 });
  }

  async getUnreadMessagesCount(userId: string): Promise<number> {
    return await Chat.countDocuments({ receiverId: userId, read: false });
  }

  async markAsRead(chatId: string, receiverId: string): Promise<IChat | null> {
    return await Chat.findOneAndUpdate(
      { _id: chatId, receiverId },
      { read: true },
      { new: true }
    );
  }

  async markAllAsRead(senderId: string, receiverId: string): Promise<void> {
    await Chat.updateMany(
      { senderId, receiverId, read: false },
      { $set: { read: true } }
    );
  }
}

export default new ChatService();
