import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  date: Date;
  status: "present" | "absent" | "late" | "holiday";
  subjectId?: mongoose.Types.ObjectId;
  remarks?: string;
  markedBy: mongoose.Types.ObjectId; // teacher ID
}

const AttendanceSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ["present", "absent", "late", "holiday"],
    required: true 
  },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
  remarks: { type: String },
  markedBy: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true }
}, { timestamps: true });

// Ensure one attendance record per student per day
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ status: 1 });
AttendanceSchema.index({ date: 1 });

export default mongoose.model<IAttendance>("Attendance", AttendanceSchema);