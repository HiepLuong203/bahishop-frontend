// src/pages/admin/AdminOrdersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './AdminOrdersPage.css';
import orderApi from '../../api/orderApi';
import { Order, OrderCounts, EditingStatus } from '../../types/order';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import Pagination from '../../components/Pagination';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCounts, setOrderCounts] = useState<OrderCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'order_id' | 'user_id'>('order_id');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<EditingStatus>({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentUpdateOrderId, setCurrentUpdateOrderId] = useState<number | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); 

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all orders
      const ordersResponse = await orderApi.getAllOrderByAdmin();
      setOrders(ordersResponse.data);

      // Fetch order counts
      const countsResponse = await orderApi.countAll();
      setOrderCounts(countsResponse.data);

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải đơn hàng.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId} không?`)) {
      try {
        await orderApi.cancelOrderByAdmin(orderId);
        alert('Đơn hàng đã được hủy thành công!');
        fetchOrders(); // Tải lại danh sách
      } catch (err: any) {
        console.error('Lỗi khi hủy đơn hàng:', err);
        alert(`Không thể hủy đơn hàng: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) {
      alert('Vui lòng nhập ID đơn hàng hoặc ID người dùng để tìm kiếm.');
      return;
    }
    setLoading(true);
    try {
      let response;
      if (searchType === 'order_id') {
        response = await orderApi.getOrderByIdOrUserId({ order_id: parseInt(searchTerm, 10) });
      } else {
        response = await orderApi.getOrderByIdOrUserId({ user_id: parseInt(searchTerm, 10) });
      }
      setOrders(response.data);
      setCurrentPage(1); // Reset to first page after search
      setFilterStatus('all'); // Reset filter when searching
      setFromDate(null); // Reset date filter
      setToDate(null); // Reset date filter
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tìm kiếm đơn hàng.');
      setOrders([]); // Clear orders if search fails
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByDate = async () => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      if (from > to) {
        alert('Ngày "Từ" phải nhỏ hơn hoặc bằng ngày "Đến". Vui lòng chọn lại.');
        return;
      }

      setLoading(true);
      try {
        const fromISO = from.toISOString();
        const toISO = to.toISOString();
        const response = await orderApi.getOrdersByDateRange(fromISO, toISO);
        setOrders(response.data.orders);
        setCurrentPage(1); // Reset to first page after filter
        setSearchTerm('');
        setFilterStatus('all');
      } catch (error: any) {
        setError(error.message || 'Lỗi khi lọc đơn nhập hàng theo ngày.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc để lọc.');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSearchType('order_id');
    setFilterStatus('all');
    setFromDate(null);
    setToDate(null);
    setCurrentPage(1); // Reset to first page after reset
    fetchOrders(); // Tải lại tất cả đơn hàng
  };

  const getFilteredOrders = () => {
    if (filterStatus === 'all') {
      return orders;
    }
    return orders.filter(order => order.order_status === filterStatus);
  };
  const filteredOrders = getFilteredOrders();

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleOrderStatusChange = (orderId: number, newStatus: string) => {
    setEditingStatus(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], order_status: newStatus },
    }));
  };

  const handlePaymentStatusChange = (orderId: number, newPaymentStatus: string) => {
    setEditingStatus(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], payment_status: newPaymentStatus },
    }));
  };

  const handleUpdateRequest = (orderId: number) => {
    setCurrentUpdateOrderId(orderId);
    setShowUpdateModal(true);

  };

  const handleCloseUpdateModal = () => {
    setCurrentUpdateOrderId(null);
    setShowUpdateModal(false);
  };

  const handleFinalUpdateStatus = async () => {
    if (currentUpdateOrderId) {
      const updates = editingStatus[currentUpdateOrderId] || {};
      const currentOrder = orders.find(o => o.order_id === currentUpdateOrderId);
      const currentOrderStatus = currentOrder?.order_status || 'pending';
      const currentPaymentStatus = currentOrder?.payment_status || 'pending';
      const newOrderStatus = updates.order_status !== undefined ? updates.order_status : currentOrderStatus;
      const newPaymentStatus = updates.payment_status !== undefined ? updates.payment_status : currentPaymentStatus;

      setLoading(true);
      try {
        await orderApi.updateOrderStatusByAdmin(currentUpdateOrderId, newOrderStatus, newPaymentStatus);
        alert(`Đã cập nhật trạng thái đơn hàng #${currentUpdateOrderId}`);
        setEditingStatus(prev => {
          const newState = { ...prev };
          delete newState[currentUpdateOrderId];
          return newState;
        });
        setShowUpdateModal(false);
        setCurrentUpdateOrderId(null);
        fetchOrders();
      } catch (error: any) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        alert(`Không thể cập nhật trạng thái đơn hàng: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div>Đang tải đơn hàng...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  return (
    <div className="admin-orders-page">
      <h1>Quản lý Đơn hàng</h1>

      {orderCounts && (
        <div className="order-summary-cards">
          <div className="summary-card">
            <h3>Tổng số đơn hàng</h3>
            <p>{orderCounts.total}</p>
          </div>
          <div className="summary-card completed">
            <h3>Đơn hàng đã hoàn thành</h3>
            <p>{orderCounts.order_completed}</p>
          </div>
          <div className="summary-card incompleted">
            <h3>Đơn hàng chưa hoàn thành</h3>
            <p>{orderCounts.order_incompleted}</p>
          </div>
          <div className="summary-card cancelled">
            <h3>Đơn hàng đã hủy</h3>
            <p>{orderCounts.order_cancel}</p>
          </div>
        </div>
      )}

      <div className="admin-orders-controls">
        <div className="search-filter-section">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <select value={searchType} onChange={(e) => setSearchType(e.target.value as 'order_id' | 'user_id')}>
              <option value="order_id">Tìm theo ID Đơn hàng</option>
              <option value="user_id">Tìm theo ID Người dùng</option>
            </select>
            <input
              type="text"
              placeholder={`Nhập ID ${searchType === 'order_id' ? 'đơn hàng' : 'người dùng'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="admin-button small">Tìm</button>
          </form>

          <div className="date-filter-section">
            <label htmlFor="fromDate">Từ ngày:</label>
            <input
              type="date"
              id="fromDate"
              value={fromDate || ''}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <label htmlFor="toDate">Đến ngày:</label>
            <input
              type="date"
              id="toDate"
              value={toDate || ''}
              onChange={(e) => setToDate(e.target.value)}
            />
            <button className="admin-button secondary small" onClick={handleFilterByDate}>Lọc ngày</button>
          </div>

          <div className="status-filter-section">
            <label htmlFor="status-filter">Trạng thái:</label>
            <select id="status-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đã giao</option>
              <option value="delivered">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <button className="admin-button default small" onClick={resetFilters}>Xóa bộ lọc</button>
        </div>
      </div>

      {currentOrders.length > 0 ? (
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th>ID Đơn hàng</th>
              <th>ID Người dùng</th>
              <th>Tổng tiền</th>
              <th>Ngày đặt hàng</th>
              <th>Trạng thái</th>
              <th>Phương thức TT</th>
              <th>Trạng thái TT</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order) => (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                <td>{order.user_id}</td>
                <td>{Number(order.total_amount).toLocaleString('vi-VN')} VNĐ</td>
                <td>{new Date(order.order_date).toLocaleDateString('vi-VN')}</td>
                <td>{order.order_status}</td>
                <td>{order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</td>
                <td>{order.payment_status}</td>
                <td className="actions-cell">
                  <button className="admin-button info small" onClick={() => handleViewDetails(order)}>Chi tiết</button>
                  <button className="admin-button secondary small" onClick={() => handleUpdateRequest(order.order_id)}>
                    Cập nhật
                  </button>
                  {order.order_status === 'pending' && (
                    <button className="admin-button danger small" onClick={() => handleCancelOrder(order.order_id)}>Hủy</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Không tìm thấy đơn hàng nào.</p>
      )}

      <Pagination
        totalItems={filteredOrders.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseDetailsModal}
        />
      )}
      {showUpdateModal && currentUpdateOrderId && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={handleCloseUpdateModal}>&times;</span>
            <h2>Cập nhật trạng thái đơn hàng #{currentUpdateOrderId}</h2>
            <div className="modal-body">
              <label htmlFor={`order-status-${currentUpdateOrderId}`}>Trạng thái đơn hàng:</label>
              <select
                id={`order-status-${currentUpdateOrderId}`}
                value={editingStatus[currentUpdateOrderId]?.order_status || orders.find(o => o.order_id === currentUpdateOrderId)?.order_status || 'pending'}
                onChange={(e) => handleOrderStatusChange(currentUpdateOrderId, e.target.value)}
              >
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đã giao</option>
                <option value="delivered">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>

              <label htmlFor={`payment-status-${currentUpdateOrderId}`} style={{ marginTop: '10px' }}>Trạng thái thanh toán:</label>
              <select
                id={`payment-status-${currentUpdateOrderId}`}
                value={editingStatus[currentUpdateOrderId]?.payment_status || orders.find(o => o.order_id === currentUpdateOrderId)?.payment_status || 'pending'}
                onChange={(e) => handlePaymentStatusChange(currentUpdateOrderId, e.target.value)}
              >
                <option value="pending">Chưa thanh toán</option>
                <option value="paid">Đã thanh toán</option>
                <option value="failed">Thanh toán thất bại</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="admin-button primary" onClick={handleFinalUpdateStatus}>Xác nhận</button>
              <button className="admin-button default" onClick={handleCloseUpdateModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;