import pool from "../../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Pool, PoolConnection } from "mysql2/promise";
import { PaginationParams } from "../../utills/queryParams";
import {
  CreateProductDto,
  ImageStack,
  Product,
  UpdateProductDto,
} from "./product.types";
import { AppError } from "../../utills/AppErrors";

export const findSubcategoryByIdQuery = async (subcategoryId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
      SELECT id
      FROM subcategories
      WHERE id = ?
        AND is_active = TRUE
      LIMIT 1
    `,
    [subcategoryId],
  );

  return rows[0] || null;
};

export const findProductByNameQuery = async (
  subcategoryId: number,
  name: string,
  excludeId?: number,
) => {
  const params: Array<number | string> = [subcategoryId, name];
  let query = `
    SELECT id
    FROM products
    WHERE subcategory_id = ?
      AND name = ?
      AND is_active = TRUE
  `;

  if (excludeId !== undefined) {
    query += " AND id != ?";
    params.push(excludeId);
  }

  query += " LIMIT 1";

  const [rows] = await pool.execute<RowDataPacket[]>(query, params);

  return rows[0] || null;
};

export const createProductImagesQuery = async (
  connection: PoolConnection,
  data: ImageStack & { product_id: number; created_by: number },
) => {
  try {
    const [result] = await connection.execute<ResultSetHeader>(
      `
      INSERT INTO product_images (
        product_id,
        original_url,
        thumbnail_url,
        medium_url,
        tiny_url,
        is_primary,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        data.product_id,
        data.original_url,
        data.thumbnail_url,
        data.medium_url,
        data.tiny_url,
        data.is_primary,
        data.created_by,
      ],
    );
    return result.insertId;
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new AppError("Product already exists", 409);
    }
    throw err;
  }
};

export const updateProductImagesQuery = async (
  connection: PoolConnection,
  productId: number,
  data: ImageStack,
) => {
  const [result] = await connection.execute<ResultSetHeader>(
    `
      UPDATE product_images
      SET
        original_url = ?,
        thumbnail_url = ?,
        medium_url = ?,
        tiny_url = ?,
        is_primary = ?
      WHERE product_id = ?
    `,
    [
      data.original_url,
      data.thumbnail_url,
      data.medium_url,
      data.tiny_url,
      data.is_primary,
      productId,
    ],
  );

  return result;
};

export const getProductImagesByProductIdQuery = async (productId: number) => {
  const [rows] = await pool.execute<(ImageStack & RowDataPacket)[]>(
    `
      SELECT original_url, medium_url, thumbnail_url, tiny_url, is_primary
      FROM product_images
      WHERE product_id = ?
      LIMIT 1
    `,
    [productId],
  );

  return rows[0] || null;
};

