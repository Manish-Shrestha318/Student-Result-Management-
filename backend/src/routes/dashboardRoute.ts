import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { getAdminStats } from "../controllers/dashboardController";

const router = express.Router();

router.get("/admin/stats", protect, authorizeRoles("admin"), getAdminStats);

router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin Dashboard" });
});

router.get("/teacher", protect, authorizeRoles("teacher"), (req, res) => {
  res.json({ message: "Welcome Teacher Dashboard" });
});

router.get("/student", protect, authorizeRoles("student"), (req, res) => {
  res.json({ message: "Welcome Student Dashboard" });
});

router.get("/parent", protect, authorizeRoles("parent"), (req, res) => {
  res.json({ message: "Welcome Parent Dashboard" });
});

export default router;