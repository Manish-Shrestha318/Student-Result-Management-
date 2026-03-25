import { register, login } from "../controllers/authController";
import { registerValidation, loginValidation, validate } from "../middleware/validationMiddleware";
import express from "express";

const router = express.Router();

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);

export default router;