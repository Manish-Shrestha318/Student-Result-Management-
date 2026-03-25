import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import bcrypt from "bcryptjs";

dotenv.config();
mongoose.connect(process.env.MONGO_URI as string);

const seedUsers = async () => {
  await User.deleteMany({});

  const users = [
    { name: "Admin", email: "admin@test.com", password: await bcrypt.hash("123456", 10), role: "admin" },
    { name: "Teacher", email: "teacher@test.com", password: await bcrypt.hash("123456", 10), role: "teacher" },
    { name: "Student", email: "student@test.com", password: await bcrypt.hash("123456", 10), role: "student" },
    { name: "Parent", email: "parent@test.com", password: await bcrypt.hash("123456", 10), role: "parent" },
  ];

  await User.insertMany(users);
  console.log("Seeded users!");
  process.exit();
};

seedUsers();