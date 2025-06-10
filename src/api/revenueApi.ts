// src/api/revenueApi.ts
import axiosClient from './axiosClient'; 
import { RevenueSummary, RevenueTrendData, TopProduct, TimeInterval } from '../types/revenue'; // Đảm bảo đường dẫn đến file types/revenue.ts là đúng

// tái sử dụng tham số ngày
const buildDateParams = (startDate?: string, endDate?: string) => {
  const params: { startDate?: string; endDate?: string } = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return params;
};

const revenueApi = {
  async getOverallSummary(startDate?: string, endDate?: string): Promise<RevenueSummary> {
    try {
      const response = await axiosClient.get('/revenue/summary', {
        params: buildDateParams(startDate, endDate),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch revenue summary:', error);
      throw error;
    }
  },

  async getRevenueTrend(
    interval: TimeInterval,
    startDate?: string,
    endDate?: string
  ): Promise<RevenueTrendData[]> {
    try {
      const params = {
        interval,
        ...buildDateParams(startDate, endDate),
      };
      const response = await axiosClient.get('/revenue/trend', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch revenue trend:', error);
      throw error;
    }
  },

  async getTopSellingProducts(
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<TopProduct[]> {
    try {
      const params = {
        limit,
        ...buildDateParams(startDate, endDate),
      };
      const response = await axiosClient.get('/revenue/top-selling', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top-selling products:', error);
      throw error;
    }
  },
};

export default revenueApi;