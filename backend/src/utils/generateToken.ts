import jwt from "jsonwebtoken";

export const generateToken = (id: string, role: string, rememberMe?: boolean) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET as string,
    { expiresIn: rememberMe ? "30d" : "1d" }
  );
};