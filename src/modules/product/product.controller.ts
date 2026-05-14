import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../utills/AppErrors";
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  softDeleteProductService,
  updateProductService,
} from "./product.service";
import {
  createProductSchema,
  productIdSchema,
  productSubcategoryIdSchema,
  updateProductSchema,
} from "./product.validation";

const handleProductError = (error: unknown, next: NextFunction) => {
  if (error instanceof ZodError) {
    return next(new AppError(error.issues[0]?.message || "Validation failed", 400));
  }

  return next(error);
};


export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    console.log(validatedData)
    const result = await createProductService({
      ...validatedData,
      createdBy: (req as any).user.id,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleProductError(error, next);
  }
};

export const getProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { subcategoryId } = productSubcategoryIdSchema.parse(req.query);
    const result = await getAllProductsService(subcategoryId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleProductError(error, next);
  }
};

export const getProductByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    const result = await getProductByIdService(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleProductError(error, next);
  }
};

export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    const validatedData = updateProductSchema.parse(req.body);
    const result = await updateProductService(id, validatedData);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleProductError(error, next);
  }
};

export const softDeleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    const result = await softDeleteProductService(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleProductError(error, next);
  }
};
