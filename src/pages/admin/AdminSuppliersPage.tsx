// src/pages/admin/AdminSuppliersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './AdminSuppliersPage.css'; // Sẽ tạo file CSS này
import supplierApi from '../../api/supplierApi';
import { Supplier } from '../../types/supplier';
import SupplierFormModal from '../../components/admin/SupplierFormModal'; // Sẽ tạo component này

const AdminSuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSuppliers = useCallback(async (currentSearchTerm: string = '') => {
    try {
      setLoading(true);
      let response;
      if (currentSearchTerm) {
        response = await supplierApi.searchByName(currentSearchTerm);
      } else {
        response = await supplierApi.getAll();
      }
      setSuppliers(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải nhà cung cấp.');
      setLoading(false);
    }
  }, []); // productApi đã được loại bỏ khỏi dependencies

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleAddSupplier = () => {
    setCurrentSupplier(null); // Đặt null để biết là đang thêm mới
    setShowModal(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setCurrentSupplier(supplier); // Đặt nhà cung cấp cần chỉnh sửa
    setShowModal(true);
  };

  const handleDeleteSupplier = async (supplierId: number, supplierName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp "${supplierName}" không?`)) {
      try {
        await supplierApi.deleteSupplier(supplierId);
        alert('Nhà cung cấp đã được xóa thành công!');
        fetchSuppliers(searchTerm); // Tải lại danh sách sau khi xóa
      } catch (err: any) {
        console.error('Lỗi khi xóa nhà cung cấp:', err);
        alert(`Không thể xóa nhà cung cấp: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleSupplierFormSubmitSuccess = () => {
    setShowModal(false); // Đóng modal
    fetchSuppliers(searchTerm); // Tải lại danh sách nhà cung cấp
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuppliers(searchTerm);
  };

  if (loading) {
    return <div className="admin-suppliers-page">Đang tải nhà cung cấp...</div>;
  }

  if (error) {
    return <div className="admin-suppliers-page">Lỗi: {error}</div>;
  }

  return (
    <div className="admin-suppliers-page">
      <h1>Quản lý Nhà cung cấp</h1>
      <div className="admin-suppliers-actions">
        <button className="admin-button primary" onClick={handleAddSupplier}>Thêm Nhà cung cấp</button>
      </div>
      <div className="search-container">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button type="submit" className="admin-button small">Tìm</button>
          </form>
        </div>
      {suppliers.length > 0 ? (
        <table className="admin-suppliers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Nhà cung cấp</th>
              <th>Người liên hệ</th>
              <th>Điện thoại</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th className="action-header">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.supplier_id}>
                <td>{supplier.supplier_id}</td>
                <td>{supplier.name}</td>
                <td>{supplier.contact_person || 'N/A'}</td>
                <td>{supplier.phone || 'N/A'}</td>
                <td>{supplier.email || 'N/A'}</td>
                <td>{supplier.address || 'N/A'}</td>
                <td className="actions-cell">
                  <button className="admin-button secondary small" onClick={() => handleEditSupplier(supplier)}>Sửa</button>
                  <button className="admin-button danger small" onClick={() => handleDeleteSupplier(supplier.supplier_id, supplier.name)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Không có nhà cung cấp nào.</p>
      )}

      {showModal && (
        <SupplierFormModal
          supplier={currentSupplier}
          onClose={() => setShowModal(false)}
          onSubmitSuccess={handleSupplierFormSubmitSuccess}
        />
      )}
    </div>
  );
};

export default AdminSuppliersPage;