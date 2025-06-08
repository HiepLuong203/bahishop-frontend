// src/api/promotionApi.ts
import axiosClient from './axiosClient';
import { Promotion, PromotionInput } from '../types/promotion';

const promotionApi = {
  async getAll() {
    const url = '/promotions';
    return axiosClient.get<Promotion[]>(url);
  },

  async getById(id: number) {
    const url = `/promotions/${id}`;
    return axiosClient.get<Promotion>(url);
  },

  async createPromotion(data: PromotionInput) {
    const url = '/promotions';
    return axiosClient.post<Promotion>(url, data);
  },

  async updatePromotion(id: number, data: PromotionInput) {
    const url = `/promotions/${id}`;
    return axiosClient.put<Promotion>(url, data);
  },

  async deletePromotion(id: number) {
    const url = `/promotions/${id}`;
    return axiosClient.delete(url);
  },
};

export default promotionApi;