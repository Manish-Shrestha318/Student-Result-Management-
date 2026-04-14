import Attendance, { IAttendance } from "../models/Attendance";
import Student from "../models/Student";
import Class from "../models/Class";
import { Types } from "mongoose";

interface AttendanceEntryDTO {
  studentId: string;
  date: Date;
  status: "present" | "absent" | "late" | "holiday";
  subjectId?: string;
  remarks?: string;
  markedBy: string;
}

export class AttendanceService {
  
  async markAttendance(data: AttendanceEntryDTO): Promise<IAttendance> {
    const studentObjectId = new Types.ObjectId(data.studentId);
    
    const student = await Student.findById(studentObjectId);
    if (!student) {
      throw new Error("Student not found");
    }

    const existing = await Attendance.findOne({
      studentId: studentObjectId,
      date: data.date
    });

    if (existing) {
      existing.status = data.status;
      if (data.remarks) existing.remarks = data.remarks;
      existing.markedBy = new Types.ObjectId(data.markedBy);
      await existing.save();
      return existing;
    }

    const attendanceData = {
      studentId: studentObjectId,
      date: data.date,
      status: data.status,
      subjectId: data.subjectId ? new Types.ObjectId(data.subjectId) : undefined,
      remarks: data.remarks,
      markedBy: new Types.ObjectId(data.markedBy)
    };

    const attendance = await Attendance.create(attendanceData);
    return attendance;
  }

  async removeAttendance(studentId: string, date: Date): Promise<void> {
    const studentObjectId = new Types.ObjectId(studentId);
    await Attendance.deleteOne({
      studentId: studentObjectId,
      date: date
    });
  }

  async getAttendanceByStudent(studentId: string, startDate?: Date, endDate?: Date): Promise<IAttendance[]> {
    const query: any = { studentId: new Types.ObjectId(studentId) };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    return await Attendance.find(query).sort({ date: -1 });
  }

  // Simplified version - Get attendance by date and class using aggregation
  async getAttendanceByClass(classId: string, date: Date): Promise<any[]> {
    try {
      const classObjectId = new Types.ObjectId(classId);
      
      // Use aggregation pipeline for better control
      const attendance = await Attendance.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(date.setHours(0, 0, 0, 0)),
              $lte: new Date(date.setHours(23, 59, 59, 999))
            }
          }
        },
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: '_id',
            as: 'studentInfo'
          }
        },
        {
          $unwind: '$studentInfo'
        },
        {
          $match: {
            'studentInfo.class': classObjectId
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'studentInfo.userId',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $project: {
            _id: 1,
            status: 1,
            date: 1,
            remarks: 1,
            'studentInfo._id': 1,
            'studentInfo.rollNumber': 1,
            'userInfo.name': 1
          }
        }
      ]);

      return attendance;
      
    } catch (error) {
      console.error("Error in getAttendanceByClass:", error);
      throw error;
    }
  }

  async getAttendanceReport(idFromParam: string, month?: number, year?: number): Promise<any> {
    const startDate = (month && year) ? new Date(year, month - 1, 1) : undefined;
    const endDate = (month && year) ? new Date(year, month, 0) : undefined;
    
    // Resolve frontend User ID to Student ID
    const AnalyticsServiceClass = require('./analyticsService').AnalyticsService;
    const analyticsHelper = new AnalyticsServiceClass();
    const studentId = await analyticsHelper.resolveStudentProfileId(idFromParam);

    const attendance = await this.getAttendanceByStudent(studentId.toString(), startDate, endDate);
    
    // Use only Saturdays as holidays, everything else is a school-day (if marked)
    const validRecords = attendance.filter(a => {
      const day = new Date(a.date).getDay();
      if (a.status === 'holiday' && day !== 6) return false; // Ignore ghost holidays
      return true;
    });

    const totalDays = validRecords.length;
    const present = validRecords.filter(a => a.status === 'present').length;
    const absent = validRecords.filter(a => a.status === 'absent').length;
    const late = validRecords.filter(a => a.status === 'late').length;
    const holiday = validRecords.filter(a => a.status === 'holiday').length;
    
    // Only count present/absent for the percentage, ignore holidays
    const attendancePercentage = (present + absent) > 0 ? (present / (present + absent)) * 100 : 0;

    // Get student details
    const student = await Student.findById(studentId).populate('userId');

    return {
      studentId: studentId.toString(),
      studentName: student ? (student as any).userId?.name : 'Unknown',
      month,
      year,
      totalDays,
      present,
      absent,
      late,
      holiday,
      percentage: attendancePercentage.toFixed(2),
      summary: {
        totalDays,
        present,
        absent,
        late,
        holiday,
        attendancePercentage: attendancePercentage.toFixed(2) + '%'
      },
      details: attendance
    };
  }
}