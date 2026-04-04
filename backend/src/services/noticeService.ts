import Notice, { INotice } from "../models/Notice";
import { Types } from "mongoose";

interface CreateNoticeDTO {
  title: string;
  content: string;
  category: string;
  targetRoles?: Array<"admin" | "teacher" | "student" | "parent">;
  targetClasses?: string[];
  attachments?: Array<{ filename: string; url: string }>;
  publishDate: Date;
  expiryDate?: Date;
  createdBy: string;
}

export class NoticeService {
  
  // Create new notice
  async createNotice(data: CreateNoticeDTO): Promise<INotice> {
    const noticeData = {
      ...data,
      targetClasses: data.targetClasses?.map(id => new Types.ObjectId(id)),
      createdBy: new Types.ObjectId(data.createdBy)
    };

    const notice = await Notice.create(noticeData);
    return notice;
  }

  // Get notices based on user role
  async getNotices(role: string, userId?: string, category?: string, isActive?: boolean): Promise<INotice[]> {
    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    // For admin, do not filter by publish/expiry dates or target roles
    if (role !== 'admin') {
      // Filter by publish date
      query.publishDate = { $lte: new Date() };
      
      // Add expiry date filter
      query.$or = [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } }
      ];

      // Filter by target roles
      query.targetRoles = { $in: [role] };
    }

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // For students, filter by both role and class if userId is provided
    if (role === 'student' && userId) {
      const Student = require('../models/Student').default;
      const ClassModel = require('../models/Class').default;
      const student = await Student.findOne({ userId: new Types.ObjectId(userId) });
      
      const studentFilter: any[] = [{ targetRoles: { $in: ['student'] } }];
      
      // If student has a class name/section string, find the actual Class ObjectId
      if (student && student.class) {
        // Find the class document to get its ObjectId
        const classDoc = await ClassModel.findOne({ 
          name: student.class,
          section: student.section 
        });
        
        if (classDoc) {
          studentFilter.push({ targetClasses: { $in: [classDoc._id] } });
        }
      }
      
      query.$and = [
        ...(query.$and || []),
        { $or: studentFilter }
      ];
      // Remove the previously added role filter since it's now in the $or block
      delete query.targetRoles;
    }

    return await Notice.find(query)
      .populate('createdBy', 'name')
      .populate('targetClasses', 'name section')
      .sort({ createdAt: -1 });
  }

  // Get notice by ID
  async getNoticeById(noticeId: string): Promise<INotice | null> {
    return await Notice.findById(noticeId)
      .populate('createdBy', 'name email')
      .populate('targetClasses', 'name section');
  }

  // Update notice
  async updateNotice(noticeId: string, updates: Partial<INotice>): Promise<INotice | null> {
    const updateData: any = { ...updates };
    
    if (updates.targetClasses) {
      updateData.targetClasses = (updates.targetClasses as any[]).map(id => new Types.ObjectId(id));
    }

    return await Notice.findByIdAndUpdate(
      noticeId,
      updateData,
      { returnDocument: "after", runValidators: true }
    ).populate('createdBy', 'name');
  }

  // Delete notice
  async deleteNotice(noticeId: string): Promise<boolean> {
    const result = await Notice.findByIdAndDelete(noticeId);
    return result !== null;
  }

  // Toggle notice active status
  async toggleNoticeStatus(noticeId: string): Promise<INotice> {
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      throw new Error("Notice not found");
    }

    notice.isActive = !notice.isActive;
    await notice.save();
    return notice;
  }

  // Get pinned notices (important notices)
  async getPinnedNotices(role: string): Promise<INotice[]> {
    // You can add a 'isPinned' field to Notice model if needed
    // For now, return recent important notices
    return await Notice.find({
      targetRoles: { $in: [role] },
      isActive: true,
      publishDate: { $lte: new Date() }
    })
      .sort({ createdAt: -1 })
      .limit(5);
  }

  // Clean up expired notices (cron job)
  async cleanupExpiredNotices(): Promise<void> {
    await Notice.updateMany(
      {
        expiryDate: { $lt: new Date() },
        isActive: true
      },
      { isActive: false }
    );
  }
}