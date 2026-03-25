"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const noticeController_1 = require("../controllers/noticeController");
const router = express_1.default.Router();
const noticeController = new noticeController_1.NoticeController();
// All routes are protected
router.use(authMiddleware_1.protect);
// Public notice routes (accessible by all authenticated users)
router.get("/", noticeController.getNotices);
router.get("/pinned", noticeController.getPinnedNotices);
router.get("/:noticeId", noticeController.getNoticeById);
// Admin only routes
router.post("/", (0, authMiddleware_1.authorizeRoles)("admin"), noticeController.createNotice);
router.put("/:noticeId", (0, authMiddleware_1.authorizeRoles)("admin"), noticeController.updateNotice);
router.delete("/:noticeId", (0, authMiddleware_1.authorizeRoles)("admin"), noticeController.deleteNotice);
router.patch("/:noticeId/toggle", (0, authMiddleware_1.authorizeRoles)("admin"), noticeController.toggleNoticeStatus);
exports.default = router;
