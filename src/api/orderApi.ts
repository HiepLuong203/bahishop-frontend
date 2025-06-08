import axiosClient from './axiosClient';
import { OrderInput, CheckoutItem, OrderResponse, Order,OrdersByDateRangeResponse } from '../types/order';

const orderApi = {
  async checkoutAll (orderData: OrderInput, items: CheckoutItem[]){
    const url = '/orders/checkout';
    return axiosClient.post<OrderResponse>(url, { ...orderData, items });
  },
  async checkoutSingle (productId: number, orderData: OrderInput){
    const url = `/orders/checkout/${productId}`;
    return axiosClient.post<OrderResponse>(url, orderData);
  },
  async getOrders() {
    const url = '/orders';
    return axiosClient.get(url);
  },
  async cancelOrderByUser(orderId: number){
    const url = `/orders/${orderId}/cancel`;
    return axiosClient.post(url);
  },
  async cancelOrderByAdmin(orderId: number) {
    const url = `/orders/cancel-order-admin/${orderId}`;
    return axiosClient.put(url);
  },
  async countAll() {
    const url = '/orders/count-all-orders';
    return axiosClient.get<{ total: number; order_completed: number; order_incompleted: number; order_cancel:number }>(url);
  },
  async getOrderByIdOrUserId(params: { order_id?: number; user_id?: number }) {
    let url = '/orders/search';
    const queryParams = new URLSearchParams();
    if (params.order_id) {
      queryParams.append('order_id', params.order_id.toString());
    }
    if (params.user_id) {
      queryParams.append('user_id', params.user_id.toString());
    }
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    return axiosClient.get<Order[]>(url);
  },
  async getOrdersByDateRange(fromDate: string, toDate: string) {
    const url = `/orders/daterange?from=${fromDate}&to=${toDate}`;
    return axiosClient.get<OrdersByDateRangeResponse>(url);
  },
  async getAllOrderByAdmin() {
    const url = '/orders/admin-allorder';
    return axiosClient.get<Order[]>(url);
  },
  async updateOrderStatusByAdmin(orderId: number, newOrderStatus: string, newPaymentStatus?: string) {
    const url = `/orders/admin-update-order/${orderId}`;
    const body: { order_status: string; payment_status?: string } = {
        order_status: newOrderStatus,
    };
    if (newPaymentStatus !== undefined) {
        body.payment_status = newPaymentStatus;
    }
    return axiosClient.put(url, body);
},
  // Các API khác liên quan đến order
};

export default orderApi;