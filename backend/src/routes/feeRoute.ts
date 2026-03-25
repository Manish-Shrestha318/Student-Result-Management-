import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { FeeController } from "../controllers/feeController";

const router = express.Router();
const feeController = new FeeController();

// All routes are protected
router.use(protect);

// Admin only routes
router.post("/", authorizeRoles("admin"), feeController.createFee);
router.get("/report", authorizeRoles("admin"), feeController.getFeeReport);
router.put("/:feeId", authorizeRoles("admin"), feeController.updateFee);
router.delete("/:feeId", authorizeRoles("admin"), feeController.deleteFee);

// Student/Parent routes (view only)
router.get("/student/:studentId", authorizeRoles("admin", "student", "parent"), feeController.getStudentFees);
router.get("/:feeId", authorizeRoles("admin", "student", "parent"), feeController.getFeeById);

// Payment route (students/parents can pay)
router.post("/payment/:feeId", authorizeRoles("admin", "student", "parent"), feeController.makePayment);

export default router;