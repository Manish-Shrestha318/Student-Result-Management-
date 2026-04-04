"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.resetPassword = exports.forgotPassword = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const generateToken_1 = require("../utils/generateToken");
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const registerUser = async (name, email, password, role) => {
    const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
    if (existingUser)
        throw new Error("User already exists");
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.default.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        status: role === "teacher" ? "pending" : "active",
    });
    const token = (0, generateToken_1.generateToken)(user._id.toString(), user.role);
    return { user, token };
};
exports.registerUser = registerUser;
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const crypto_1 = __importDefault(require("crypto"));
const loginUser = async (email, password, rememberMe = false) => {
    const user = await User_1.default.findOne({ email: email.toLowerCase() });
    if (!user)
        throw new Error("User not found");
    // Fallback for existing users without 'status' field:
    // Teachers who were NOT verified should be "pending".
    // All other existing users should be "active".
    const finalStatus = user.status || (user.isVerified === false ? "pending" : "active");
    if (finalStatus === "pending") {
        throw new Error("Your teacher account is pending verification by the administrator.");
    }
    if (finalStatus === "rejected") {
        throw new Error("Your account application has been rejected. Please contact the administrator.");
    }
    // If password field is missing from DB, we guide them
    if (!user.password) {
        if (user.googleId) {
            throw new Error("This account is currently configured for Google Login only.");
        }
        throw new Error("No password found for this account. Please use forgot-password.");
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error("Invalid password");
    const token = (0, generateToken_1.generateToken)(user._id.toString(), user.role, rememberMe);
    return { user, token };
};
exports.loginUser = loginUser;
const forgotPassword = async (email) => {
    const user = await User_1.default.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    const resetToken = user.getResetPasswordToken();
    await user.save();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    try {
        await (0, sendEmail_1.default)({
            email: user.email,
            subject: "Password reset token",
            message,
        });
        return { success: true, message: "Email sent" };
    }
    catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        throw new Error("Email could not be sent");
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (resetToken, newPassword) => {
    const resetPasswordToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    const user = await User_1.default.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
        throw new Error("Invalid or expired token");
    }
    user.password = await bcryptjs_1.default.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const token = (0, generateToken_1.generateToken)(user._id.toString(), user.role, false);
    return { user, token };
};
exports.resetPassword = resetPassword;
const googleLogin = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email)
        throw new Error("Invalid Google Token");
    const { sub: googleId, email, name, picture } = payload;
    let user = await User_1.default.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
        user = await User_1.default.create({
            name: name || "Google User",
            email,
            googleId,
            profilePicture: picture || "",
            role: "student",
            status: "active"
        });
    }
    else if (!user.googleId) {
        user.googleId = googleId;
        if (!user.profilePicture && picture) {
            user.profilePicture = picture;
        }
        await user.save();
    }
    const token = (0, generateToken_1.generateToken)(user._id.toString(), user.role);
    return { user, token };
};
exports.googleLogin = googleLogin;
