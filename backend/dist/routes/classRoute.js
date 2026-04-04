"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const classController_1 = require("../controllers/classController");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"));
router.get("/", classController_1.getClassesController);
router.post("/", classController_1.createClassController);
router.put("/:id", classController_1.updateClassController);
router.delete("/:id", classController_1.deleteClassController);
exports.default = router;
