import { Product } from './product';

export interface CartItemWithProduct {
  cart_item_id: number;
  user_id: number;
  product_id: number;
  name_product?: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product; // Thông tin chi tiết của sản phẩm
}

export interface CartItemInput {
  product_id: number;
  quantity?: number;
}
export interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}