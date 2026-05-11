import { Request, Response, NextFunction } from "express";
import { AppError } from "../utills/AppErrors";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("ERROR:", err);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  // unknown error
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    statusCode: 500,
  });
};
