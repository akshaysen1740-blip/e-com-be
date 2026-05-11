import { AppError } from "../../utills/AppErrors";
import { slugify } from "../../utills/slugyfy";
import {
  createProductQuery,
  findProductByNameQuery,
  findSubcategoryByIdQuery,
  getAllProductsBySubcategoryIdQuery,
  getProductByIdQuery,
  softDeleteProductQuery,
  updateProductQuery,
} from "./product.model";
import { CreateProductDto, UpdateProductDto } from "./product.types";

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

  if (!subcategory) {
    throw new AppError("Subcategory not found", 404);
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
  const productId = await createProductQuery(data, slug);

  return {
    id: productId,
    message: "Product created successfully",
  };
};

export const getAllProductsService = async (subcategoryId: number) => {
  const subcategory = await findSubcategoryByIdQuery(subcategoryId);

  if (!subcategory) {
    throw new AppError("Subcategory not found", 404);
  }

  return getAllProductsBySubcategoryIdQuery(subcategoryId);
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