export const createProductQuery = async (
  connection: PoolConnection,
  data: CreateProductDto,
  slug: string,
) => {
  try {
    const [result] = await connection.execute<ResultSetHeader>(
      `
      INSERT INTO products (
        subcategory_id,
        name,
        slug,
        description,
        sku,
        price,
        compare_price,
        stock,
        thumbnail_url,
        category_id,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        data.subcategoryId,
        data.name,
        slug,
        data.description || null,
        data.sku || null,
        data.price,
        data.comparePrice || null,
        data.stock || 0,
        data.thumbnailUrl || data.images?.thumbnail_url || null,
        data.categoryId || null,
        data.createdBy,
      ],
    );

    return result.insertId;
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new AppError("Product already exists", 409);
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      throw new AppError("Invalid category or subcategory", 400);
    }

    throw new AppError("Failed to create product", 500);
  }
};

export const getAllProductsBySubcategoryIdQuery = async (
  subcategoryId: number,
  { limit, offset }: PaginationParams,
) => {
  const safeSubcategoryId = Math.trunc(subcategoryId);
  const safeOffset = Math.max(0, Math.trunc(offset));
  const safeLimit = Math.max(1, Math.trunc(limit));

  const [rows] = await pool.query<(Product & RowDataPacket)[]>(
    `
      SELECT *
      FROM products
      WHERE subcategory_id = ${safeSubcategoryId}
        AND is_active = TRUE
      ORDER BY id DESC
      LIMIT ${safeOffset}, ${safeLimit}
    `,
  );

  const [countRows] = await pool.execute<(RowDataPacket & { total: number })[]>(
    `
      SELECT COUNT(*) AS total
      FROM products
      WHERE subcategory_id = ?
        AND is_active = TRUE
    `,
    [subcategoryId],
  );

  return {
    items: rows,
    total: countRows[0]?.total ?? 0,
  };
};

export const getAllProductsQuery = async ({
  limit,
  offset,
}: PaginationParams) => {
  const safeOffset = Math.max(0, Math.trunc(offset));
  const safeLimit = Math.max(1, Math.trunc(limit));

  const [rows] = await pool.query<(Product & RowDataPacket)[]>(
    `
      SELECT p.*, pi.original_url, pi.medium_url, pi.thumbnail_url, pi.tiny_url
      FROM products p JOIN product_images pi
      ON p.id = pi.product_id
      WHERE is_active = TRUE
      ORDER BY id DESC
      LIMIT ${safeOffset}, ${safeLimit}
    `,
  );

  const [countRows] = await pool.execute<(RowDataPacket & { total: number })[]>(
    `
      SELECT COUNT(*) AS total
      FROM products
      WHERE is_active = TRUE
    `,
  );

  const data = rows.map((item: any) => {
    const { thumbnail_url, original_url, medium_url, tiny_url, ...rest } = item;

    return {
      ...rest,
      images: {
        thumbnail_url,
        original_url,
        medium_url,
        tiny_url,
      },
    };
  });
  return {
    items: data,
    total: countRows[0]?.total ?? 0,
  };
};

export const getProductByIdQuery = async (id: number) => {
  const [rows] = await pool.execute<(Product & RowDataPacket)[]>(
    `
      SELECT *
      FROM products
      WHERE id = ?
        AND is_active = TRUE
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
};

export const updateProductQuery = async (
  id: number,
  data: UpdateProductDto,
  slug?: string,
  db: Pool | PoolConnection = pool,
) => {
  const fields: string[] = [];
  const values: Array<number | string | null> = [];

  if (data.subcategoryId !== undefined) {
    fields.push("subcategory_id = ?");
    values.push(data.subcategoryId);
  }

  if (data.name !== undefined) {
    fields.push("name = ?", "slug = ?");
    values.push(data.name, slug || null);
  }

  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description || null);
  }

  if (data.sku !== undefined) {
    fields.push("sku = ?");
    values.push(data.sku || null);
  }

  if (data.price !== undefined) {
    fields.push("price = ?");
    values.push(data.price);
  }

  if (data.comparePrice !== undefined) {
    fields.push("compare_price = ?");
    values.push(data.comparePrice || null);
  }

  if (data.stock !== undefined) {
    fields.push("stock = ?");
    values.push(data.stock);
  }

  if (data.categoryId !== undefined) {
    fields.push("category_id = ?");
    values.push(data.categoryId);
  }

  if (data.thumbnailUrl !== undefined) {
    fields.push("thumbnail_url = ?");
    values.push(data.thumbnailUrl || null);
  }

  if (data.images !== undefined) {
    fields.push("thumbnail_url = ?");
    values.push(data.images?.thumbnail_url || null);
  }

  values.push(id);

  const [result] = await db.execute<ResultSetHeader>(
    `
      UPDATE products
      SET ${fields.join(", ")}
      WHERE id = ?
        AND is_active = TRUE
    `,
    values,
  );

  return result;
};

export const softDeleteProductQuery = async (id: number) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE products
      SET is_active = FALSE
      WHERE id = ?
        AND is_active = TRUE
    `,
    [id],
  );

  return result;
};

export const getProductDetails = async (id: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT
      p.*,
      pi.original_url,
      pi.medium_url,
      pi.thumbnail_url,
      pi.tiny_url,
      pi.is_primary
    FROM products p
    LEFT JOIN product_images pi
      ON p.id = pi.product_id
    where p.id = ?
      and p.is_active = true
    LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
};
