"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAttendanceSchema = exports.createAttendanceSchema = void 0;
const zod_1 = require("zod");
exports.createAttendanceSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, "Student ID is required"),
    date: zod_1.z.string().or(zod_1.z.date()),
    status: zod_1.z.enum(["present", "absent", "late", "holiday"]),
    subjectId: zod_1.z.string().optional(),
    remarks: zod_1.z.string().optional(),
    markedBy: zod_1.z.string().min(1, "markedBy ID is required"),
});
exports.updateAttendanceSchema = exports.createAttendanceSchema.partial();
