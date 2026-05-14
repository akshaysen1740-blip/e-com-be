import pool from "../../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  CreateSubcategoryDto,
  Subcategory,
  UpdateSubcategoryDto,
} from "./subcategory.types";

export const findCategoryByIdQuery = async (categoryId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
      SELECT id
      FROM categories
      WHERE id = ?
        AND is_active = TRUE
      LIMIT 1
    `,
    [categoryId],
  );

  return rows[0] || null;
};

export const findSubcategoryByNameQuery = async (
  categoryId: number,
  name: string,
  excludeId?: number,
) => {
  const params: Array<number | string> = [categoryId, name];
  let query = `
    SELECT id
    FROM subcategories
    WHERE category_id = ?
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

export const createSubcategoryQuery = async (
  data: CreateSubcategoryDto,
  slug: string,
) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `
      INSERT INTO subcategories (
        category_id,
        name,
        slug,
        description,
        created_by
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [data.categoryId, data.name, slug, data.description || null, data.createdBy],
  );

  return result.insertId;
};

export const getAllSubCategoriesByCategoryID = async (categoryId: number) => {
  const [rows] = await pool.execute<(Subcategory & RowDataPacket)[]>(
    `
      SELECT *
      FROM subcategories
      WHERE is_active = TRUE
        AND category_id = ?
      ORDER BY id DESC
    `,
    [categoryId],
  );

  return rows;
};

export const getAllActiveSubcategoriesQuery = async () => {
  const [rows] = await pool.execute<(Subcategory & RowDataPacket)[]>(
    `
      SELECT *
      FROM subcategories
      WHERE is_active = TRUE
      ORDER BY id DESC
    `,
  );
  return rows
}

export const getSubcategoryByIdQuery = async (id: number) => {
  const [rows] = await pool.execute<(Subcategory & RowDataPacket)[]>(
    `
      SELECT *
      FROM subcategories
      WHERE id = ?
        AND is_active = TRUE
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
};

export const updateSubcategoryQuery = async (
  id: number,
  data: UpdateSubcategoryDto,
  slug?: string,
) => {
  const fields: string[] = [];
  const values: Array<number | string | null> = [];

  if (data.categoryId !== undefined) {
    fields.push("category_id = ?");
    values.push(data.categoryId);
  }

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
      UPDATE subcategories
      SET ${fields.join(", ")}
      WHERE id = ?
        AND is_active = TRUE
    `,
    values,
  );

  return result;
};

export const softDeleteSubcategoryQuery = async (id: number) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE subcategories
      SET is_active = FALSE
      WHERE id = ?
        AND is_active = TRUE
    `,
    [id],
  );

  return result;
};
