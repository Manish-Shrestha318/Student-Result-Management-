import mongoose, { Schema, Document } from "mongoose";

export interface IFee extends Document {
  studentId: mongoose.Types.ObjectId;
  feeType: "tuition" | "exam" | "transport" | "library" | "sports" | "other";
  amount: number;
  dueDate: Date;
  paidAmount: number;
  paidDate?: Date;
  status: "pending" | "partial" | "paid" | "overdue";
  paymentMethod?: "cash" | "card" | "bank" | "online";
  transactionId?: string;
  remarks?: string;
  createdBy: mongoose.Types.ObjectId;
}

const FeeSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  feeType: { 
    type: String, 
    enum: ["tuition", "exam", "transport", "library", "sports", "other"],
    required: true 
  },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidAmount: { type: Number, default: 0 },
  paidDate: { type: Date },
  status: { 
    type: String, 
    enum: ["pending", "partial", "paid", "overdue"],
    default: "pending" 
  },
  paymentMethod: { 
    type: String, 
    enum: ["cash", "card", "bank", "online"] 
  },
  transactionId: { type: String },
  remarks: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IFee>("Fee", FeeSchema);