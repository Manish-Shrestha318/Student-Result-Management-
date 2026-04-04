"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const activityLogController_1 = require("../controllers/activityLogController");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"));
router.get("/", activityLogController_1.getActivitiesController);
exports.default = router;
