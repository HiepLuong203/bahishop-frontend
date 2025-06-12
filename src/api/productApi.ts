// src/api/productApi.ts
import axiosClient from './axiosClient';
import { Product } from '../types/product';

const productApi = {
  async getAll() {
    const url = '/products';
    return axiosClient.get<Product[]>(url);
  },
  async searchByName(name: string) {
    const url = `/products/search?name=${name}`;
    return axiosClient.get<Product[]>(url);
  },
  async getByCategory(categoryId: number) {
    const url = `/products/category/${categoryId}`;
    return axiosClient.get<Product[]>(url);
  },
  async getById(id: number) {
    const url = `/products/${id}`;
    return axiosClient.get<Product>(url);
  },
  async getByStatus(isActive: boolean) {
    const url = `/products/status?is_active=${isActive}`;
    return axiosClient.get<Product[]>(url);
  },
  async filterByPrice(minPrice: number, maxPrice: number) {
    const url = `/products/filter/price?min=${minPrice}&max=${maxPrice}`;
    return axiosClient.get<Product[]>(url);
  },
  async countAll() {
    const url = '/products/count-all-products';
    return axiosClient.get<{ total: number; activeCount: number; inactiveCount: number }>(url);
  },
  async createProduct(data: FormData) { // Nhận FormData vì có thể có file ảnh
    const url = '/products';
    return axiosClient.post<Product>(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data', // gửi file
      },
    });
  },
  async updateProduct(productId: number, data: FormData) { 
    const url = `/products/${productId}`;
    return axiosClient.put<Product>(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
  },
  async deleteProduct(productId: number) {
    const url = `/products/${productId}`;
    return axiosClient.delete(url);
  },
};

export default productApi;