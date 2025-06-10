// src/pages/admin/AdminPurchaseOrdersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './AdminPurchaseOrdersPage.css';
import purchaseOrderApi from '../../api/purchaseOrderApi';
import supplierApi from '../../api/supplierApi';
import productApi from '../../api/productApi';
import { PurchaseOrder } from '../../types/purchaseOrder';
import { Supplier } from '../../types/supplier';
import { Product } from '../../types/product';
import PurchaseOrderFormModal from '../../components/admin/PurchaseOrderFormModal';
import PurchaseOrderDetailsModal from '../../components/admin/PurchaseOrderDetailsModal';
import Pagination from '../../components/Pagination'; 

const AdminPurchaseOrdersPage: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<PurchaseOrder | null>(null);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);

  // --- States for Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); 

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersResponse, suppliersResponse, productsResponse] = await Promise.all([
        purchaseOrderApi.getAll(),
        supplierApi.getAll(),
        productApi.getAll(),
      ]);
      setPurchaseOrders(ordersResponse.data);
      setSuppliers(suppliersResponse.data);
      setProducts(productsResponse.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu.');
      setLoading(false);
    }
  }, []); // useCallback dependency array is empty because it only depends on purchaseOrderApi, supplierApi, productApi which are stable.

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const getSupplierName = (supplierId: number): string => {
    const supplier = suppliers.find(s => s.supplier_id === supplierId);
    return supplier ? supplier.name : `NCC #${supplierId}`;
  };

  const handleAddPurchaseOrder = () => {
    setCurrentPurchaseOrder(null);
    setShowModal(true);
  };

  const handleEditPurchaseOrder = (order: PurchaseOrder) => {
    setCurrentPurchaseOrder(order);
    setShowModal(true);
  };

  const handleViewOrderDetails = async (orderId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await purchaseOrderApi.getById(orderId);
      setSelectedOrderDetails(response.data);
      setShowDetailsModal(true);
    } catch (err: any) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', err);
      alert(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng.');
      setError(err.response?.data?.message || 'Lỗi khi tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseOrderFormSubmitSuccess = () => {
    setShowModal(false);
    fetchPurchaseOrders();
    setCurrentPage(1); // Reset to first page after successful submission
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrderDetails(null);
  };

  const handleFilterByDate = async () => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        alert('Ngày "Từ" phải nhỏ hơn hoặc bằng ngày "Đến". Vui lòng chọn lại.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await purchaseOrderApi.getPurchaseOrdersByDateRange(fromDate, toDate);
        setPurchaseOrders(response.data);
        setCurrentPage(1); // Reset to first page after filter
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Lỗi khi lọc đơn nhập hàng theo ngày.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc để lọc.');
    }
  };

  const resetDateFilter = async () => {
    setFromDate(null);
    setToDate(null);
    setCurrentPage(1); // Reset to first page after resetting filter
    fetchPurchaseOrders(); // Tải lại tất cả đơn hàng
  };

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchaseOrders = purchaseOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div className="admin-purchase-orders-page">Đang tải đơn nhập hàng...</div>;
  }

  if (error) {
    return <div className="admin-purchase-orders-page">Lỗi: {error}</div>;
  }

  return (
    <div className="admin-purchase-orders-page">
      <h1>Quản lý Đơn nhập hàng</h1>
      <div className="admin-purchase-orders-actions">
        <button className="admin-button primary" onClick={handleAddPurchaseOrder}>Tạo Đơn nhập hàng mới</button>
        <div className="date-filter">
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
          <button className="admin-button primary" onClick={handleFilterByDate}>Lọc</button>
          {fromDate || toDate ? (
            <button className="admin-button default small" onClick={resetDateFilter}>Bỏ lọc</button>
          ) : null}
        </div>
      </div>
      {purchaseOrders.length > 0 ? (
        <>
          <table className="admin-purchase-orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nhà cung cấp</th>
                <th>Ngày đặt hàng</th>
                <th>Tổng tiền</th>
                <th>Ghi chú</th>
                <th className="action-header">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {/* Displaying only current page's orders */}
              {currentPurchaseOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{getSupplierName(order.supplier_id)}</td>
                  <td>{new Date(order.order_date).toLocaleDateString('vi-VN')}</td>
                  <td>{Number(order.total_amount).toLocaleString('vi-VN')} VNĐ</td>
                  <td>{order.note || 'Không có'}</td>
                  <td className="actions-cell">
                    <button className="admin-button secondary small" onClick={() => handleEditPurchaseOrder(order)}>Sửa</button>
                    <button className="admin-button info small" onClick={() => handleViewOrderDetails(order.id)}>Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination component */}
          <Pagination
            totalItems={purchaseOrders.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <p>Không có đơn nhập hàng nào.</p>
      )}

      {showModal && (
        <PurchaseOrderFormModal
          purchaseOrder={currentPurchaseOrder}
          onClose={() => setShowModal(false)}
          onSubmitSuccess={handlePurchaseOrderFormSubmitSuccess}
          suppliers={suppliers}
          products={products}
        />
      )}

      {showDetailsModal && selectedOrderDetails && (
        <PurchaseOrderDetailsModal
          order={selectedOrderDetails}
          onClose={handleCloseDetailsModal}
          suppliers={suppliers}
          products={products}
        />
      )}
    </div>
  );
};

export default AdminPurchaseOrdersPage;