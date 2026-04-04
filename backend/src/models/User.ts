import mongoose, { Schema, Document } from "mongoose";
import { IUser, Role } from "../types/userType";
import crypto from "crypto";

export interface IUserDocument extends IUser, Document {
  getResetPasswordToken(): string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "parent"],
      default: "student",
    },
    googleId: { type: String, required: false, unique: true, sparse: true },
    profilePicture: { type: String, required: false, default: "" },
    isVerified: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

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