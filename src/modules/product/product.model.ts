import pool from "../../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  CreateProductDto,
  Product,
  UpdateProductDto,
} from "./product.types";

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

export const createProductQuery = async (
  data: CreateProductDto,
  slug: string,
) => {
  const [result] = await pool.execute<ResultSetHeader>(
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
      data.thumbnailUrl || null,
      data.categoryId || null,
      data.createdBy,
    ],
  );

  return result.insertId;
};

export const getAllProductsBySubcategoryIdQuery = async (subcategoryId: number) => {
  const [rows] = await pool.execute<(Product & RowDataPacket)[]>(
    `
      SELECT *
      FROM products
      WHERE subcategory_id = ?
        AND is_active = TRUE
      ORDER BY id DESC
    `,
    [subcategoryId],
  );

  return rows;
};

export const getAllProductsQuery = async () => {
  const [rows] = await pool.execute<(Product & RowDataPacket)[]>(
    `
      SELECT *
      FROM products
      WHERE is_active = TRUE
      ORDER BY id DESC
    `,
  );

  return rows;
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

  if (data.thumbnailUrl !== undefined) {
    fields.push("thumbnail_url = ?");
    values.push(data.thumbnailUrl || null);
  }

  values.push(id);

  const [result] = await pool.execute<ResultSetHeader>(
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
