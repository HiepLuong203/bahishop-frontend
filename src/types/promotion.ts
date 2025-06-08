// src/types/promotion.ts
export interface Promotion {
  promotion_id: number;
  name: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed'; // Ví dụ: loại giảm giá
  discount_value: number;
  start_date: string; // Hoặc Date nếu bạn muốn xử lý Date object
  end_date: string;   // Hoặc Date
  is_active?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromotionInput {
  name: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}