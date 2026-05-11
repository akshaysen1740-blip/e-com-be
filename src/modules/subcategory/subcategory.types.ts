export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateSubcategoryDto {
  categoryId: number;
  name: string;
  description?: string;
  createdBy: number;
}

export interface UpdateSubcategoryDto {
  categoryId?: number;
  name?: string;
  description?: string;
}
