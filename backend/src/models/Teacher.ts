import mongoose, { Schema, Document } from "mongoose";

export interface ITeacher extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  qualification: string;
  specialization: string[];
  subjects: mongoose.Types.ObjectId[];
  joinDate: Date;
  phone: string;
  address: string;
}

const TeacherSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true, unique: true },
  qualification: { type: String, required: true },
  specialization: [{ type: String }],
  subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  joinDate: { type: Date, default: Date.now },
  phone: { type: String, required: true },
  address: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ITeacher>("Teacher", TeacherSchema);