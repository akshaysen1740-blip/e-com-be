import { z } from "zod";

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

export const subcategoryCategoryIdSchema = z.object({
  categoryId: optionalPositiveIntNumber("Category id"),
});
