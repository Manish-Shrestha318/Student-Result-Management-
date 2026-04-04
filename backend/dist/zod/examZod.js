"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExamSchema = exports.createExamSchema = void 0;
const zod_1 = require("zod");
exports.createExamSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Exam name is required"),
    examType: zod_1.z.enum(["midterm", "final", "quarterly", "half-yearly", "annual"]),
    term: zod_1.z.string().min(1, "Term is required"),
    year: zod_1.z.number().int(),
    startDate: zod_1.z.string().or(zod_1.z.date()),
    endDate: zod_1.z.string().or(zod_1.z.date()),
    classId: zod_1.z.string().min(1, "Class ID is required"),
    subjects: zod_1.z.array(zod_1.z.object({
        subjectId: zod_1.z.string(),
        fullMarks: zod_1.z.number(),
        passMarks: zod_1.z.number(),
        date: zod_1.z.string().or(zod_1.z.date())
    })),
    status: zod_1.z.enum(["upcoming", "ongoing", "completed"]).optional(),
    createdBy: zod_1.z.string().min(1, "Created by ID is required"),
});
exports.updateExamSchema = exports.createExamSchema.partial();
