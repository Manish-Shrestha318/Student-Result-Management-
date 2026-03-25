"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoticeService = void 0;
const Notice_1 = __importDefault(require("../models/Notice"));
const mongoose_1 = require("mongoose");
class NoticeService {
    // Create new notice
    async createNotice(data) {
        const noticeData = {
            ...data,
            targetClasses: data.targetClasses?.map(id => new mongoose_1.Types.ObjectId(id)),
            createdBy: new mongoose_1.Types.ObjectId(data.createdBy)
        };
        const notice = await Notice_1.default.create(noticeData);
        return notice;
    }
    // Get notices based on user role
    async getNotices(role, userId, category, isActive = true) {
        const query = { isActive };
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
        // Filter by category if provided
        if (category) {
            query.category = category;
        }
        // For students, filter by class if userId is provided
        if (role === 'student' && userId) {
            const Student = require('../models/Student').default;
            const student = await Student.findOne({ userId: new mongoose_1.Types.ObjectId(userId) });
            if (student && student.class) {
                query.$or = [
                    ...(query.$or || []),
                    { targetClasses: { $in: [student.class] } }
                ];
            }
        }
        return await Notice_1.default.find(query)
            .populate('createdBy', 'name')
            .populate('targetClasses', 'name section')
            .sort({ createdAt: -1 });
    }
    // Get notice by ID
    async getNoticeById(noticeId) {
        return await Notice_1.default.findById(noticeId)
            .populate('createdBy', 'name email')
            .populate('targetClasses', 'name section');
    }
    // Update notice
    async updateNotice(noticeId, updates) {
        const updateData = { ...updates };
        if (updates.targetClasses) {
            updateData.targetClasses = updates.targetClasses.map(id => new mongoose_1.Types.ObjectId(id));
        }
        return await Notice_1.default.findByIdAndUpdate(noticeId, updateData, { new: true, runValidators: true }).populate('createdBy', 'name');
    }
    // Delete notice
    async deleteNotice(noticeId) {
        const result = await Notice_1.default.findByIdAndDelete(noticeId);
        return result !== null;
    }
    // Toggle notice active status
    async toggleNoticeStatus(noticeId) {
        const notice = await Notice_1.default.findById(noticeId);
        if (!notice) {
            throw new Error("Notice not found");
        }
        notice.isActive = !notice.isActive;
        await notice.save();
        return notice;
    }
    // Get pinned notices (important notices)
    async getPinnedNotices(role) {
        // You can add a 'isPinned' field to Notice model if needed
        // For now, return recent important notices
        return await Notice_1.default.find({
            targetRoles: { $in: [role] },
            isActive: true,
            publishDate: { $lte: new Date() }
        })
            .sort({ createdAt: -1 })
            .limit(5);
    }
    // Clean up expired notices (cron job)
    async cleanupExpiredNotices() {
        await Notice_1.default.updateMany({
            expiryDate: { $lt: new Date() },
            isActive: true
        }, { isActive: false });
    }
}
exports.NoticeService = NoticeService;
