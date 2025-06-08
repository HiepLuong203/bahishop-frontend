// src/api/categoryApi.ts
import axiosClient from './axiosClient';
import { Category, CategoryInput } from '../types/category'; 
const categoryApi = {
  async getAll() {
    const url = '/categories';
    return axiosClient.get<Category[]>(url);
  },
   async getById(categoryId: number) {
    const url = `/categories/${categoryId}`;
    return axiosClient.get<Category>(url);
  },

  async createCategory(data: CategoryInput) {
    const url = '/categories';
    return axiosClient.post<Category>(url, data);
  },

  async updateCategory(categoryId: number, data: CategoryInput) {
    const url = `/categories/${categoryId}`;
    return axiosClient.put<Category>(url, data);
  },

  async deleteCategory(categoryId: number) {
    const url = `/categories/${categoryId}`;
    return axiosClient.delete(url);
  },
};

export default categoryApi;