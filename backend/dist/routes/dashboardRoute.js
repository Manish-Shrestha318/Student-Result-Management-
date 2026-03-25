"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get("/admin", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"), (req, res) => {
    res.json({ message: "Welcome Admin Dashboard" });
});
router.get("/teacher", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("teacher"), (req, res) => {
    res.json({ message: "Welcome Teacher Dashboard" });
});
router.get("/student", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("student"), (req, res) => {
    res.json({ message: "Welcome Student Dashboard" });
});
router.get("/parent", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("parent"), (req, res) => {
    res.json({ message: "Welcome Parent Dashboard" });
});
exports.default = router;
