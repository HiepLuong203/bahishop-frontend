// src/api/authApi.ts
import axiosClient from './axiosClient';
import {UpdateUserAttributes, ChangePasswordPayload} from '../types/user'; // Import interface
const authApi = {
  async login(data: { username: string; password: string }) {
    const url = '/users/login';
    return axiosClient.post(url, data);
  },
  async register(data: { username: string; email: string; password_hash: string }) {
    const url = '/users/register';
    return axiosClient.post(url, data);
  },
  async getProfile(){
    const url = "/users/profile";
    return axiosClient.get(url);
  },
  async updateProfile(data:UpdateUserAttributes) {
    const url = '/users/updateprofile';
    return axiosClient.put(url,data); // Gửi yêu cầu kích hoạt email
  },
  async getCustomerStats() {
    const url = '/users/stats-customers';
    return axiosClient.get<{
      total_customers: number;
      today_new_customers: number;
      customers: any[]; 
    }>(url);
  },
  async changePassword(data: ChangePasswordPayload) {
    const url = '/users/changepassword'; 
    return axiosClient.post(url, data);
  },
  async forgotPassword(data: { email: string }) {
    const url = '/users/forgetpassword';
    return axiosClient.post(url, data);
  },
  async resetPassword(data: { token: string; email: string; newPassword: string }) {
    const url = '/users/resetpassword';
    return axiosClient.post(url, data);
  },
};

export default authApi;