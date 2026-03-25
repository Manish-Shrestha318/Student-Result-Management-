"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
mongoose_1.default.connect(process.env.MONGO_URI);
const seedUsers = async () => {
    await User_1.default.deleteMany({});
    const users = [
        { name: "Admin", email: "admin@test.com", password: await bcryptjs_1.default.hash("123456", 10), role: "admin" },
        { name: "Teacher", email: "teacher@test.com", password: await bcryptjs_1.default.hash("123456", 10), role: "teacher" },
        { name: "Student", email: "student@test.com", password: await bcryptjs_1.default.hash("123456", 10), role: "student" },
        { name: "Parent", email: "parent@test.com", password: await bcryptjs_1.default.hash("123456", 10), role: "parent" },
    ];
    await User_1.default.insertMany(users);
    console.log("Seeded users!");
    process.exit();
};
seedUsers();
