"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const feeController_1 = require("../controllers/feeController");
const router = express_1.default.Router();
const feeController = new feeController_1.FeeController();
// All routes are protected
router.use(authMiddleware_1.protect);
// Admin only routes
router.post("/", (0, authMiddleware_1.authorizeRoles)("admin"), feeController.createFee);
router.get("/report", (0, authMiddleware_1.authorizeRoles)("admin"), feeController.getFeeReport);
router.put("/:feeId", (0, authMiddleware_1.authorizeRoles)("admin"), feeController.updateFee);
router.delete("/:feeId", (0, authMiddleware_1.authorizeRoles)("admin"), feeController.deleteFee);
// Student/Parent routes (view only)
router.get("/student/:studentId", (0, authMiddleware_1.authorizeRoles)("admin", "student", "parent"), feeController.getStudentFees);
router.get("/:feeId", (0, authMiddleware_1.authorizeRoles)("admin", "student", "parent"), feeController.getFeeById);
// Payment route (students/parents can pay)
router.post("/payment/:feeId", (0, authMiddleware_1.authorizeRoles)("admin", "student", "parent"), feeController.makePayment);
exports.default = router;
