"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const subjectController_1 = require("../controllers/subjectController");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"));
router.get("/", subjectController_1.getSubjectsController);
router.post("/", subjectController_1.createSubjectController);
router.put("/:id", subjectController_1.updateSubjectController);
router.delete("/:id", subjectController_1.deleteSubjectController);
exports.default = router;
