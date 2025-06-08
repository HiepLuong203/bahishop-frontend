import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import { Link, useNavigate } from 'react-router-dom';
import productApi from '../../api/productApi'; // Import productApi
import axiosClient from '../../api/axiosClient'; // Vẫn cần cho các API khác
import authApi from '../../api/authApi';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [productCounts, setProductCounts] = useState<{
    total: number | string;
    activeCount: number | string;
    inactiveCount: number | string;
  }>({
    total: 'Đang tải...',
    activeCount: 'Đang tải...',
    inactiveCount: 'Đang tải...',
  });
  const [orderCounts, setOrderCounts] = useState<{
    total: number | string;
    order_completed: number | string;
    order_incompleted: number | string;
    order_cancel: number | string;
  }>({
    total: 'Đang tải...',
    order_completed: 'Đang tải...',
    order_incompleted: 'Đang tải...',
    order_cancel: 'Đang tải...',
  });
  const [newUserCountToday, setNewUserCountToday] = useState<number | string>('Đang tải...');
  useEffect(() => {
    
    const fetchProductCounts = async () => {
      try {
        const response = await productApi.countAll();
        setProductCounts(response.data);
      } catch (error) {
        console.error('Lỗi khi tải số lượng sản phẩm:', error);
        setProductCounts({ total: 'Lỗi', activeCount: 'Lỗi', inactiveCount: 'Lỗi' });
      }
    };

    const fetchOrderCounts = async () => {
      try {
        const response = await axiosClient.get('/orders/count-all-orders');
        setOrderCounts(response.data);
      } catch (error) {
        console.error('Lỗi khi tải số lượng đơn hàng:', error);
        setOrderCounts({ total: 'Lỗi', order_completed: 'Lỗi', order_incompleted: 'Lỗi', order_cancel: 'Lỗi' });
      }
    };

    const fetchNewUsersTodayCount = async () => {
      try {
        const response = await authApi.getCustomerStats();
        setNewUserCountToday(response.data.today_new_customers);
      } catch (error) {
        console.error('Lỗi khi tải số lượng người dùng mới hôm nay:', error);
        setNewUserCountToday('Lỗi');
      }
    };
    const token = localStorage.getItem('authToken');
    if (token) {
      // Giải mã token để kiểm tra role
      try {
        const decodedToken: any = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (decodedToken?.role !== 'admin') {
          navigate('/dangnhap'); // Hoặc trang khác
        }
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
        navigate('/dangnhap');
      }
    } else {
      navigate('/dangnhap');
    }
    fetchProductCounts();
    fetchOrderCounts();
    fetchNewUsersTodayCount();
  }, [navigate]);

  return (
    <div className="admin-page">
      <h1>Dashboard Admin</h1>
      <div className="dashboard-widgets">
        <Link to="/admin/products" className="widget-link">
          <div className="widget clickable">
            <h3>Tổng số sản phẩm</h3>
            <p>{productCounts.total}</p>
            <small style={{ fontSize: '15px', color: 'black' }}>Sản phẩm đang bán: {productCounts.activeCount} | Sản phẩm ngưng bán: {productCounts.inactiveCount}</small>
          </div>
        </Link>
        <Link to="/admin/orders" className="widget-link">
          <div className="widget">
            <h3>Tổng số đơn hàng</h3>
            <p>{orderCounts.total}</p>
            <small style={{ fontSize: '1em', color: 'black' }}>
              Hoàn thành: {orderCounts.order_completed} | Chưa hoàn thành: {orderCounts.order_incompleted} | Đã hủy: {orderCounts.order_cancel}
            </small>
            </div>
        </Link>

        <div className="widget">
          <h3>Người dùng mới hôm nay</h3>
          <p>{newUserCountToday}</p>
        </div>
        {/* Thêm các widget thống kê khác nếu cần */}
      </div>
      {/* Bạn có thể thêm biểu đồ, bảng thống kê chi tiết hơn ở đây */}
    </div>
  );
};

export default DashboardPage;