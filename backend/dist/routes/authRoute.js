"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authController_1 = require("../controllers/authController");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post("/register", validationMiddleware_1.registerValidation, validationMiddleware_1.validate, authController_1.register);
router.post("/login", validationMiddleware_1.loginValidation, validationMiddleware_1.validate, authController_1.login);
router.post("/google", authController_1.googleAuthController);
router.post("/forgotpassword", validationMiddleware_1.forgotPasswordValidation, validationMiddleware_1.validate, authController_1.forgotPasswordController);
router.put("/resetpassword/:resetToken", validationMiddleware_1.resetPasswordValidation, validationMiddleware_1.validate, authController_1.resetPasswordController);
exports.default = router;
