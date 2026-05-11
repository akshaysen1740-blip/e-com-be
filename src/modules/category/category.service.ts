import { slugify } from "../../utills/slugyfy";
import { AppError } from "../../utills/AppErrors";
import {
  createCategoryQuery,
  getAllCategoriesQuery,
  getCategoryByIdQuery,
  softDeleteCategoryQuery,
  updateCategoryQuery,
} from "./category.model";
import { CreateCategoryDto, UpdateCategoryDto } from "./category.types";

export const createCategoryService = async (
  data: CreateCategoryDto
) => {
  const slug = slugify(data.name);

  const categoryId = await createCategoryQuery(data, slug);

  return {
    id: categoryId,
    message: "Category created successfully",
  };
};

export const getAllCategoriesService = async () => {
  return getAllCategoriesQuery();
};

export const getCategoryByIdService = async (id: number) => {
  const category = await getCategoryByIdQuery(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

export const updateCategoryService = async (
  id: number,
  data: UpdateCategoryDto,
) => {
  await getCategoryByIdService(id);

  const slug = data.name ? slugify(data.name) : undefined;
  await updateCategoryQuery(id, data, slug);

  return {
    id,
    message: "Category updated successfully",
  };
};

export const softDeleteCategoryService = async (id: number) => {
  await getCategoryByIdService(id);

  await softDeleteCategoryQuery(id);

  return {
    id,
    message: "Category deleted successfully",
  };
};
