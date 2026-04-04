import mongoose, { Schema, Document } from "mongoose";

export interface ISubject extends Document {
  name: string;
  code: string;
  class: string;
  teacherId: mongoose.Types.ObjectId;
  fullMarks: number;
  passMarks: number;
}

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  class: { type: String, required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fullMarks: { type: Number, default: 100 },
  passMarks: { type: Number, default: 40 }
}, { timestamps: true });

export default mongoose.model<ISubject>("Subject", SubjectSchema);