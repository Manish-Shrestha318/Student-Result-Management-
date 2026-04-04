"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentSchema = exports.createStudentSchema = void 0;
const zod_1 = require("zod");
exports.createStudentSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "User ID is required"),
    rollNumber: zod_1.z.string().min(1, "Roll number is required"),
    class: zod_1.z.string().min(1, "Class is required"),
    section: zod_1.z.string().min(1, "Section is required"),
    admissionDate: zod_1.z.string().or(zod_1.z.date()).optional(),
    parentName: zod_1.z.string().min(1, "Parent name is required"),
    parentPhone: zod_1.z.string().min(1, "Parent phone is required"),
    address: zod_1.z.string().min(1, "Address is required"),
    dateOfBirth: zod_1.z.string().or(zod_1.z.date()),
});
exports.updateStudentSchema = exports.createStudentSchema.partial();
