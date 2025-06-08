// src/types/category.ts
export interface Category {
     category_id: number;
     name: string;
     description?: string;
     parent_id?: number | null;
     createdAt: Date;
     updatedAt: Date;
}
export interface CategoryInput {
     name: string;
     description?: string;
     parent_id?: number | null;
}