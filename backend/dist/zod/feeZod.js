"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFeeSchema = exports.createFeeSchema = void 0;
const zod_1 = require("zod");
exports.createFeeSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, "Student ID is required"),
    feeType: zod_1.z.enum(["tuition", "exam", "transport", "library", "sports", "other"]),
    amount: zod_1.z.number().positive("Amount must be positive"),
    dueDate: zod_1.z.string().or(zod_1.z.date()),
    paidAmount: zod_1.z.number().min(0).optional(),
    paidDate: zod_1.z.string().or(zod_1.z.date()).optional(),
    status: zod_1.z.enum(["pending", "partial", "paid", "overdue"]).optional(),
    paymentMethod: zod_1.z.enum(["cash", "card", "bank", "online"]).optional(),
    transactionId: zod_1.z.string().optional(),
    remarks: zod_1.z.string().optional(),
    createdBy: zod_1.z.string().min(1, "Created by ID is required"),
});
exports.updateFeeSchema = exports.createFeeSchema.partial();
