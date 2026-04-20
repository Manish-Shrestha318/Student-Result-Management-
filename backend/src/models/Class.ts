import mongoose, { Schema, Document} from "mongoose";

export interface IClass extends Document {
  name: string; // e.g., "Grade 10"
  section: string; // e.g., "A", "B"
  academicYear: string;
  classTeacher: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  subjects: mongoose.Types.ObjectId[];
  roomNumber?: string;
}

const ClassSchema: Schema = new Schema({
  name: { type: String, required: true, maxlength: 30 },
  section: { type: String, required: true, maxlength: 30 },
  academicYear: { type: String, required: true },
  classTeacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  roomNumber: { type: String }
}, { timestamps: true });

// Ensure unique class per section per academic year
ClassSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

export default mongoose.model<IClass>("Class", ClassSchema);