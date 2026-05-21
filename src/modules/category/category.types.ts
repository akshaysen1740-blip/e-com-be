import { QueryParams } from "../../utills/queryParams";

export interface CreateCategoryDto {
  name: string;
  description?: string;
  createdBy: number;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export type CategoryQueryParams = QueryParams;
