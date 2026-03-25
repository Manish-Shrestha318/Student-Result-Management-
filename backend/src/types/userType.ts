export type Role = "student" | "teacher" | "admin" | "parent";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}