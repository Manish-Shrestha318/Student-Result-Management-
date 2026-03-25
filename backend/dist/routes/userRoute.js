"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// Only admin can perform CRUD
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"));
router.get("/", userController_1.getUsers); // Get all users
router.get("/:id", userController_1.getUser); // Get single user by ID
router.put("/:id", userController_1.updateUserController); // Update user
router.delete("/:id", userController_1.deleteUserController); // Delete user
exports.default = router;
