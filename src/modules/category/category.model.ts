import pool from "../../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PaginationParams } from "../../utills/queryParams";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "./category.types";

export const createCategoryQuery = async (
  data: CreateCategoryDto,
  slug: string,
) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `
      INSERT INTO categories (
        name,
        slug,
        description,
        created_by
      )
      VALUES (?, ?, ?, ?)
    `,
    [data.name, slug, data.description || null, data.createdBy],
  );

  return result.insertId;
};

export const getAllCategoriesQuery = async ({
  limit,
  offset,
}: PaginationParams) => {
  const safeOffset = Math.max(0, Math.trunc(offset));
  const safeLimit = Math.max(1, Math.trunc(limit));

  const [rows] = await pool.query<(Category & RowDataPacket & { product_count: number })[]>(
    `
      SELECT 
          c.*,
          COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p 
          ON p.category_id = c.id
          AND p.is_active = TRUE
      WHERE c.is_active = TRUE
      GROUP BY c.id
      ORDER BY c.id DESC
      LIMIT ${safeOffset}, ${safeLimit};
    `,
  );

  const [countRows] = await pool.execute<(RowDataPacket & { total: number })[]>(
    `
      SELECT COUNT(*) AS total
      FROM categories c
      WHERE c.is_active = TRUE
    `,
  );

  return {
    items: rows,
    total: countRows[0]?.total ?? 0,
  };
};

export const getCategoryByIdQuery = async (id: number) => {
  const [rows] = await pool.execute<(Category & RowDataPacket)[]>(
    `
      SELECT *
      FROM categories
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
};

export const updateCategoryQuery = async (
  id: number,
  data: UpdateCategoryDto,
  slug?: string,
) => {
  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (data.name !== undefined) {
    fields.push("name = ?", "slug = ?");
    values.push(data.name, slug || null);
  }

  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description || null);
  }

  values.push(id);

  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE categories
      SET ${fields.join(", ")}
      WHERE id = ? AND deleted_at IS NULL
    `,
    values,
  );

  return result;
};

export const softDeleteCategoryQuery = async (id: number) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE categories
      SET deleted_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `,
    [id],
  );

  return result;
};
