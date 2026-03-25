"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const markController_1 = require("../controllers/markController");
const router = express_1.default.Router();
// All routes are protected
router.use(authMiddleware_1.protect);
// Teacher & Admin routes
router.post("/marks", (0, authMiddleware_1.authorizeRoles)("teacher", "admin"), markController_1.enterMarks);
router.put("/marks/:markId", (0, authMiddleware_1.authorizeRoles)("teacher", "admin"), markController_1.updateMarks);
router.delete("/marks/:markId", (0, authMiddleware_1.authorizeRoles)("teacher", "admin"), markController_1.deleteMarks);
// Routes accessible by multiple roles
router.get("/marks/student/:studentId", (0, authMiddleware_1.authorizeRoles)("teacher", "admin", "student", "parent"), markController_1.getStudentMarks);
router.get("/reports", (0, authMiddleware_1.authorizeRoles)("teacher", "admin", "student", "parent"), markController_1.generateReport);
router.get("/trends/:studentId", (0, authMiddleware_1.authorizeRoles)("teacher", "admin", "student", "parent"), markController_1.getPerformanceTrend);
exports.default = router;
