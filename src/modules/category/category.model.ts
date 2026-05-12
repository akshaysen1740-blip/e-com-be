import pool from "../../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Category, CreateCategoryDto, UpdateCategoryDto } from "./category.types";

export const createCategoryQuery = async (
  data: CreateCategoryDto,
  slug: string
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
    [
      data.name,
      slug,
      data.description || null,
      data.createdBy,
    ]
  );

  return result.insertId;
};

export const getAllCategoriesQuery = async () => {
  const [rows] = await pool.execute<(Category & RowDataPacket)[]>(
    `
      SELECT *
      FROM categories
      WHERE is_active = TRUE
      ORDER BY id DESC
    `,
  );

  return rows;
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
