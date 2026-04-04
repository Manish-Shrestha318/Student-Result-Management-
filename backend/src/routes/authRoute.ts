import { register, login, googleAuthController, forgotPasswordController, resetPasswordController } from "../controllers/authController";
import { registerValidation, loginValidation, validate, forgotPasswordValidation, resetPasswordValidation } from "../middleware/validationMiddleware";
import express from "express";

const router = express.Router();

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/google", googleAuthController);
router.post("/forgotpassword", forgotPasswordValidation, validate, forgotPasswordController);
router.put("/resetpassword/:resetToken", resetPasswordValidation, validate, resetPasswordController);

export default router;