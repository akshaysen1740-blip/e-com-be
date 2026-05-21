import { z } from "zod";
import {
  createPaginationQuerySchema,
  optionalPositiveIntNumber,
} from "../../utills/queryParams";

export const createSubcategorySchema = z.object({
  categoryId: z.coerce
    .number()
    .int()
    .positive("Category id must be a positive number"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().optional(),
});

export const updateSubcategorySchema = createSubcategorySchema
  .partial()
  .refine(
    (data) =>
      data.categoryId !== undefined ||
      data.name !== undefined ||
      data.description !== undefined,
    {
      message: "At least one field is required",
    },
  );

export const subcategoryIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Subcategory id must be a positive number"),
});

export const subcategoryQuerySchema = createPaginationQuerySchema({
  categoryId: optionalPositiveIntNumber("Category id"),
});
