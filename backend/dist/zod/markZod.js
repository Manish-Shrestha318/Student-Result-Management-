"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMarkSchema = exports.createMarkSchema = void 0;
const zod_1 = require("zod");
exports.createMarkSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, "Student ID is required"),
    subjectId: zod_1.z.string().min(1, "Subject ID is required"),
    examType: zod_1.z.string().min(1, "Exam type is required"),
    marksObtained: zod_1.z.number().min(0),
    totalMarks: zod_1.z.number().positive(),
    grade: zod_1.z.string().optional(),
    remarks: zod_1.z.string().optional(),
    term: zod_1.z.string().min(1, "Term is required"),
    year: zod_1.z.number().int(),
    topicWise: zod_1.z.array(zod_1.z.object({
        topicName: zod_1.z.string(),
        marksObtained: zod_1.z.number(),
        totalMarks: zod_1.z.number(),
        percentage: zod_1.z.number()
    })).optional()
});
exports.updateMarkSchema = exports.createMarkSchema.partial();
