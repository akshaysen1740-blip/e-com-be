import { z } from "zod";
import { paginationQuerySchema } from "../../utills/queryParams";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100),

  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial().refine(
  (data) => data.name !== undefined || data.description !== undefined,
  {
    message: "At least one field is required",
  },
);

export const categoryIdSchema = z.object({
  id: z.coerce.number().int().positive("Category id must be a positive number"),
});

export const categoryQuerySchema = paginationQuerySchema;
