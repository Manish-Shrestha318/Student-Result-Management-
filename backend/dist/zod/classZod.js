"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClassSchema = exports.createClassSchema = void 0;
const zod_1 = require("zod");
exports.createClassSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Class name is required"),
    section: zod_1.z.string().min(1, "Section is required"),
    academicYear: zod_1.z.string().min(1, "Academic year is required"),
    classTeacher: zod_1.z.string().min(1, "Class teacher ID is required"),
    students: zod_1.z.array(zod_1.z.string()).optional(),
    subjects: zod_1.z.array(zod_1.z.string()).optional(),
    roomNumber: zod_1.z.string().optional(),
});
exports.updateClassSchema = exports.createClassSchema.partial();
