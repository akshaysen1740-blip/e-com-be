import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../utills/AppErrors";
import {
  createSubcategoryService,
  getAllSubcategoriesService,
  getSubcategoryByIdService,
  softDeleteSubcategoryService,
  updateSubcategoryService,
} from "./subcategory.service";
import {
  createSubcategorySchema,
  subcategoryCategoryIdSchema,
  subcategoryIdSchema,
  updateSubcategorySchema,
} from "./subcategory.validation";

const handleSubcategoryError = (error: unknown, next: NextFunction) => {
  if (error instanceof ZodError) {
    return next(new AppError(error.issues[0]?.message || "Validation failed", 400));
  }

  return next(error);
};

export const createSubcategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createSubcategorySchema.parse(req.body);

    const result = await createSubcategoryService({
      ...validatedData,
      createdBy: (req as any).user.id,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleSubcategoryError(error, next);
  }
};

export const getSubcategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryId } = subcategoryCategoryIdSchema.parse(req.query);
    console.log(categoryId, "categoryId");
    const result = await getAllSubcategoriesService(categoryId);

    console.log(result, "result");
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleSubcategoryError(error, next);
  }
};

export const getSubcategoryByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = subcategoryIdSchema.parse(req.params);
    const result = await getSubcategoryByIdService(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleSubcategoryError(error, next);
  }
};

export const updateSubcategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = subcategoryIdSchema.parse(req.params);
    const validatedData = updateSubcategorySchema.parse(req.body);
    const result = await updateSubcategoryService(id, validatedData);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleSubcategoryError(error, next);
  }
};

export const softDeleteSubcategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = subcategoryIdSchema.parse(req.params);
    const result = await softDeleteSubcategoryService(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleSubcategoryError(error, next);
  }
};
