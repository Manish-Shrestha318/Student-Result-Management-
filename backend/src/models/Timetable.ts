import mongoose, { Schema, Document } from "mongoose";

export interface ITimetable extends Document {
  classId: mongoose.Types.ObjectId;
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
  periods: Array<{
    periodNumber: number;
    startTime: string;
    endTime: string;
    subjectId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    roomNumber?: string;
  }>;
  academicYear: string;
  term: string;
  createdBy: mongoose.Types.ObjectId;
}

const TimetableSchema: Schema = new Schema({
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  day: { 
    type: String, 
    enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    required: true 
  },
  periods: [{
    periodNumber: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    roomNumber: { type: String }
  }],
  academicYear: { type: String, required: true },
  term: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Ensure one timetable per class per day
TimetableSchema.index({ classId: 1, day: 1, academicYear: 1, term: 1 }, { unique: true });

export default mongoose.model<ITimetable>("Timetable", TimetableSchema);