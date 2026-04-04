"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeacherSchema = exports.createTeacherSchema = void 0;
const zod_1 = require("zod");
exports.createTeacherSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "User ID is required"),
    employeeId: zod_1.z.string().min(1, "Employee ID is required"),
    qualification: zod_1.z.string().min(1, "Qualification is required"),
    specialization: zod_1.z.array(zod_1.z.string()),
    subjects: zod_1.z.array(zod_1.z.string()).optional(),
    joinDate: zod_1.z.string().or(zod_1.z.date()).optional(),
    phone: zod_1.z.string().min(1, "Phone is required"),
    address: zod_1.z.string().min(1, "Address is required"),
});
exports.updateTeacherSchema = exports.createTeacherSchema.partial();
