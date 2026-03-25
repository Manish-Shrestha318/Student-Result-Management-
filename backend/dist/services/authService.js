"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const generateToken_1 = require("../utils/generateToken");
const registerUser = async (name, email, password, role) => {
    const existingUser = await User_1.default.findOne({ email });
    if (existingUser)
        throw new Error("User already exists");
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.default.create({
        name,
        email,
        password: hashedPassword,
        role,
    });
    const token = (0, generateToken_1.generateToken)(user._id.toString(), user.role);
    return { user, token };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await User_1.default.findOne({ email });
    if (!user)
        throw new Error("User not found");
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error("Invalid password");
    const token = (0, generateToken_1.generateToken)(user._id.toString(), user.role);
    return { user, token };
};
exports.loginUser = loginUser;
