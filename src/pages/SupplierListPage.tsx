// src/pages/SupplierListPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supplierApi from '../api/supplierApi';
import { Supplier } from '../types/supplier';
import './SupplierListPage.css'; // Đảm bảo đúng đường dẫn tới file CSS mới

interface SupplierWithImage extends Supplier {
  imageUrl?: string; // Optional property for the image URL
}

const SupplierListPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await supplierApi.getAll();
        // Tạm thời thêm URL ảnh giữ chỗ cho mỗi nhà cung cấp
        const suppliersWithImage = response.data.map((supplier: Supplier) => ({
          ...supplier,
          // Sử dụng một API ảnh placeholder đơn giản hơn
          imageUrl: `https://via.placeholder.com/150x150?text=${encodeURIComponent(supplier.name).slice(0, 15)}`, // Cắt ngắn tên nếu quá dài
        }));
        setSuppliers(suppliersWithImage);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  if (loading) {
    return (
      <div className="supplier-list-container">
        <div className="supplier-list-message supplier-list-message--loading">
          Đang tải danh sách nhà cung cấp...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="supplier-list-container">
        <div className="supplier-list-message supplier-list-message--error">
          Lỗi tải danh sách nhà cung cấp: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-list-container">
      <h1 className="supplier-list-heading">Danh sách Nhà Cung Cấp</h1>
      {suppliers.length === 0 ? (
        <div className="supplier-list-message supplier-list-message--empty">
          Không tìm thấy nhà cung cấp nào.
        </div>
      ) : (
        <ul className="supplier-list-grid"> {/* Đổi tên từ 'supplier-list' sang 'supplier-list-grid' */}
          {suppliers.map((supplier) => (
            <li key={supplier.supplier_id} className="supplier-list-item">
              <Link
                to={`/suppliers/${encodeURIComponent(supplier.name.toLowerCase().replace(/\s+/g, '-'))}-${supplier.supplier_id}`}
                className="supplier-list-item__link"
              >
                <div className="supplier-list-item__image-wrapper">
                  <img
                    src={supplier.imageUrl}
                    alt={supplier.name}
                    className="supplier-list-item__image"
                  />
                </div>
                <span className="supplier-list-item__name">{supplier.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SupplierListPage;