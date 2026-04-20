import mongoose, { Schema, Document } from "mongoose";
import { IUser, Role } from "../types/userType";
import crypto from "crypto";

export interface IUserDocument extends IUser, Document {
  getResetPasswordToken(): string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, maxlength: 30 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "parent"],
      default: "student",
    },
    googleId: { type: String, required: false, unique: true, sparse: true },
    profilePicture: { type: String, required: false, default: "" },
    status: { 
      type: String, 
      enum: ["pending", "active", "rejected"], 
      default: "active" 
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Indexes for faster loading
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1, status: 1 });

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default mongoose.model<IUserDocument>("User", UserSchema);