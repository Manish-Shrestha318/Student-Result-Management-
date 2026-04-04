"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTimetableSchema = exports.createTimetableSchema = void 0;
const zod_1 = require("zod");
exports.createTimetableSchema = zod_1.z.object({
    classId: zod_1.z.string().min(1, "Class ID is required"),
    day: zod_1.z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]),
    periods: zod_1.z.array(zod_1.z.object({
        periodNumber: zod_1.z.number().int().positive(),
        startTime: zod_1.z.string(),
        endTime: zod_1.z.string(),
        subjectId: zod_1.z.string().min(1),
        teacherId: zod_1.z.string().min(1),
        roomNumber: zod_1.z.string().optional()
    })),
    academicYear: zod_1.z.string().min(1, "Academic year is required"),
    term: zod_1.z.string().min(1, "Term is required"),
    createdBy: zod_1.z.string().min(1, "Created by ID is required"),
});
exports.updateTimetableSchema = exports.createTimetableSchema.partial();
