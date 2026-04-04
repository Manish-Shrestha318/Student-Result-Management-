"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = __importDefault(require("../controllers/chatController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(authMiddleware_1.protect);
// Send a message
router.post("/", chatController_1.default.sendMessage);
// Get conversation with a specific user
router.get("/conversation/:userId2", chatController_1.default.getConversation);
// Get unread messages count
router.get("/unread-count", chatController_1.default.getUnreadCount);
// Mark a specific message as read
router.patch("/:chatId/read", chatController_1.default.markAsRead);
exports.default = router;
