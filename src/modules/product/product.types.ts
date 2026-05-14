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
  thumbnailUrl?: string;
  createdBy: number;
  categoryId : number
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
}
