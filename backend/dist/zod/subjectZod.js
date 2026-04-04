"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubjectSchema = exports.createSubjectSchema = void 0;
const zod_1 = require("zod");
exports.createSubjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Subject name is required"),
    code: zod_1.z.string().min(1, "Subject code is required"),
    class: zod_1.z.string().min(1, "Class is required"),
    teacherId: zod_1.z.string().min(1, "Teacher ID is required"),
    fullMarks: zod_1.z.number().positive().optional(),
    passMarks: zod_1.z.number().positive().optional(),
});
exports.updateSubjectSchema = exports.createSubjectSchema.partial();
