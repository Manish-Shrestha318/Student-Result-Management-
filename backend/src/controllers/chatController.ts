import { Request, Response } from "express";
import chatService from "../services/chatService";
import { createChatSchema, updateChatSchema } from "../zod/chatZod";
import Chat from "../models/Chat";

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
  // Get contacts based on role, sorted by most recent message
  async getContacts(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      let contacts: any[] = [];

      if (userRole === 'student') {
        const Student = require('../models/Student').default;
        const Subject = require('../models/Subject').default;
        const UserModel = require('../models/User').default;
        const student = await Student.findOne({ userId });
        if (!student) return res.json({ success: true, contacts: [] });
        const subjects = await Subject.find({ class: student.class, section: student.section });
        const teacherIds = new Set<string>(subjects.map((s: any) => s.teacherId.toString()));
        contacts = await UserModel.find({ _id: { $in: Array.from(teacherIds) } }, 'name email role');
      }

      else if (userRole === 'parent') {
        const Parent = require('../models/Parent').default;
        const Subject = require('../models/Subject').default;
        const UserModel = require('../models/User').default;
        const parent = await Parent.findOne({ userId }).populate('children');
        if (!parent || !parent.children?.length) return res.json({ success: true, contacts: [] });
        const teacherIds = new Set<string>();
        for (const child of parent.children) {
          const subjects = await Subject.find({ class: child.class, section: child.section });
          subjects.forEach((s: any) => teacherIds.add(s.teacherId.toString()));
        }
        contacts = await UserModel.find({ _id: { $in: Array.from(teacherIds) } }, 'name email role');
      }

      else if (userRole === 'teacher') {
        const Subject = require('../models/Subject').default;
        const Student = require('../models/Student').default;
        const Parent = require('../models/Parent').default;
        const UserModel = require('../models/User').default;
        const teacherSubjects = await Subject.find({ teacherId: userId });
        if (!teacherSubjects.length) return res.json({ success: true, contacts: [] });
        const classSections = teacherSubjects.map((s: any) => ({ class: s.class, section: s.section }));
        const students = await Student.find({ $or: classSections });
        const studentUserIds = students.map((s: any) => s.userId);
        const parents = await Parent.find({ children: { $in: students.map((s: any) => s._id) } });
        const parentUserIds = parents.map((p: any) => p.userId);
        contacts = await UserModel.find(
          { _id: { $in: [...studentUserIds, ...parentUserIds] } },
          'name email role'
        );
      }

      if (!contacts.length) return res.json({ success: true, contacts: [] });

      // Sort by most recent message
      const mongoose = require('mongoose');
      const contactIds = contacts.map((c: any) => c._id);
      const lastMessages = await Chat.aggregate([
        {
          $match: {
            $or: [
              { senderId: new mongoose.Types.ObjectId(userId), receiverId: { $in: contactIds } },
              { receiverId: new mongoose.Types.ObjectId(userId), senderId: { $in: contactIds } }
            ]
          }
        },
        {
          $addFields: {
            contactId: {
              $cond: {
                if: { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
                then: '$receiverId',
                else: '$senderId'
              }
            }
          }
        },
        { $sort: { createdAt: -1 } },
        { $group: { _id: '$contactId', lastMessageAt: { $first: '$createdAt' }, lastMessage: { $first: '$message' } } }
      ]);

      const lastMsgMap = new Map<string, { lastMessageAt: Date; lastMessage: string }>(
        lastMessages.map((m: any) => [m._id.toString(), { lastMessageAt: m.lastMessageAt, lastMessage: m.lastMessage }])
      );
      const enriched = contacts.map((c: any) => {
        const obj = c.toObject ? c.toObject() : c;
        const lastMsg = lastMsgMap.get(obj._id.toString());
        return { ...obj, lastMessageAt: lastMsg?.lastMessageAt || null, lastMessage: lastMsg?.lastMessage || null };
      });

      enriched.sort((a: any, b: any) => {
        if (!a.lastMessageAt && !b.lastMessageAt) return 0;
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });

      return res.json({ success: true, contacts: enriched });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new ChatController();
