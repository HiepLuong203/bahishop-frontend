import axiosClient from './axiosClient';
import { Supplier,SupplierInput } from '../types/supplier'; // Import interface
const supplierApi = {
  async getAll() {
    const url = '/suppliers';
    return axiosClient.get<Supplier[]>(url);
  },

  async getById(id: number) {
    const url = `/suppliers/${id}`;
    return axiosClient.get<Supplier>(url);
  },

  async createSupplier(data: SupplierInput) {
    const url = '/suppliers';
    return axiosClient.post<Supplier>(url, data);
  },

  async updateSupplier(id: number, data: SupplierInput) {
    const url = `/suppliers/${id}`;
    return axiosClient.put<Supplier>(url, data);
  },

  async deleteSupplier(id: number) {
    const url = `/suppliers/${id}`;
    return axiosClient.delete(url);
  },

  async searchByName(name: string) {
    const url = `/suppliers/search?name=${name}`;
    return axiosClient.get<Supplier[]>(url);
  },
  // You can add other API calls here (getById, etc.)
};

export default supplierApi;