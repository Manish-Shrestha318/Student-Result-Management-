"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Get all users
const getAllUsers = async () => {
    return await User_1.default.find();
};
exports.getAllUsers = getAllUsers;
// Get single user by ID
const getUserById = async (id) => {
    return await User_1.default.findById(id);
};
exports.getUserById = getUserById;
// Update user
const updateUser = async (id, data) => {
    if (data.password) {
        data.password = await bcryptjs_1.default.hash(data.password, 10); // hash new password
    }
    return await User_1.default.findByIdAndUpdate(id, data, { new: true });
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (id) => {
    return await User_1.default.findByIdAndDelete(id);
};
exports.deleteUser = deleteUser;
