"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoticeController = void 0;
const noticeService_1 = require("../services/noticeService");
const noticeService = new noticeService_1.NoticeService();
class NoticeController {
    // Create new notice
    async createNotice(req, res) {
        try {
            const { title, content, category, targetRoles, targetClasses, attachments, publishDate, expiryDate } = req.body;
            const createdBy = req.user.id;
            if (!title || !content || !category) {
                res.status(400).json({
                    success: false,
                    message: "Title, content, and category are required"
                });
                return;
            }
            const notice = await noticeService.createNotice({
                title,
                content,
                category,
                targetRoles,
                targetClasses,
                attachments,
                publishDate: publishDate ? new Date(publishDate) : new Date(),
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                createdBy
            });
            res.status(201).json({
                success: true,
                message: "Notice created successfully",
                data: notice
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Get all notices (filtered by user role)
    async getNotices(req, res) {
        try {
            const user = req.user;
            const { category, isActive } = req.query;
            const notices = await noticeService.getNotices(user.role, user.id, category, isActive === 'true');
            res.json({
                success: true,
                data: notices
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Get notice by ID
    async getNoticeById(req, res) {
        try {
            const { noticeId } = req.params;
            const notice = await noticeService.getNoticeById(noticeId);
            if (!notice) {
                res.status(404).json({
                    success: false,
                    message: "Notice not found"
                });
                return;
            }
            res.json({
                success: true,
                data: notice
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Update notice
    async updateNotice(req, res) {
        try {
            const { noticeId } = req.params;
            const updates = req.body;
            const notice = await noticeService.updateNotice(noticeId, updates);
            if (!notice) {
                res.status(404).json({
                    success: false,
                    message: "Notice not found"
                });
                return;
            }
            res.json({
                success: true,
                message: "Notice updated successfully",
                data: notice
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Delete notice
    async deleteNotice(req, res) {
        try {
            const { noticeId } = req.params;
            const deleted = await noticeService.deleteNotice(noticeId);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Notice not found"
                });
                return;
            }
            res.json({
                success: true,
                message: "Notice deleted successfully"
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Toggle notice active status
    async toggleNoticeStatus(req, res) {
        try {
            const { noticeId } = req.params;
            const notice = await noticeService.toggleNoticeStatus(noticeId);
            res.json({
                success: true,
                message: `Notice ${notice.isActive ? 'activated' : 'deactivated'}`,
                data: notice
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // Get pinned notices
    async getPinnedNotices(req, res) {
        try {
            const user = req.user;
            const notices = await noticeService.getPinnedNotices(user.role);
            res.json({
                success: true,
                data: notices
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}
exports.NoticeController = NoticeController;
