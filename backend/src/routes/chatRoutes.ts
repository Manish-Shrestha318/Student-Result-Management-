import { Router } from "express";
import chatController from "../controllers/chatController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Apply auth middleware to all routes
router.use(protect);

// Send a message
router.post("/", chatController.sendMessage);

// Get conversation with a specific user
router.get("/conversation/:userId2", chatController.getConversation);

// Get unread messages count
router.get("/unread-count", chatController.getUnreadCount);

// Mark a specific message as read
router.patch("/:chatId/read", chatController.markAsRead);

export default router;
