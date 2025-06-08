// src/api/productImageApi.ts
import axiosClient from './axiosClient';
import { ProductImage,ProductImagesResponse } from '../types/productImage';

const productImageApi = {
  // Lấy tất cả ảnh của một sản phẩm cụ thể
  async getImagesByProductId(productId: number) {
    const url = `/productimage/product/${productId}/images`; 
    return axiosClient.get<ProductImagesResponse>(url);
  },

  // Thêm nhiều ảnh cho một sản phẩm
  async createProductImages(productId: number, files: File[]) {
    const url = `/productimage/${productId}/images`; 
    const formData = new FormData();
    files.forEach(file => {
      formData.append('image_url', file); 
    });

    return axiosClient.post<ProductImage[]>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Cập nhật một ảnh sản phẩm (có thể thay đổi file hoặc display_order)
  async updateProductImage(imageId: number, data: { display_order?: number; file?: File }) {
    const url = `/productimage/${imageId}`; 
    const formData = new FormData();
    if (data.display_order !== undefined) {
      formData.append('display_order', data.display_order.toString());
    }
    if (data.file) {
      formData.append('image_url', data.file); 
    }

    return axiosClient.put<ProductImage>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Xóa một ảnh sản phẩm
  async deleteProductImage(imageId: number) {
    const url = `/productimage/${imageId}`; 
    return axiosClient.delete(url);
  },
};

export default productImageApi;