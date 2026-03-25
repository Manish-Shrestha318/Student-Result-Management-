"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamService = void 0;
const Exam_1 = __importDefault(require("../models/Exam"));
const mongoose_1 = require("mongoose");
class ExamService {
    async createExam(data) {
        const examData = {
            ...data,
            classId: new mongoose_1.Types.ObjectId(data.classId),
            subjects: data.subjects.map(s => ({
                ...s,
                subjectId: new mongoose_1.Types.ObjectId(s.subjectId)
            })),
            createdBy: new mongoose_1.Types.ObjectId(data.createdBy)
        };
        const exam = await Exam_1.default.create(examData);
        return exam;
    }
    async getExamsByClass(classId, term, year) {
        const query = { classId: new mongoose_1.Types.ObjectId(classId) };
        if (term)
            query.term = term;
        if (year)
            query.year = year;
        return await Exam_1.default.find(query)
            .populate('subjects.subjectId')
            .sort({ startDate: -1 });
    }
    async getUpcomingExams() {
        const today = new Date();
        return await Exam_1.default.find({
            startDate: { $gte: today },
            status: "upcoming"
        }).populate('classId').sort({ startDate: 1 });
    }
    async updateExamStatus() {
        const today = new Date();
        // Update to ongoing
        await Exam_1.default.updateMany({
            startDate: { $lte: today },
            endDate: { $gte: today },
            status: "upcoming"
        }, { status: "ongoing" });
        // Update to completed
        await Exam_1.default.updateMany({
            endDate: { $lt: today },
            status: "ongoing"
        }, { status: "completed" });
    }
}
exports.ExamService = ExamService;
