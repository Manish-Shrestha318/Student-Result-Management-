import mongoose, { Schema, Document } from "mongoose";

export interface IExam extends Document {
  name: string;
  examType: "midterm" | "final" | "quarterly" | "half-yearly" | "annual";
  term: string;
  year: number;
  startDate: Date;
  endDate: Date;
  classId: mongoose.Types.ObjectId;
  subjects: Array<{
    subjectId: mongoose.Types.ObjectId;
    fullMarks: number;
    passMarks: number;
    date: Date;
  }>;
  status: "upcoming" | "ongoing" | "completed";
  createdBy: mongoose.Types.ObjectId;
}

const ExamSchema: Schema = new Schema({
  name: { type: String, required: true },
  examType: { 
    type: String, 
    enum: ["midterm", "final", "quarterly", "half-yearly", "annual"],
    required: true 
  },
  term: { type: String, required: true },
  year: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  subjects: [{
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    fullMarks: { type: Number, required: true },
    passMarks: { type: Number, required: true },
    date: { type: Date, required: true }
  }],
  status: { 
    type: String, 
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming" 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IExam>("Exam", ExamSchema);