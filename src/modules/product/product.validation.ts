import { z } from "zod";
import {
  createPaginationQuerySchema,
  optionalPositiveIntNumber as sharedOptionalPositiveIntNumber,
} from "../../utills/queryParams";

const preprocessNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return value;
  }

  const parsedValue =
    typeof value === "string" ? Number(value.trim()) : Number(value);

  return Number.isNaN(parsedValue) ? value : parsedValue;
};

const positiveIntNumber = (fieldLabel: string) =>
  z.preprocess(
    preprocessNumber,
    z
      .number({ error: `${fieldLabel} must be a valid number` })
      .int(`${fieldLabel} must be an integer`)
      .positive(`${fieldLabel} must be a positive number`),
  );

const optionalPositiveIntNumber = (fieldLabel: string) =>
  z.preprocess(preprocessNumber, positiveIntNumber(fieldLabel).optional());

const positiveNumber = (fieldLabel: string) =>
  z.preprocess(
    preprocessNumber,
    z.number({ error: `${fieldLabel} must be a valid number` }).positive(
      `${fieldLabel} must be greater than 0`,
    ),
  );

const optionalPositiveNumber = (fieldLabel: string) =>
  z.preprocess(preprocessNumber, positiveNumber(fieldLabel).optional());

const optionalNonNegativeNumber = (fieldLabel: string) =>
  z.preprocess(
    preprocessNumber,
    z
      .number({ error: `${fieldLabel} must be a valid number` })
      .min(0, `${fieldLabel} cannot be negative`)
      .optional(),
  );

export const createProductSchema = z.object({
  subcategoryId: positiveIntNumber("Subcategory id"),
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: positiveNumber("Price"),
  comparePrice: optionalPositiveNumber("Compare price"),
  stock: optionalNonNegativeNumber("Stock"),
  thumbnailUrl: z.string(),
  categoryId : positiveIntNumber("Category id"),
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
  id: positiveIntNumber("Product id"),
});

export const productQuerySchema = createPaginationQuerySchema({
  subcategoryId: sharedOptionalPositiveIntNumber("Subcategory id"),
});
