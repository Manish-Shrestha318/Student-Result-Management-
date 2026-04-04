"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChatSchema = exports.createChatSchema = void 0;
const zod_1 = require("zod");
exports.createChatSchema = zod_1.z.object({
    receiverId: zod_1.z.string().min(1, "Receiver ID is required"),
    message: zod_1.z.string().min(1, "Message cannot be empty"),
});
exports.updateChatSchema = zod_1.z.object({
    read: zod_1.z.boolean().optional(),
});
