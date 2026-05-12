import { z } from "zod";

export const createProductSchema = z.object({
  subcategoryId: z.coerce
    .number()
    .int()
    .positive("Subcategory id must be a positive number"),
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  comparePrice: z.coerce
    .number()
    .positive("Compare price must be greater than 0")
    .optional(),
  stock: z.coerce.number().min(0, "Stock cannot be negative").optional(),
  thumbnailUrl: z.string()
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine(
    (data) =>
      data.subcategoryId !== undefined ||
      data.name !== undefined ||
      data.description !== undefined ||
      data.sku !== undefined ||
      data.price !== undefined ||
      data.comparePrice !== undefined ||
      data.stock !== undefined ||
      data.thumbnailUrl !== undefined,
    {
      message: "At least one field is required",
    },
  );

export const productIdSchema = z.object({
  id: z.coerce.number().int().positive("Product id must be a positive number"),
});

export const productSubcategoryIdSchema = z.object({
  subcategoryId: z.coerce
    .number()
    .int()
    .positive("Subcategory id must be a positive number"),
});
