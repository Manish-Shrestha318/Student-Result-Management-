import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { NoticeController } from "../controllers/noticeController";

const router = express.Router();
const noticeController = new NoticeController();

// All routes are protected
router.use(protect);

// Public notice routes (accessible by all authenticated users)
router.get("/", noticeController.getNotices);
router.get("/pinned", noticeController.getPinnedNotices);
router.get("/:noticeId", noticeController.getNoticeById);

// Admin only routes
router.post("/", authorizeRoles("admin"), noticeController.createNotice);
router.put("/:noticeId", authorizeRoles("admin"), noticeController.updateNotice);
router.delete("/:noticeId", authorizeRoles("admin"), noticeController.deleteNotice);
router.patch("/:noticeId/toggle", authorizeRoles("admin"), noticeController.toggleNoticeStatus);

export default router;