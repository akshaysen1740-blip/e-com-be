import { Request, Response, NextFunction } from "express";

import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  softDeleteCategoryService,
  updateCategoryService,
} from "./category.service";

export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);

    const result = await createCategoryService({
      ...validatedData,
      createdBy: (req as any).user.id,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};



export const getAllCategoriesController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAllCategoriesService();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = categoryIdSchema.parse(req.params);
    const result = await getCategoryByIdService(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = categoryIdSchema.parse(req.params);
    const validatedData = updateCategorySchema.parse(req.body);

    const result = await updateCategoryService(id, validatedData);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const softDeleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = categoryIdSchema.parse(req.params);

    const result = await softDeleteCategoryService(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
