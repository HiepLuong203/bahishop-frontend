// src/types/productPromotion.ts
export interface ProductPromotion {
  product_promotion_id: number;
  product_id: number;
  promotion_id: number;
  createdAt: Date;
  updatedAt: Date;
  Product?: {
    product_id: number;
    name: string;
  };
  Promotion?: {
    promotion_id: number;
    name: string;
    discount_value: number;
    discount_type: 'percentage' | 'fixed_amount';
  };
}

export interface ApplyPromotionInput {
  product_id: number;
  promotion_id: number;
}