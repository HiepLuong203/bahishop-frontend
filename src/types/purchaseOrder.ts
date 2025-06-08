export interface PurchaseOrder {
  id: number;
  supplier_id: number;
  order_date: string;
  total_amount: number;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
  PurchaseOrderDetail?: PurchaseOrderDetail[];
}

export interface PurchaseOrderDetail {
  id: number;
  purchase_order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price?: number;
  batch_code: string;      
  manufacture_date?: string; 
  expiry_date: string;      
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderInputData {
  supplier_id: number;
  order_date: string;
  note?: string | null;
}

export interface PurchaseOrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  batch_code: string;
  manufacture_date?: string; // string (YYYY-MM-DD)
  expiry_date: string;      // string (YYYY-MM-DD)
  id?: number; // Optional khi update
}

export interface PurchaseOrderInput {
  data: PurchaseOrderInputData;
  products: ProductInputForPurchaseOrder[];
}

export interface ProductInputForPurchaseOrder {
  product_id: number;
  quantity: number;
  unit_price: number;
  batch_code: string;
  manufacture_date?: string; // string (YYYY-MM-DD)
  expiry_date: string;      // string (YYYY-MM-DD)
}