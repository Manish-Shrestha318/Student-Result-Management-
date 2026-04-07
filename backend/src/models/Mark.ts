import mongoose, { Schema, Document, Types } from "mongoose";

// Update src/models/Mark.ts
export interface IMark extends Document {
  studentId: Types.ObjectId;
  subjectId: Types.ObjectId;
  examType: string;
  marksObtained: number;
  totalMarks: number;
  grade?: string;
  remarks?: string;
  term: string;
  year: number;
  
  
  topicWise?: Array<{
    topicName: string;      // e.g., "Algebra", "Quadratic Equations"
    marksObtained: number;
    totalMarks: number;
    percentage: number;
  }>;
}


const MarkSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  examType: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  grade: { type: String },
  remarks: { type: String },
  term: { type: String, required: true },
  year: { type: Number, required: true },
  topicWise: [{
    topicName: { type: String, required: true },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true }
  }]
}, { timestamps: true });

// Calculate grade before saving
MarkSchema.pre('save', function (this: IMark) {
  const percentage = (this.marksObtained / this.totalMarks) * 100;

  if (percentage >= 90) this.grade = 'A+';
  else if (percentage >= 80) this.grade = 'A';
  else if (percentage >= 70) this.grade = 'B+';
  else if (percentage >= 60) this.grade = 'B';
  else if (percentage >= 50) this.grade = 'C+';
  else if (percentage >= 40) this.grade = 'C';
  else this.grade = 'F';
});

export default mongoose.model<IMark>("Mark", MarkSchema);