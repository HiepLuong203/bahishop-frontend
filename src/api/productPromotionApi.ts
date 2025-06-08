// src/api/productPromotionApi.ts
import axiosClient from './axiosClient';
import { ProductPromotion, ApplyPromotionInput } from '../types/productPromotion';

const productPromotionApi = {
  async getAll() {
    const url = '/productpromotions';
    return axiosClient.get<ProductPromotion[]>(url);
  },

  async applyPromotion(data: ApplyPromotionInput) {
    const url = '/productpromotions';
    return axiosClient.post<ProductPromotion>(url, data);
  },

  async removePromotion(id: number) {
    const url = `/productpromotions/${id}`;
    return axiosClient.delete(url);
  },
};

export default productPromotionApi;