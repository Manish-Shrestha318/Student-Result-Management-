"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const dashboardController_1 = require("../controllers/dashboardController");
const router = express_1.default.Router();
router.get("/admin/stats", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"), dashboardController_1.getAdminStats);
router.get("/admin", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"), (req, res) => {
    res.json({ message: "Welcome Admin Dashboard" });
});
router.get("/teacher", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("teacher", "admin"), dashboardController_1.getTeacherStats);
router.get("/student", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("student"), (req, res) => {
    res.json({ message: "Welcome Student Dashboard" });
});
router.get("/parent", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("parent"), (req, res) => {
    res.json({ message: "Welcome Parent Dashboard" });
});
exports.default = router;
