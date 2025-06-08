export type PaymentMethod = 'cod' | 'bank_transfer';
export interface OrderItemProduct {
  name: string;
}
export interface OrderInput {
  shipping_name: string;
  shipping_address: string;
  shipping_phone: string;
  payment_method: PaymentMethod;
  notes?: string;
}

export interface CheckoutItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_price?: number | null;
  total_price: number;
}

export interface OrderResponse {
  order_id: number;
  order: Order;
  qr_code_url?:string;
  // Có thể có thêm các trường khác trong response
}
export interface OrderItem {
  id: number; 
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_price?: number | null;
  total_price: number;
  createdAt: Date;
  updatedAt: Date;
  product?: OrderItemProduct;
}


export interface Order {
  order_id: number;
  user_id: number;
  total_amount: number;
  order_date: string; // Backend có thể trả về string, hoặc Date
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: PaymentMethod;
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_address: string;
  shipping_name: string;
  shipping_phone: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[]; // Mối quan hệ với OrderItem
  qr_code_url?: string;
}
export interface OrderCounts {
  total: number;
  order_completed: number;
  order_incompleted: number;
  order_cancel: number;
}

export interface OrdersByDateRangeResponse {
  orders: Order[];
}
export interface EditingStatus {
  [orderId: number]: {
    order_status?: string;
    payment_status?: string;
  };
}
export interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}