// src/api/reviewApi.ts
import axiosClient from './axiosClient';
import { Review,CreateReviewPayload,UpdateReviewPayload } from '../types/review';

const reviewApi = {

  async createReview(data: CreateReviewPayload) {
    const url = '/reviews';
    return axiosClient.post<Review>(url, data);
  },

  async getReviewsByProduct(product_id: number) {
    const url = `/reviews/product/${product_id}`;
    return axiosClient.get<Review[]>(url);
  },

  async updateReview(review_id: number, data: UpdateReviewPayload) {
    const url = `/reviews/${review_id}`;
    return axiosClient.put<{ message: string; review: Review }>(url, data);
  },

  async deleteReview(review_id: number) {
    const url = `/reviews/${review_id}`;
    return axiosClient.delete<{ message: string }>(url);
  },
  async countReviewsByProduct(product_id: number) {
    const url = `/reviews/${product_id}/count`;
    return axiosClient.get<{ product_id: number; review_count: number }>(url);
  }
};

export default reviewApi;