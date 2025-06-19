import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import { Link, useNavigate } from 'react-router-dom';
import productApi from '../../api/productApi';
import axiosClient from '../../api/axiosClient';
import authApi from '../../api/authApi';
import revenueApi from '../../api/revenueApi';
import { RevenueSummary } from '../../types/revenue'; 
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'; 

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
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);

  useEffect(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);

    const commonStartDate = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`;
    const commonEndDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;


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

    const fetchRevenueSummary = async () => {
      try {
        // Truyền commonStartDate và commonEndDate để đồng bộ với khoảng thời gian
        const summary = await revenueApi.getOverallSummary(commonStartDate, commonEndDate);
        setRevenueSummary(summary);
      } catch (error) {
        console.error('Lỗi khi tải tóm tắt doanh thu:', error);
        setRevenueSummary({
            actualRevenue: 0,
            pendingRevenue: 0,
            totalPurchaseCost: 0,
            grossProfit: 0
        });
      }
    };

    // Kiểm tra quyền admin
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: any = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (decodedToken?.role !== 'admin') {
          navigate('/dangnhap');
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
    fetchRevenueSummary();
  }, [navigate]);

  const formatCurrency = (value: number | string): string => {
    if (typeof value === 'string') return value;
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const summaryChartData = revenueSummary ? [
    { name: 'Doanh thu thực tế', value: revenueSummary.actualRevenue, color: '#28a745', link: '/admin/orders' },
    { name: 'Doanh thu tạm tính', value: revenueSummary.pendingRevenue, color: '#ffc107', link: '/admin/orders' },
    { name: 'Chi phí nhập hàng', value: revenueSummary.totalPurchaseCost, color: '#dc3545', link: '/admin/purchaseorders' },
    { name: 'Lợi nhuận', value: revenueSummary.grossProfit, color: '#007bff', link: '/admin/revenue' },
  ] : [];

  return (
    <div className="admin-page">
      <h1>Dashboard Admin</h1>
       
      <div className="dashboard-widgets">
        <Link to="/admin/products" className="widget-link">
          <div className="widget clickable product-widget">
            <h3>Tổng số sản phẩm</h3>
            <p>{productCounts.total}</p>
            <small>Sản phẩm đang bán: {productCounts.activeCount} | Sản phẩm ngưng bán: {productCounts.inactiveCount}</small>
          </div>
        </Link>

        <Link to="/admin/orders" className="widget-link">
          <div className="widget clickable order-widget">
            <h3>Tổng số đơn hàng</h3>
            <p>{orderCounts.total}</p>
            <small>
              Hoàn thành: {orderCounts.order_completed} | Chưa hoàn thành: {orderCounts.order_incompleted} | Đã hủy: {orderCounts.order_cancel}
            </small>
          </div>
        </Link>

        <div className="widget new-user-widget">
          <h3>Người dùng mới hôm nay</h3>
          <p>{newUserCountToday}</p>
        </div>

        
      </div>

      <div className="chart-container"> 
        {/* BIỂU ĐỒ CỘT TỔNG QUAN DOANH THU & CHI PHÍ */}
        <div className="chart-section dashboard-summary-chart">
            <h2>Tổng quan Doanh thu & Chi phí (6 tháng gần nhất)</h2>
            {revenueSummary ? (
                <ResponsiveContainer width="100%" height={350}>
                    {/* Đảm bảo chỉ có MỘT con duy nhất ở đây */}
                    <BarChart data={summaryChartData} margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="value" onClick={(data, index) => navigate(summaryChartData[index].link)}>
                            {
                                summaryChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} cursor="pointer" />
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="chart-loading-state">Đang tải dữ liệu tổng quan...</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;