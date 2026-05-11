import { AppError } from "../../utills/AppErrors";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utills/token";
import { getUserByEmail } from "../user/user.modal";
import bcrypt from "bcrypt";
import { findToken, revokeToken, saveRefreshToken } from "./auth.modal";

export const loginService = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const payload = {
    id: user.id,
    email: user.email,
    userName: user.userName,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  await saveRefreshToken(refreshToken, user.id);

  const { password: _, ...safeUser } = user;
  return {
    accessToken,
    refreshToken,
    safeUser,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  // 1. Check DB
  const storedToken = await findToken(refreshToken);

  console.log(storedToken, "storedToken");
  if (!storedToken || storedToken.is_revoked) {
    throw new AppError("Invalid refresh token", 401);
  }

  let decoded: any;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    await revokeToken(refreshToken);
    throw new AppError("Invalid or expired refresh token", 401);
  }

  await revokeToken(refreshToken);

  const payload = {
    id: decoded.id,
    email: decoded.email,
    userName: decoded.userName,
    role: decoded.role,
  };

  const newAccessToken = generateAccessToken(payload);
  const newrefreshToken = generateRefreshToken(payload);

  await saveRefreshToken(newrefreshToken, decoded.id);
  return {newAccessToken, newrefreshToken};
};

export const logoutUser = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("No token provided", 400);
  }

  await revokeToken(refreshToken);
};
