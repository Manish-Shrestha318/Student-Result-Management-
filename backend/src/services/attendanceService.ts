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
      throw new Error("Attendance already marked for this date");
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

  async getAttendanceReport(studentId: string, month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const attendance = await this.getAttendanceByStudent(studentId, startDate, endDate);
    
    const totalDays = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const holiday = attendance.filter(a => a.status === 'holiday').length;
    
    const attendancePercentage = totalDays > 0 ? (present / totalDays) * 100 : 0;

    // Get student details
    const student = await Student.findById(studentId).populate('userId');

    return {
      studentId,
      studentName: student ? (student as any).userId?.name : 'Unknown',
      month,
      year,
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