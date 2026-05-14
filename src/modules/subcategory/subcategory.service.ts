import { AppError } from "../../utills/AppErrors";
import { slugify } from "../../utills/slugyfy";
import {
  createSubcategoryQuery,
  findCategoryByIdQuery,
  findSubcategoryByNameQuery,
  getAllActiveSubcategoriesQuery,
  getAllSubCategoriesByCategoryID,
  getSubcategoryByIdQuery,
  softDeleteSubcategoryQuery,
  updateSubcategoryQuery,
} from "./subcategory.model";
import {
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
} from "./subcategory.types";

export const createSubcategoryService = async (data: CreateSubcategoryDto) => {
  const category = await findCategoryByIdQuery(data.categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const existingSubcategory = await findSubcategoryByNameQuery(
    data.categoryId,
    data.name,
  );

  if (existingSubcategory) {
    throw new AppError("Subcategory already exists", 400);
  }

  const slug = slugify(data.name);
  const subcategoryId = await createSubcategoryQuery(data, slug);

  return {
    id: subcategoryId,
    message: "Subcategory created successfully",
  };
};

export const getAllSubcategoriesService = async (categoryId?: number) => {
  console.log(categoryId, "<< categroyId")
  if(categoryId == undefined){
    return getAllActiveSubcategoriesQuery();
  }
  const category = await findCategoryByIdQuery(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return getAllSubCategoriesByCategoryID(categoryId);
};

export const getSubcategoryByIdService = async (id: number) => {
  const subcategory = await getSubcategoryByIdQuery(id);

  if (!subcategory) {
    throw new AppError("Subcategory not found", 404);
  }

  return subcategory;
};

export const updateSubcategoryService = async (
  id: number,
  data: UpdateSubcategoryDto,
) => {
  const existingSubcategory = await getSubcategoryByIdService(id);
  const categoryId = data.categoryId ?? existingSubcategory.category_id;

  if (data.categoryId !== undefined) {
    const category = await findCategoryByIdQuery(data.categoryId);

    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  if (data.name !== undefined) {
    const duplicateSubcategory = await findSubcategoryByNameQuery(
      categoryId,
      data.name,
      id,
    );

    if (duplicateSubcategory) {
      throw new AppError("Subcategory already exists", 400);
    }
  }

  const slug = data.name ? slugify(data.name) : undefined;
  await updateSubcategoryQuery(id, data, slug);

  return {
    id,
    message: "Subcategory updated successfully",
  };
};

export const softDeleteSubcategoryService = async (id: number) => {
  await getSubcategoryByIdService(id);
  await softDeleteSubcategoryQuery(id);

  return {
    id,
    message: "Subcategory deleted successfully",
  };
};
