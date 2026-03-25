import mongoose, { Schema, Document } from "mongoose";
import { IUser, Role } from "../types/userType";

export interface IUserDocument extends IUser, Document {}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "parent"],
      default: "student",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUserDocument>("User", UserSchema);