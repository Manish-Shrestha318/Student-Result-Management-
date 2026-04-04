import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: string
) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    isVerified: role === "teacher" ? false : true,
  });

  const token = generateToken(user._id.toString(), user.role);
  return { user, token };
};

import sendEmail from "../utils/sendEmail";
import crypto from "crypto";

export const loginUser = async (email: string, password: string, rememberMe: boolean = false) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (user.role === "teacher" && !user.isVerified) {
    throw new Error("Your teacher account is pending verification by the administrator.");
  }

  if (!user.password) throw new Error("Please login with Google");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid password");

  const token = generateToken(user._id.toString(), user.role, rememberMe);
  return { user, token };
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = user.getResetPasswordToken();
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });
    return { success: true, message: "Email sent" };
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new Error("Email could not be sent");
  }
};

export const resetPassword = async (resetToken: string, newPassword: string) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const token = generateToken(user._id.toString(), user.role, false);
  return { user, token };
};

export const googleLogin = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new Error("Invalid Google Token");

  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    user = await User.create({
      name: name || "Google User",
      email,
      googleId,
      profilePicture: picture || "",
      role: "student",
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    if (!user.profilePicture && picture) {
      user.profilePicture = picture;
    }
    await user.save();
  }

  const token = generateToken(user._id.toString(), user.role);
  return { user, token };
};