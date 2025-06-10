// src/types/revenue.ts

export interface RevenueSummary {
  actualRevenue: number;
  pendingRevenue: number;
  totalPurchaseCost: number;
  grossProfit: number;
}

export interface RevenueTrendData {
  label: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface TopProduct {
  product_id: string; 
  name: string; 
  unit: string;
  total_quantity_sold: number; 
  total_revenue_from_product: number; 
}

export type TimeInterval = 'day' | 'month' | 'year';
