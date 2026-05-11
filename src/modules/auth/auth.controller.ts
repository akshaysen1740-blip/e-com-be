import { Request, Response } from "express";
import { loginService, logoutUser, refreshAccessToken } from "./auth.services";
import { asyncHandler } from "../../utills/asyncHandler";
import { AppError } from "../../utills/AppErrors";
const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    if ((req as any).user) {
      return res.status(200).json({
        success: true,
        user: (req as any).user,
      });
    } else {
      throw new AppError("Invalid User token", 401);
    }
  },
);

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const userData = await loginService(email, password);

  res.cookie("refreshToken", userData.refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    token: userData.accessToken,
    user: userData.safeUser,
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    const tokens = await refreshAccessToken(token);

    res.cookie(
      "refreshToken",
      tokens.newrefreshToken,
      refreshTokenCookieOptions,
    );
    res.status(200).json({
      success: true,
      accessToken: tokens.newAccessToken,
    });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  await logoutUser(token);

  res.clearCookie("refreshToken");

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});
