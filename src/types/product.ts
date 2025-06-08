import { Category } from './category'; 
import { Supplier } from './supplier';
export interface Product {
  product_id: number;
  name: string;
  description?: string;
  category_id: number;
  price: number;
  discount_price: number | null;
  unit: string;
  origin?: string;
  image_url?: string;
  rating?: number;
  view_count?: number;
  is_featured?: boolean;
  is_active?: boolean;
  createdAt: Date;
  updatedAt: Date;
  supplier_id?: number | null;
  is_new?: boolean;
  category?: Category;
  supplier?: Supplier; 
}
export interface PriceFilter {
  min: number | null;
  max: number | null;
}

// Định nghĩa kiểu dữ liệu cho ProductInput (khi tạo/cập nhật)
export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  category_id: number;
  supplier_id?: number | null;
  is_active?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  origin?: string;
  unit:string
  // image_url sẽ được gửi dưới dạng FormData
}
export interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductWithDetails extends Product {
  images?: ProductImage[];
}
