export type Role = "student" | "teacher" | "admin" | "parent";

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: Role;
  googleId?: string;
  profilePicture?: string;
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
}