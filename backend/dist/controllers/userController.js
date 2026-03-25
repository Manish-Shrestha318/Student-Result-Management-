"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserController = exports.updateUserController = exports.getUser = exports.getUsers = void 0;
const userService_1 = require("../services/userService");
const getUsers = async (req, res) => {
    try {
        const users = await (0, userService_1.getAllUsers)();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    try {
        const user = await (0, userService_1.getUserById)(req.params.id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUser = getUser;
const updateUserController = async (req, res) => {
    try {
        const updatedUser = await (0, userService_1.updateUser)(req.params.id, req.body);
        if (!updatedUser)
            return res.status(404).json({ message: "User not found" });
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateUserController = updateUserController;
const deleteUserController = async (req, res) => {
    try {
        const deletedUser = await (0, userService_1.deleteUser)(req.params.id);
        if (!deletedUser)
            return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteUserController = deleteUserController;
