import { Request, Response } from "express";
import { registerUser, loginUser, googleLogin, forgotPassword, resetPassword } from "../services/authService";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const data = await registerUser(name, email, password, role);

    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    const data = await loginUser(email, password, rememberMe);

    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const googleAuthController = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "No Google ID token provided" });
    }

    const data = await googleLogin(idToken);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const response = await forgotPassword(email);
    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const { resetToken } = req.params;
    
    const data = await resetPassword(resetToken as string, password);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};