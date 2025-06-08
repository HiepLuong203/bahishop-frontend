// src/pages/admin/AdminProductsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './AdminProductsPage.css';
import productApi from '../../api/productApi';
import { Product } from '../../types/product';
import ProductFormModal from '../../components/admin/ProductFormModal';
import Pagination from '../../components/Pagination'; // Import component

const ITEMS_PER_PAGE = 15;

const AdminProductsPage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchTermInput, setSearchTermInput] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productApi.getAll();
      setAllProducts(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải sản phẩm.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    setCurrentPage(1);
  }, [fetchProducts]);

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}" không?`)) {
      try {
        await productApi.deleteProduct(productId);
        alert('Sản phẩm đã được xóa thành công!');
        fetchProducts();
      } catch (err: any) {
        console.error('Lỗi khi xóa sản phẩm:', err);
        alert(`Không thể xóa sản phẩm: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleProductFormSubmitSuccess = () => {
    setShowModal(false);
    fetchProducts();
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTermInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentSearchTerm(searchTermInput);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value as 'all' | 'active' | 'inactive');
    setCurrentPage(1);
  };

  const getFilteredProducts = () => {
    let filtered = allProducts;
    if (currentSearchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(currentSearchTerm.toLowerCase())
      );
    }
    if (filterStatus === 'active') {
      filtered = filtered.filter(product => product.is_active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(product => !product.is_active);
    }
    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = filteredProducts.length;

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div>Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  return (
    <div className="admin-products-page">
      <h1>Quản lý Sản phẩm</h1>
      <div className="admin-products-actions">
        <button className="admin-button primary" onClick={handleAddProduct}>Thêm Sản phẩm</button>
      </div>
      <div className="search-filter-container">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên"
            value={searchTermInput}
            onChange={handleSearchInputChange}
          />
          <button type="submit" className="admin-button small">Tìm</button>
        </form>
        <select value={filterStatus} onChange={handleFilterChange}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Ngừng bán</option>
        </select>
      </div>
      {currentProducts.length > 0 ? (
        <>
          <table className="admin-products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Hình ảnh</th>
                <th>Giá bán</th>
                <th>Giá khuyến mãi</th>
                <th>Trạng thái</th>
                <th className="action-header">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product.product_id}>
                  <td>{product.product_id}</td>
                  <td>{product.name}</td>
                  <td>
                    {product.image_url && (
                      <img
                        src={`http://localhost:5000${product.image_url}`}
                        alt={product.name}
                        className="product-thumbnail"
                      />
                    )}
                  </td>
                  <td>{Number(product.price).toLocaleString('vi-VN')}</td>
                  <td>
                    {product.discount_price !== null && product.discount_price > 0
                      ? Number(product.discount_price).toLocaleString('vi-VN')
                      : 'No Promotion'}
                  </td>
                  <td>{product.is_active ? 'Đang bán' : 'Ngừng bán'}</td>
                  <td className="actions-cell">
                    <button className="admin-button secondary small" onClick={() => handleEditProduct(product)}>Sửa</button>
                    <button className="admin-button danger small" onClick={() => handleDeleteProduct(product.product_id, product.name)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalItems > ITEMS_PER_PAGE && (
            <Pagination
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <p>Không có sản phẩm nào.</p>
      )}

      {showModal && (
        <ProductFormModal
          product={currentProduct}
          onClose={() => setShowModal(false)}
          onSubmitSuccess={handleProductFormSubmitSuccess}
        />
      )}
    </div>
  );
};

export default AdminProductsPage;