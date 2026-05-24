import { AppError } from "../../utills/AppErrors";
import pool from "../../config/db";
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
  updateProductImagesQuery,
  getProductImagesByProductIdQuery,
  getProductDetails,
} from "./product.model";
import {
  CreateProductDto,
  ProductQueryParams,
  UpdateProductDto,
} from "./product.types";
import { deleteFromS3 } from "../upload/upload.service";

const getImageUrls = (images?: {
  original_url?: string | null;
  medium_url?: string | null;
  thumbnail_url?: string | null;
  tiny_url?: string | null;
} | null) =>
  [
    images?.original_url,
    images?.medium_url,
    images?.thumbnail_url,
    images?.tiny_url,
  ].filter((url): url is string => Boolean(url));

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
  const category = await findCategoryByIdQuery(data.categoryId);

  if (!subcategory) {
    throw new AppError("Subcategory not found", 404);
  }

  if (!category) {
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
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const productId = await createProductQuery(connection, data, slug);

    if (data.images) {
      await createProductImagesQuery(connection, {
        ...data.images,
        product_id: productId,
        created_by: data.createdBy,
      });
    } else {
      throw new AppError("Product images are required", 400);
    }

    await connection.commit();

    return {
      id: productId,
      message: "Product created successfully",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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
  const existingImages = await getProductImagesByProductIdQuery(id);
  const subcategoryId = data.subcategoryId ?? existingProduct.subcategory_id;
  const nextPrice = data.price ?? Number(existingProduct.price);
  const nextComparePrice =
    data.comparePrice !== undefined
      ? data.comparePrice
      : (existingProduct.compare_price ?? undefined);

  if (data.subcategoryId !== undefined) {
    const subcategory = await findSubcategoryByIdQuery(data.subcategoryId);

    if (!subcategory) {
      throw new AppError("Subcategory not found", 404);
    }
  }

  if (data.categoryId !== undefined) {
    const category = await findCategoryByIdQuery(data.categoryId);

    if (!category) {
      throw new AppError("Category not found", 404);
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
  const connection = await pool.getConnection();
  const previousImageUrls = getImageUrls(existingImages);
  const nextImageUrls = getImageUrls(data.images);

  try {
    await connection.beginTransaction();

    await updateProductQuery(
      id,
      {
        ...data,
        thumbnailUrl: data.images?.thumbnail_url ?? data.thumbnailUrl,
      },
      slug,
      connection,
    );

    if (data.images) {
      const imageUpdateResult = await updateProductImagesQuery(
        connection,
        id,
        data.images,
      );

      if (imageUpdateResult.affectedRows === 0) {
        await createProductImagesQuery(connection, {
          ...data.images,
          product_id: id,
          created_by: existingProduct.created_by,
        });
      }
    }

    await connection.commit();

    if (data.images && previousImageUrls.length > 0) {
      const urlsToDelete = previousImageUrls.filter(
        (url) => !nextImageUrls.includes(url),
      );

      await deleteFromS3(urlsToDelete);
    }

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return {
    id,
    message: "Product updated successfully",
  };
};

export const softDeleteProductService = async (id: number) => {
  await getProductByIdService(id);
  const existingImages = await getProductImagesByProductIdQuery(id);
  const imageUrls = getImageUrls(existingImages);

  await softDeleteProductQuery(id);

  if (imageUrls.length > 0) {
    await deleteFromS3(imageUrls);
  }

  return {
    id,
    message: "Product deleted successfully",
  };
};

export const getProductDetailsService = async (id: number) => {
  if (!id) {
    throw new AppError("Product id is required", 400);
  }

  const product = await getProductDetails(id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const {
    original_url,
    medium_url,
    thumbnail_url,
    tiny_url,
    is_primary,
    ...productData
  } = product as any;

  return {
    ...productData,
    images:
      original_url || medium_url || thumbnail_url || tiny_url
        ? {
            original_url,
            medium_url,
            thumbnail_url,
            tiny_url,
            is_primary: Boolean(is_primary),
          }
        : null,
  };
};
