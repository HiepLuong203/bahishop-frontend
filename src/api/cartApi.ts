import axiosClient from './axiosClient';
import {CartItemInput} from '../types/cartItem'; 

const cartApi = {
  async getCart() {
    const url = `/cartitems/mycart`; 
    return axiosClient.get(url);
  },

  async addToCart(data: CartItemInput) {
    const url = `/cartitems`; 
    return axiosClient.post(url, data);
  },

  async removeFromCart(productId: number) {
    const url = `/cartitems/${productId}`; 
    return axiosClient.delete(url);
  },
  async updateQuantity(productId: number, quantity: number) {
    const url = '/cartitems/update';
    return axiosClient.put(url, { product_id: productId, quantity });
  }

};

export default cartApi;