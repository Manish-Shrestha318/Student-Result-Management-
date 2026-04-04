"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNoticeSchema = exports.createNoticeSchema = void 0;
const zod_1 = require("zod");
exports.createNoticeSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    content: zod_1.z.string().min(1, "Content is required"),
    category: zod_1.z.enum(["academic", "exam", "event", "holiday", "general"]),
    targetRoles: zod_1.z.array(zod_1.z.enum(["admin", "teacher", "student", "parent"])),
    targetClasses: zod_1.z.array(zod_1.z.string()).optional(),
    attachments: zod_1.z.array(zod_1.z.object({
        filename: zod_1.z.string(),
        url: zod_1.z.string()
    })).optional(),
    publishDate: zod_1.z.string().or(zod_1.z.date()).optional(),
    expiryDate: zod_1.z.string().or(zod_1.z.date()).optional(),
    createdBy: zod_1.z.string().min(1, "Created by ID is required"),
    isActive: zod_1.z.boolean().optional()
});
exports.updateNoticeSchema = exports.createNoticeSchema.partial();
