// src/pages/admin/RevenuePage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid // Import thêm cho biểu đồ đường
} from 'recharts';
import './RevenuePage.css';
import revenueApi from '../../api/revenueApi';
import { TopProduct, RevenueTrendData, TimeInterval } from '../../types/revenue'; // Đảm bảo import RevenueTrendData

const RevenuePage: React.FC = () => {
  const navigate = useNavigate();

  // Hàm helper để lấy ngày hiện tại hoặc 6 tháng trước ở định dạng ISO
  const getFormattedDate = (date: Date): string => date.toISOString().split('T')[0];

  // --- STATES CHO BIỂU ĐỒ TOP SELLING PRODUCTS ---
  const [topSellStartDate, setTopSellStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return getFormattedDate(d);
  });
  const [topSellEndDate, setTopSellEndDate] = useState<string>(getFormattedDate(new Date()));
  const [topSellingProducts, setTopSellingProducts] = useState<TopProduct[]>([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);
  const [topSellError, setTopSellError] = useState<string | null>(null);

  // --- STATES CHO BIỂU ĐỒ DOANH THU XU HƯỚNG ---
  const [trendStartDate, setTrendStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return getFormattedDate(d);
  });
  const [trendEndDate, setTrendEndDate] = useState<string>(getFormattedDate(new Date()));
  const [revenueTrendData, setRevenueTrendData] = useState<RevenueTrendData[]>([]);
  const [loadingRevenueTrend, setLoadingRevenueTrend] = useState(true);
  const [trendInterval, setTrendInterval] = useState<TimeInterval>('month'); // Mặc định xem theo tháng
  const [revenueTrendError, setRevenueTrendError] = useState<string | null>(null);

  // Hàm định dạng tiền tệ
  const formatCurrency = (value: number | string): string => {
    if (typeof value === 'string') return value;
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // --- EFFECT CHUNG ĐỂ KIỂM TRA QUYỀN ADMIN ---
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/dangnhap');
      return;
    }
    try {
      const decodedToken: any = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (decodedToken?.role !== 'admin') {
        navigate('/dangnhap');
      }
    } catch (err) {
      console.error("Lỗi giải mã token:", err);
      navigate('/dangnhap');
    }
  }, [navigate]);

  // --- EFFECT RIÊNG CHO TOP SELLING PRODUCTS ---
  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      // Validate ngày
      const start = new Date(topSellStartDate);
      const end = new Date(topSellEndDate);
      if (start > end) {
        setTopSellError('Ngày bắt đầu không thể lớn hơn ngày kết thúc cho sản phẩm bán chạy.');
        setTopSellingProducts([]);
        setLoadingTopProducts(false);
        return;
      } else {
        setTopSellError(null);
      }

      setLoadingTopProducts(true);
      try {
        const products = await revenueApi.getTopSellingProducts(10, topSellStartDate, topSellEndDate);
        setTopSellingProducts(products);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm bán chạy nhất:', err);
        setTopSellingProducts([]);
        setTopSellError('Không thể tải dữ liệu sản phẩm bán chạy. Vui lòng thử lại sau.');
      } finally {
        setLoadingTopProducts(false);
      }
    };
    if (localStorage.getItem('authToken')) {
        fetchTopSellingProducts();
    }
  }, [topSellStartDate, topSellEndDate]);

  // --- EFFECT RIÊNG CHO DOANH THU XU HƯỚNG ---
  useEffect(() => {
    const fetchRevenueTrend = async () => {
      // Validate ngày
      const start = new Date(trendStartDate);
      const end = new Date(trendEndDate);
      if (start > end) {
        setRevenueTrendError('Ngày bắt đầu không thể lớn hơn ngày kết thúc cho xu hướng doanh thu.');
        setRevenueTrendData([]);
        setLoadingRevenueTrend(false);
        return;
      } else {
        setRevenueTrendError(null);
      }

      setLoadingRevenueTrend(true);
      try {
        const trend = await revenueApi.getRevenueTrend(trendInterval, trendStartDate, trendEndDate);
        setRevenueTrendData(trend);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu xu hướng doanh thu:', err);
        setRevenueTrendData([]);
        setRevenueTrendError('Không thể tải dữ liệu xu hướng doanh thu. Vui lòng thử lại sau.');
      } finally {
        setLoadingRevenueTrend(false);
      }
    };
    if (localStorage.getItem('authToken')) {
        fetchRevenueTrend();
    }
  }, [trendStartDate, trendEndDate, trendInterval]);

  // Chuẩn bị dữ liệu cho biểu đồ tròn Top sản phẩm bán chạy
  const topSellingPieChartData = topSellingProducts.map(p => ({
    name: p.name,
    value: p.total_revenue_from_product,
  }));

  // Mảng màu cho biểu đồ tròn
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A0', '#19FFD4', '#6A8BFF', '#FF6A6A', '#6AFF6A'];

  return (
    <div className="revenue-page">
      <h1>Phân tích Doanh thu & Sản phẩm</h1>

      <div className="chart-grid">
        {/* BIỂU ĐỒ TOP SẢN PHẨM BÁN CHẠY */}
        <div className="chart-section full-width">
          <h2>Top Sản phẩm Bán chạy theo Doanh thu (Top 10)</h2>
          <div className="chart-filter-group">
            <label>
              Từ ngày:
              <input
                type="date"
                value={topSellStartDate}
                onChange={(e) => setTopSellStartDate(e.target.value)}
                className="date-input"
              />
            </label>
            <label>
              Đến ngày:
              <input
                type="date"
                value={topSellEndDate}
                onChange={(e) => setTopSellEndDate(e.target.value)}
                className="date-input"
              />
            </label>
          </div>
          {topSellError && <p className="error-message">{topSellError}</p>}

          {loadingTopProducts ? (
            <div className="chart-loading-state">Đang tải sản phẩm bán chạy...</div>
          ) : topSellingProducts.length === 0 ? (
            <div className="chart-no-data">Không có dữ liệu sản phẩm bán chạy trong khoảng thời gian đã chọn.</div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={topSellingPieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                >
                  {topSellingPieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${formatCurrency(value)}`, name]} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* BIỂU ĐỒ ĐƯỜNG DOANH THU XU HƯỚNG */}
        <div className="chart-section full-width">
          <h2> Doanh thu theo {trendInterval === 'day' ? 'Ngày' : trendInterval === 'month' ? 'Tháng' : 'Năm'}</h2>
          <div className="chart-filter-group">
            <label>
              Từ ngày:
              <input
                type="date"
                value={trendStartDate}
                onChange={(e) => setTrendStartDate(e.target.value)}
                className="date-input"
              />
            </label>
            <label>
              Đến ngày:
              <input
                type="date"
                value={trendEndDate}
                onChange={(e) => setTrendEndDate(e.target.value)}
                className="date-input"
              />
            </label>
            <label>
              Xem theo:
              <select
                value={trendInterval}
                onChange={(e) => setTrendInterval(e.target.value as TimeInterval)}
                className="interval-select"
              >
                <option value="day">Ngày</option>
                <option value="month">Tháng</option>
                <option value="year">Năm</option>
              </select>
            </label>
          </div>
          {revenueTrendError && <p className="error-message">{revenueTrendError}</p>}

          {loadingRevenueTrend ? (
            <div className="chart-loading-state">Đang tải xu hướng doanh thu...</div>
          ) : revenueTrendData.length === 0 ? (
            <div className="chart-no-data">Không có dữ liệu xu hướng doanh thu trong khoảng thời gian đã chọn.</div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenueTrendData} margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" /> {/* ĐÃ SỬA: dataKey khớp với 'label' từ backend */}
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number, name: string) => [`${formatCurrency(value)}`, name]} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} name="Doanh thu" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="cost" stroke="#82ca9d" strokeWidth={3} name="Chi phí" />
                <Line type="monotone" dataKey="profit" stroke="#ffc658" strokeWidth={3} name="Lợi nhuận" />
              </LineChart>
            </ResponsiveContainer>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;