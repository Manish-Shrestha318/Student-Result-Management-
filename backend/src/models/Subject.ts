import mongoose, { Schema, Document } from "mongoose";

export interface ISubject extends Document {
  name: string;
  code: string;
  class: string;
  section: string; // Added section to avoid ambiguity
  teacherId: mongoose.Types.ObjectId;
  fullMarks: number;
  passMarks: number;
  subtopics?: string[];
}

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true }, // Removed unique: true to allow same subject code for different sections if needed, or we can make a composite unique
  class: { type: String, required: true },
  section: { type: String, required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fullMarks: { type: Number, default: 100 },
  passMarks: { type: Number, default: 40 },
  subtopics: [{ type: String }]
}, { timestamps: true });

// Indexes for faster lookups
SubjectSchema.index({ teacherId: 1 });
SubjectSchema.index({ class: 1, section: 1 });

export default mongoose.model<ISubject>("Subject", SubjectSchema);