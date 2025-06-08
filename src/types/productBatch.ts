// src/types/productBatch.ts

// Enum cho trạng thái lô sản phẩm để sử dụng nhất quán
export enum ProductBatchStatusEnum {
  Available = 'available',
  Expired = 'expired',
  Quarantined = 'quarantined',
  SoldOut = 'sold_out',
}

// Kiểu dữ liệu cho trạng thái lô sản phẩm
export type ProductBatchStatus =
  | 'available'
  | 'expired'
  | 'quarantined'
  | 'sold_out';

// Thuộc tính cơ bản của ProductBatch
export interface ProductBatchAttributes {
  batch_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  batch_code: string;
  manufacture_date?: Date | string; 
  expiry_date: Date | string; 
  import_price: number;
  status: ProductBatchStatus;
  createdAt: Date;
  updatedAt: Date;
  // Thêm thông tin sản phẩm liên quan
  product?: {
    product_id: number;
    name: string;
    unit: string;
  };
}

// Payload khi tạo hoặc cập nhật lô sản phẩm (thường được gọi từ PurchaseOrder)
export interface ProductBatchInput {
  product_id: number;
  quantity: number;
  unit_price: number;
  batch_code: string;
  manufacture_date?: string; // Định dạng YYYY-MM-DD
  expiry_date: string; // Định dạng YYYY-MM-DD
  // Status sẽ được backend tự động thiết lập ban đầu là 'available'
}

// Payload khi cập nhật trạng thái lô sản phẩm
export interface UpdateBatchStatusPayload {
  newStatus: ProductBatchStatus;
}

// Payload khi điều chỉnh số lượng lô sản phẩm
export interface AdjustBatchQuantityPayload {
  quantityChange: number; // Số dương để tăng, số âm để giảm
  reason?: string; // Lý do điều chỉnh (hỏng, mất, v.v.)
}