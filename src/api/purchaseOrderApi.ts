import axiosClient from './axiosClient';
import { PurchaseOrder, PurchaseOrderInput } from '../types/purchaseOrder';

const purchaseOrderApi = {
  async getAll() {
    const url = '/purchaseorders';
    return axiosClient.get<PurchaseOrder[]>(url);
  },

  async getById(id: number) {
    const url = `/purchaseorders/${id}`;
    return axiosClient.get<PurchaseOrder>(url);
  },

  async createPurchaseOrder(data: PurchaseOrderInput) {
    const url = '/purchaseorders';
    return axiosClient.post<PurchaseOrder>(url, data);
  },

  async updatePurchaseOrder(id: number, data: PurchaseOrderInput) {
    const url = `/purchaseorders/${id}`;
    return axiosClient.put<PurchaseOrder>(url, data);
  },
  async getPurchaseOrdersByDateRange(fromDate: string, toDate: string) {
    const url = `/purchaseorders/filterbydate?from=${fromDate}&to=${toDate}`;
    return axiosClient.get<PurchaseOrder[]>(url);
  },
};

export default purchaseOrderApi;