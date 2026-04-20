import mongoose, { Schema, Document } from "mongoose";

export interface INotice extends Document {
  title: string;
  content: string;
  category: "academic" | "exam" | "event" | "holiday" | "general" | "urgent";
  targetRoles: Array<"admin" | "teacher" | "student" | "parent">;
  targetClasses?: Array<mongoose.Types.ObjectId>;
  attachments?: Array<{
    filename: string;
    url: string;
  }>;
  publishDate: Date;
  expiryDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
}

const NoticeSchema: Schema = new Schema({
  title: { type: String, required: true, maxlength: 30 },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["academic", "exam", "event", "holiday", "general", "urgent"],
    required: true 
  },
  targetRoles: [{ 
    type: String, 
    enum: ["admin", "teacher", "student", "parent"] 
  }],
  targetClasses: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  attachments: [{
    filename: String,
    url: String
  }],
  publishDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for faster notice retrieval
NoticeSchema.index({ category: 1 });
NoticeSchema.index({ isActive: 1 });
NoticeSchema.index({ publishDate: -1 }); // Newest first
NoticeSchema.index({ targetRoles: 1 });

export default mongoose.model<INotice>("Notice", NoticeSchema);