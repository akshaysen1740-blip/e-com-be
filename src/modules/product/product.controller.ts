import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../utills/AppErrors";
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  getProductDetailsService,
  softDeleteProductService,
  updateProductService,
} from "./product.service";
import {
  createProductSchema,
  productIdSchema,
  productQuerySchema,
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
    const queryParams = productQuerySchema.parse(req.query);
    const result = await getAllProductsService(queryParams);

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
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

export const getProuctDetailsContrller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    const result = await getProductDetailsService(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleProductError(error, next);
  }
};
