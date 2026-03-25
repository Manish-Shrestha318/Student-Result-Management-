import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  rollNumber: string;
  class: string;
  section: string;
  admissionDate: Date;
  parentName: string;
  parentPhone: string;
  address: string;
  dateOfBirth: Date;
}

const StudentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rollNumber: { type: String, required: true, unique: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  admissionDate: { type: Date, default: Date.now },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  address: { type: String, required: true },
  dateOfBirth: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model<IStudent>("Student", StudentSchema);