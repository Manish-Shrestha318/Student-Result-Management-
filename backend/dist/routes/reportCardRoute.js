"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const reportCardController_1 = require("../controllers/reportCardController");
const router = express_1.default.Router();
// All routes are protected
router.use(authMiddleware_1.protect);
// Get report card data (JSON preview) - Accessible by all relevant roles
router.get("/data", (0, authMiddleware_1.authorizeRoles)("admin", "teacher", "student", "parent"), reportCardController_1.getReportCardData);
// Generate PDF report card - Accessible by all relevant roles
router.get("/generate", (0, authMiddleware_1.authorizeRoles)("admin", "teacher", "student", "parent"), reportCardController_1.generateReportCard);
// Preview report card in HTML
router.get("/preview", (0, authMiddleware_1.authorizeRoles)("admin", "teacher", "student", "parent"), reportCardController_1.previewReportCard);
// Bulk generate report cards for a class (Admin/Teacher only)
router.post("/bulk", (0, authMiddleware_1.authorizeRoles)("admin", "teacher"), reportCardController_1.generateBulkReportCards);
// Email report card (Admin/Teacher only)
router.post("/email", (0, authMiddleware_1.authorizeRoles)("admin", "teacher"), reportCardController_1.emailReportCard);
exports.default = router;
