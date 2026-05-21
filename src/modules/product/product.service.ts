import { AppError } from "../../utills/AppErrors";
import {
  buildPaginationMeta,
  normalizePagination,
} from "../../utills/queryParams";
import { slugify } from "../../utills/slugyfy";
import { findCategoryByIdQuery } from "../subcategory/subcategory.model";
import {
  getAllProductsQuery,
  createProductQuery,
  findProductByNameQuery,
  findSubcategoryByIdQuery,
  getAllProductsBySubcategoryIdQuery,
  getProductByIdQuery,
  softDeleteProductQuery,
  updateProductQuery,
  createProductImagesQuery,
} from "./product.model";
import {
  CreateProductDto,
  ProductQueryParams,
  UpdateProductDto,
} from "./product.types";

const validateComparePrice = (price?: number, comparePrice?: number) => {
  if (
    price !== undefined &&
    comparePrice !== undefined &&
    comparePrice <= price
  ) {
    throw new AppError("Compare price must be greater than price", 400);
  }
};

export const createProductService = async (data: CreateProductDto) => {
  const subcategory = await findSubcategoryByIdQuery(data.subcategoryId);
  const categoryId = await findCategoryByIdQuery(data.categoryId);
  if (!subcategory) {
    throw new AppError("Subcategory not found", 404);
  }

  if(!categoryId){
    throw new AppError("Category not found", 404);
  }

  const existingProduct = await findProductByNameQuery(
    data.subcategoryId,
    data.name,
  );

  if (existingProduct) {
    throw new AppError("Product already exists", 400);
  }

  validateComparePrice(data.price, data.comparePrice);

  const slug = slugify(data.name);
};

export const getAllProductsService = async (
  queryParams: ProductQueryParams,
) => {
  const paginationParams = normalizePagination(
    queryParams.page,
    queryParams.limit,
  );

  if (queryParams.subcategoryId === undefined) {
    const result = await getAllProductsQuery(paginationParams);

    return {
      items: result.items,
      pagination: buildPaginationMeta(
        paginationParams.page,
        paginationParams.limit,
        result.total,
      ),
    };
  }

  const subcategory = await findSubcategoryByIdQuery(queryParams.subcategoryId);

  if (!subcategory) {
    throw new AppError("Subcategory not found", 404);
  }

  const result = await getAllProductsBySubcategoryIdQuery(
    queryParams.subcategoryId,
    paginationParams,
  );

  return {
    items: result.items,
    pagination: buildPaginationMeta(
      paginationParams.page,
      paginationParams.limit,
      result.total,
    ),
  };
};

export const getProductByIdService = async (id: number) => {
  const product = await getProductByIdQuery(id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const updateProductService = async (
  id: number,
  data: UpdateProductDto,
) => {
  const existingProduct = await getProductByIdService(id);
  const subcategoryId = data.subcategoryId ?? existingProduct.subcategory_id;
  const nextPrice = data.price ?? Number(existingProduct.price);
  const nextComparePrice =
    data.comparePrice !== undefined
      ? data.comparePrice
      : existingProduct.compare_price ?? undefined;

  if (data.subcategoryId !== undefined) {
    const subcategory = await findSubcategoryByIdQuery(data.subcategoryId);

    if (!subcategory) {
      throw new AppError("Subcategory not found", 404);
    }
  }

  if (data.name !== undefined) {
    const duplicateProduct = await findProductByNameQuery(
      subcategoryId,
      data.name,
      id,
    );

    if (duplicateProduct) {
      throw new AppError("Product already exists", 400);
    }
  }

  validateComparePrice(nextPrice, nextComparePrice);

  const slug = data.name ? slugify(data.name) : undefined;
  await updateProductQuery(id, data, slug);

  return {
    id,
    message: "Product updated successfully",
  };
};

export const softDeleteProductService = async (id: number) => {
  await getProductByIdService(id);
  await softDeleteProductQuery(id);

  return {
    id,
    message: "Product deleted successfully",
  };
};
