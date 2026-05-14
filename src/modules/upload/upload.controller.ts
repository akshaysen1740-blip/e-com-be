import { Request, Response } from "express";
import { AppError } from "../../utills/AppErrors";
import { uploadToS3 } from "./upload.service";

export const uploadImageController = async (
  req : Request,
  res : Response
) => {
  if (!req.file) {
    throw new AppError(
      "Image is required",
      400
    );
  }

  const imageUrl = await uploadToS3(req.file);

  return res.status(200).json({
    success: true,
    data: {
      url: imageUrl,
    },
  });
};