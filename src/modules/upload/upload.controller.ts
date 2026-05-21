import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utills/AppErrors";
import { uploadProductImages, uploadToS3 } from "./upload.service";

export const uploadImageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return next(new AppError("Image is required", 400));
    }

    const imageUrls = await uploadProductImages(req.file);

    return res.status(200).json({
      success: true,
      data: {
        urls: imageUrls,
      },
    });
  } catch (error) {
    return next(error);
  }
};
