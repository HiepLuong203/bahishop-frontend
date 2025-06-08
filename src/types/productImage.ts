// src/types/productImage.ts
export interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
  display_order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Khi tạo nhiều ảnh, chúng ta chỉ cần product_id và các file
export interface CreateProductImagesInput {
  product_id: number;
  files: File[]; // Mảng các đối tượng File
}

// Khi cập nhật một ảnh, có thể có file mới hoặc chỉ cập nhật display_order
export interface UpdateProductImageInput {
  product_id?: number; // Có thể không cần khi update
  image_url?: string; // Nếu không có file mới
  display_order?: number;
  file?: File; // File mới nếu có
}
export interface ProductImagesResponse {
  images?: ProductImage[];
}