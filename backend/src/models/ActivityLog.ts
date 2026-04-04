import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  category: "auth" | "user_management" | "academic" | "finance" | "system";
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

const ActivityLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["auth", "user_management", "academic", "finance", "system"], 
    required: true 
  },
  details: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

export default mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
