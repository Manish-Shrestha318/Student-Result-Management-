import mongoose, { Schema, Document } from "mongoose";

export interface IParent extends Document {
  userId: mongoose.Types.ObjectId;
  children: mongoose.Types.ObjectId[];
  phone: string;
  address: string;
  occupation: string;
}

const ParentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  children: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  phone: { type: String, required: true },
  address: { type: String },
  occupation: { type: String }
}, { timestamps: true });

export default mongoose.model<IParent>("Parent", ParentSchema);
