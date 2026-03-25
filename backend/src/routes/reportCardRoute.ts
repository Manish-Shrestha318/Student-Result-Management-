import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import {
  generateReportCard,
  getReportCardData,
  generateBulkReportCards,
  emailReportCard,
  previewReportCard
} from "../controllers/reportCardController";

const router = express.Router();

// All routes are protected
router.use(protect);

// Get report card data (JSON preview) - Accessible by all relevant roles
router.get(
  "/data", 
  authorizeRoles("admin", "teacher", "student", "parent"), 
  getReportCardData
);

// Generate PDF report card - Accessible by all relevant roles
router.get(
  "/generate", 
  authorizeRoles("admin", "teacher", "student", "parent"), 
  generateReportCard
);

// Preview report card in HTML
router.get(
  "/preview", 
  authorizeRoles("admin", "teacher", "student", "parent"), 
  previewReportCard
);

// Bulk generate report cards for a class (Admin/Teacher only)
router.post(
  "/bulk", 
  authorizeRoles("admin", "teacher"), 
  generateBulkReportCards
);

// Email report card (Admin/Teacher only)
router.post(
  "/email", 
  authorizeRoles("admin", "teacher"), 
  emailReportCard
);

export default router;