"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimetableService = void 0;
const Timetable_1 = __importDefault(require("../models/Timetable"));
const mongoose_1 = require("mongoose");
class TimetableService {
    // Create timetable
    async createTimetable(data) {
        // Check if timetable already exists for this class/day
        const existing = await Timetable_1.default.findOne({
            classId: new mongoose_1.Types.ObjectId(data.classId),
            day: data.day,
            academicYear: data.academicYear,
            term: data.term
        });
        if (existing) {
            throw new Error("Timetable already exists for this class and day");
        }
        // Validate periods
        this.validatePeriods(data.periods);
        const timetableData = {
            classId: new mongoose_1.Types.ObjectId(data.classId),
            day: data.day,
            periods: data.periods.map(p => ({
                periodNumber: p.periodNumber,
                startTime: p.startTime,
                endTime: p.endTime,
                subjectId: new mongoose_1.Types.ObjectId(p.subjectId),
                teacherId: new mongoose_1.Types.ObjectId(p.teacherId),
                roomNumber: p.roomNumber
            })),
            academicYear: data.academicYear,
            term: data.term,
            createdBy: new mongoose_1.Types.ObjectId(data.createdBy)
        };
        const timetable = await Timetable_1.default.create(timetableData);
        return timetable;
    }
    // Get class timetable
    async getClassTimetable(classId, day, academicYear, term) {
        const query = { classId: new mongoose_1.Types.ObjectId(classId) };
        if (day)
            query.day = day;
        if (academicYear)
            query.academicYear = academicYear;
        if (term)
            query.term = term;
        const timetables = await Timetable_1.default.find(query)
            .populate('classId')
            .populate('periods.subjectId')
            .populate('periods.teacherId')
            .sort({ day: 1 });
        // Group by day if no specific day requested
        if (!day) {
            const grouped = timetables.reduce((acc, tt) => {
                if (!acc[tt.day]) {
                    acc[tt.day] = [];
                }
                acc[tt.day] = tt.periods.sort((a, b) => a.periodNumber - b.periodNumber);
                return acc;
            }, {});
            return {
                classId,
                academicYear: academicYear || 'Current',
                term: term || 'Current',
                timetable: grouped
            };
        }
        return timetables[0] || null;
    }
    // Get teacher timetable
    async getTeacherTimetable(teacherId, academicYear, term) {
        const query = {
            'periods.teacherId': new mongoose_1.Types.ObjectId(teacherId)
        };
        if (academicYear)
            query.academicYear = academicYear;
        if (term)
            query.term = term;
        const timetables = await Timetable_1.default.find(query)
            .populate('classId')
            .populate('periods.subjectId')
            .populate('periods.teacherId')
            .sort({ day: 1 });
        // Group by day
        const grouped = {};
        for (const tt of timetables) {
            if (!grouped[tt.day]) {
                grouped[tt.day] = [];
            }
            const teacherPeriods = tt.periods
                .filter((p) => p.teacherId._id.toString() === teacherId)
                .map((p) => ({
                ...p.toObject(),
                className: tt.classId?.name + ' ' + tt.classId?.section,
                classId: tt.classId._id
            }))
                .sort((a, b) => a.periodNumber - b.periodNumber);
            grouped[tt.day].push(...teacherPeriods);
        }
        return {
            teacherId,
            academicYear: academicYear || 'Current',
            term: term || 'Current',
            timetable: grouped
        };
    }
    // Update timetable
    async updateTimetable(timetableId, updates) {
        const updateData = { ...updates };
        if (updates.classId) {
            updateData.classId = new mongoose_1.Types.ObjectId(updates.classId);
        }
        if (updates.periods) {
            updateData.periods = updates.periods.map(p => ({
                ...p,
                subjectId: p.subjectId ? new mongoose_1.Types.ObjectId(p.subjectId) : undefined,
                teacherId: p.teacherId ? new mongoose_1.Types.ObjectId(p.teacherId) : undefined
            }));
        }
        return await Timetable_1.default.findByIdAndUpdate(timetableId, updateData, { new: true, runValidators: true }).populate('periods.subjectId').populate('periods.teacherId');
    }
    // Delete timetable
    async deleteTimetable(timetableId) {
        const result = await Timetable_1.default.findByIdAndDelete(timetableId);
        return result !== null;
    }
    // Validate periods (no overlaps, proper timing)
    validatePeriods(periods) {
        // Sort by start time
        const sorted = [...periods].sort((a, b) => {
            return this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime);
        });
        // Check for overlaps
        for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];
            if (this.timeToMinutes(current.endTime) > this.timeToMinutes(next.startTime)) {
                throw new Error(`Period ${current.periodNumber} and ${next.periodNumber} have overlapping times`);
            }
        }
        // Check period numbers are sequential
        const periodNumbers = periods.map(p => p.periodNumber).sort((a, b) => a - b);
        for (let i = 0; i < periodNumbers.length; i++) {
            if (periodNumbers[i] !== i + 1) {
                throw new Error("Period numbers must be sequential starting from 1");
            }
        }
    }
    // Convert time string to minutes
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    // Check teacher availability
    async checkTeacherAvailability(teacherId, day, startTime, endTime) {
        const teacherObjectId = new mongoose_1.Types.ObjectId(teacherId);
        const conflicting = await Timetable_1.default.findOne({
            day,
            periods: {
                $elemMatch: {
                    teacherId: teacherObjectId,
                    $or: [
                        {
                            startTime: { $lt: endTime },
                            endTime: { $gt: startTime }
                        }
                    ]
                }
            }
        });
        return !conflicting;
    }
}
exports.TimetableService = TimetableService;
