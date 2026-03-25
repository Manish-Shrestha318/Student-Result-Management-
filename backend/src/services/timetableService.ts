import Timetable, { ITimetable } from "../models/Timetable";
import { Types } from "mongoose";

interface CreateTimetableDTO {
  classId: string;
  day: string;
  periods: Array<{
    periodNumber: number;
    startTime: string;
    endTime: string;
    subjectId: string;
    teacherId: string;
    roomNumber?: string;
  }>;
  academicYear: string;
  term: string;
  createdBy: string;
}

export class TimetableService {
  
  // Create timetable
  async createTimetable(data: CreateTimetableDTO): Promise<ITimetable> {
    // Check if timetable already exists for this class/day
    const existing = await Timetable.findOne({
      classId: new Types.ObjectId(data.classId),
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
      classId: new Types.ObjectId(data.classId),
      day: data.day,
      periods: data.periods.map(p => ({
        periodNumber: p.periodNumber,
        startTime: p.startTime,
        endTime: p.endTime,
        subjectId: new Types.ObjectId(p.subjectId),
        teacherId: new Types.ObjectId(p.teacherId),
        roomNumber: p.roomNumber
      })),
      academicYear: data.academicYear,
      term: data.term,
      createdBy: new Types.ObjectId(data.createdBy)
    };

    const timetable = await Timetable.create(timetableData);
    return timetable;
  }

  // Get class timetable
  async getClassTimetable(classId: string, day?: string, academicYear?: string, term?: string): Promise<any> {
    const query: any = { classId: new Types.ObjectId(classId) };
    
    if (day) query.day = day;
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    const timetables = await Timetable.find(query)
      .populate('classId')
      .populate('periods.subjectId')
      .populate('periods.teacherId')
      .sort({ day: 1 });

    // Group by day if no specific day requested
    if (!day) {
      const grouped = timetables.reduce((acc: any, tt: any) => {
        if (!acc[tt.day]) {
          acc[tt.day] = [];
        }
        acc[tt.day] = tt.periods.sort((a: any, b: any) => a.periodNumber - b.periodNumber);
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
  async getTeacherTimetable(teacherId: string, academicYear?: string, term?: string): Promise<any> {
    const query: any = {
      'periods.teacherId': new Types.ObjectId(teacherId)
    };
    
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    const timetables = await Timetable.find(query)
      .populate('classId')
      .populate('periods.subjectId')
      .populate('periods.teacherId')
      .sort({ day: 1 });

    // Group by day
    const grouped: any = {};
    
    for (const tt of timetables) {
      if (!grouped[tt.day]) {
        grouped[tt.day] = [];
      }
      
      const teacherPeriods = tt.periods
        .filter((p: any) => p.teacherId._id.toString() === teacherId)
        .map((p: any) => ({
          ...p.toObject(),
          className: (tt.classId as any)?.name + ' ' + (tt.classId as any)?.section,
          classId: tt.classId._id
        }))
        .sort((a: any, b: any) => a.periodNumber - b.periodNumber);
      
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
  async updateTimetable(timetableId: string, updates: Partial<ITimetable>): Promise<ITimetable | null> {
    const updateData: any = { ...updates };
    
    if (updates.classId) {
      updateData.classId = new Types.ObjectId(updates.classId as any);
    }
    
    if (updates.periods) {
      updateData.periods = (updates.periods as any[]).map(p => ({
        ...p,
        subjectId: p.subjectId ? new Types.ObjectId(p.subjectId) : undefined,
        teacherId: p.teacherId ? new Types.ObjectId(p.teacherId) : undefined
      }));
    }

    return await Timetable.findByIdAndUpdate(
      timetableId,
      updateData,
      { new: true, runValidators: true }
    ).populate('periods.subjectId').populate('periods.teacherId');
  }

  // Delete timetable
  async deleteTimetable(timetableId: string): Promise<boolean> {
    const result = await Timetable.findByIdAndDelete(timetableId);
    return result !== null;
  }

  // Validate periods (no overlaps, proper timing)
  private validatePeriods(periods: any[]): void {
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
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Check teacher availability
  async checkTeacherAvailability(teacherId: string, day: string, startTime: string, endTime: string): Promise<boolean> {
    const teacherObjectId = new Types.ObjectId(teacherId);
    
    const conflicting = await Timetable.findOne({
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