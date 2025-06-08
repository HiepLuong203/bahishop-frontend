import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Đặt baseURL của backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bạn có thể thêm interceptors ở đây (ví dụ: xử lý token)
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default axiosClient;