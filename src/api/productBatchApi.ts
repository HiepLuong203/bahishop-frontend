// src/api/productBatchApi.ts
import axiosClient from './axiosClient';
import { ProductBatchAttributes, ProductBatchStatus, UpdateBatchStatusPayload, AdjustBatchQuantityPayload } from '../types/productBatch';

const productBatchApi = {
  // Lấy tất cả lô sản phẩm
  async getAll (status?: ProductBatchStatus, productId?: number): Promise<ProductBatchAttributes[]>{
    const params: { status?: ProductBatchStatus; productId?: number } = {};
    if (status) {
      params.status = status;
    }
    if (productId) {
      params.productId = productId;
    }
    const response = await axiosClient.get('/productbatch', { params }); 
    return response.data; 
  },

  // Lấy lô sản phẩm theo ID
  async getById (id: number): Promise<ProductBatchAttributes> {
    const response = await axiosClient.get(`/productbatch/${id}`); 
    return response.data;
  },

  // Cập nhật trạng thái lô sản phẩm
  async updateStatus (id: number, payload: UpdateBatchStatusPayload): Promise<ProductBatchAttributes> {
    const response = await axiosClient.put(`/productbatch/${id}/status`, payload); 
    return response.data;
  },

  // Điều chỉnh số lượng lô sản phẩm
  async adjustQuantity (id: number, payload: AdjustBatchQuantityPayload): Promise<ProductBatchAttributes> {
    const response = await axiosClient.put(`/productbatch/${id}/adjust-quantity`, payload); 
    return response.data;
  },

  // Lấy các lô sản phẩm sắp hết hạn
  async getExpiring (days?: number, includeExpired?: boolean): Promise<ProductBatchAttributes[]> {
    const params: { days?: number; includeExpired?: boolean } = {};
    if (days !== undefined) {
      params.days = days;
    }
    if (includeExpired !== undefined) {
      params.includeExpired = includeExpired;
    }
    const response = await axiosClient.get('/productbatch/expiring', { params });
    return response.data;
  },

  // Cập nhật các lô đã hết hạn
  async updateExpired (): Promise<void> {
    const response = await axiosClient.post('/productbatch/update-expired'); 
    return response.data; 
  },
};

export default productBatchApi;