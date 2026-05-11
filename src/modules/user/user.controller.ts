import { Request, Response } from "express";
import { registerUser } from "./user.services";
import { asyncHandler } from "../../utills/asyncHandler";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, userName , role } = req.body;

  const user = await registerUser(email, userName, password , role);

  res.status(201).json({
    success: true,
    data: user,
  });
});
