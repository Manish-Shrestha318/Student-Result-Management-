"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
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
        const { email, password } = req.body;
        const data = await (0, authService_1.loginUser)(email, password);
        res.status(200).json(data);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.login = login;
