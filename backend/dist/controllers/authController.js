"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordController = exports.forgotPasswordController = exports.googleAuthController = exports.login = exports.register = void 0;
const authService_1 = require("../services/authService");
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const data = await (0, authService_1.registerUser)(name, email, password, role);
        res.status(201).json(data);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const data = await (0, authService_1.loginUser)(email, password, rememberMe);
        res.status(200).json(data);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.login = login;
const googleAuthController = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ message: "No Google ID token provided" });
        }
        const data = await (0, authService_1.googleLogin)(idToken);
        res.status(200).json(data);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.googleAuthController = googleAuthController;
const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const response = await (0, authService_1.forgotPassword)(email);
        res.status(200).json(response);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.forgotPasswordController = forgotPasswordController;
const resetPasswordController = async (req, res) => {
    try {
        const { password } = req.body;
        const { resetToken } = req.params;
        const data = await (0, authService_1.resetPassword)(resetToken, password);
        res.status(200).json(data);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.resetPasswordController = resetPasswordController;
