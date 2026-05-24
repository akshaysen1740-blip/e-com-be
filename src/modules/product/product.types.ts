import { QueryParams } from "../../utills/queryParams";

export interface Product {
  id: number;
  subcategory_id: number;
  name: string;
  slug: string;
  description?: string | null;
  sku?: string | null;
  price: number;
  compare_price?: number | null;
  stock?: number;
  thumbnail_url?: string | null;
  is_active?: boolean;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateProductDto {
  subcategoryId: number;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  comparePrice?: number;
  stock?: number;
  images?: ImageStack | null;
  createdBy: number;
  categoryId: number;
  thumbnailUrl?: string;
}

export interface ImageStack {
  original_url: string;
  medium_url: string;
  thumbnail_url: string;
  tiny_url: string;
  is_primary: boolean;
}

export interface UpdateProductDto {
  subcategoryId?: number;
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  comparePrice?: number;
  stock?: number;
  thumbnailUrl?: string;
  categoryId?: number;
  images?: ImageStack | null;
}

export type ProductQueryParams = QueryParams<{
  subcategoryId?: number;
}>;
