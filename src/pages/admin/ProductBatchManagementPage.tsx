// src/pages/admin/ProductBatchManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import productBatchApi from '../../api/productBatchApi';
import productApi from '../../api/productApi'; // Để lấy danh sách sản phẩm
import { ProductBatchAttributes, ProductBatchStatus, ProductBatchStatusEnum } from '../../types/productBatch';
import { Product } from '../../types/product';
import ProductBatchFormModal from '../../components/admin/ProductBatchFormModal';
import ProductBatchDetailsModal from '../../components/admin/ProductBatchDetailsModal';
import ConfirmationModal from '../../components/admin/ConfirmationModal'; 
import Pagination from '../../components/Pagination'; 
import './ProductBatchManagementPage.css';

const ProductBatchManagementPage: React.FC = () => {
  const [batches, setBatches] = useState<ProductBatchAttributes[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<ProductBatchAttributes | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionBatchId, setActionBatchId] = useState<number | null>(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<ProductBatchStatus | 'all'>('all');
  const [filterProductId, setFilterProductId] = useState<number | 'all'>('all');
  const [filterDaysToExpiry, setFilterDaysToExpiry] = useState<number | ''>('');
  const [includeExpiredFilter, setIncludeExpiredFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // --- Pagination states ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Display 10 batches per page

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedBatches: ProductBatchAttributes[];
      if (filterDaysToExpiry !== '' && filterDaysToExpiry >= 0) {
        fetchedBatches = await productBatchApi.getExpiring(Number(filterDaysToExpiry), includeExpiredFilter);
      } else {
        fetchedBatches = await productBatchApi.getAll(
          filterStatus !== 'all' ? filterStatus : undefined,
          filterProductId !== 'all' ? Number(filterProductId) : undefined
        );
      }

      // Client-side search by product name or batch code
      const filteredBySearch = fetchedBatches.filter(batch => {
        const productName = batch.product?.name?.toLowerCase() || '';
        const batchCode = batch.batch_code?.toLowerCase() || '';
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return productName.includes(lowerCaseSearchTerm) || batchCode.includes(lowerCaseSearchTerm);
      });

      setBatches(filteredBySearch);
      setCurrentPage(1); // Reset to first page when new filters are applied or fetched
    } catch (err: any) {
      console.error('Lỗi khi tải lô sản phẩm:', err);
      setError(err.response?.data?.error || 'Không thể tải dữ liệu lô sản phẩm.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterProductId, filterDaysToExpiry, includeExpiredFilter, searchTerm]);

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await productApi.getAll();
      setProducts(fetchedProducts.data);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách sản phẩm:', err);
      setError('Không thể tải danh sách sản phẩm.');
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchProducts();
  }, [fetchBatches]);

  const handleEditClick = (batch: ProductBatchAttributes) => {
    setSelectedBatch(batch);
    setShowEditModal(true);
  };

  const handleDetailsClick = (batch: ProductBatchAttributes) => {
    setSelectedBatch(batch);
    setShowDetailsModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setShowDetailsModal(false);
    setSelectedBatch(null);
  };

  const handleSubmitSuccess = () => {
    handleModalClose();
    fetchBatches(); // Refresh data after successful submission
    setCurrentPage(1); // Reset to first page after adding/editing
  };

  const handleUpdateExpiredBatches = async () => {
    setShowConfirmModal(true);
    setActionBatchId(0); // Dùng 0 hoặc một giá trị đặc biệt để báo hiệu là hành động toàn cục
  };

  const confirmUpdateExpired = async () => {
    if (actionBatchId === 0) { // Hành động toàn cục
      setIsSubmitting(true);
      try {
        await productBatchApi.updateExpired();
        alert('Cập nhật trạng thái lô hết hạn thành công!');
        fetchBatches();
      } catch (err: any) {
        console.error('Lỗi khi cập nhật lô hết hạn:', err);
        setError(err.response?.data?.error || 'Không thể cập nhật trạng thái lô hết hạn.');
      } finally {
        setIsSubmitting(false);
        setShowConfirmModal(false);
        setActionBatchId(null);
      }
    }
  };

  const getStatusDisplayName = (status: ProductBatchStatusEnum): string => {
    switch (status) {
      case ProductBatchStatusEnum.Available: return 'Khả dụng';
      case ProductBatchStatusEnum.Expired: return 'Hết hạn';
      case ProductBatchStatusEnum.Quarantined: return 'Cách ly';
      case ProductBatchStatusEnum.SoldOut: return 'Đã bán hết';
      default: return status;
    }
  };

  const getStatusClass = (status: ProductBatchStatusEnum): string => {
    switch (status) {
      case ProductBatchStatusEnum.Available: return 'status-available';
      case ProductBatchStatusEnum.Expired: return 'status-expired';
      case ProductBatchStatusEnum.Quarantined: return 'status-quarantined';
      case ProductBatchStatusEnum.SoldOut: return 'status-sold-out';
      default: return '';
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false); // For global actions

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBatches = batches.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="product-batch-management-page">
      <h1 className="page-title">Quản lý Lô sản phẩm</h1>

      {error && <p className="error-message">{error}</p>}

      <div className="filters-and-actions">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Trạng thái:</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as ProductBatchStatus | 'all');
                setFilterDaysToExpiry(''); // Reset days to expiry filter
                setIncludeExpiredFilter(false); // Reset include expired filter
              }}
            >
              <option value="all">Tất cả</option>
              {Object.values(ProductBatchStatusEnum).map(status => (
                <option key={status} value={status}>
                  {getStatusDisplayName(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="product-filter">Sản phẩm:</label>
            <select
              id="product-filter"
              value={filterProductId}
              onChange={(e) => {
                setFilterProductId(Number(e.target.value));
                setFilterDaysToExpiry(''); // Reset days to expiry filter
                setIncludeExpiredFilter(false); // Reset include expired filter
              }}
            >
              <option value="all">Tất cả sản phẩm</option>
              {products.map(product => (
                <option key={product.product_id} value={product.product_id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="days-to-expiry-filter">Sắp hết hạn (ngày):</label>
            <input
              type="number"
              id="days-to-expiry-filter"
              value={filterDaysToExpiry}
              onChange={(e) => {
                const value = e.target.value;
                setFilterDaysToExpiry(value === '' ? '' : Number(value));
                if (value !== '') { // If expiry filter is active, reset other filters
                    setFilterStatus('all');
                    setFilterProductId('all');
                }
              }}
              min="0"
              placeholder="Ví dụ: 30"
            />
            {filterDaysToExpiry !== '' && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeExpiredFilter}
                  onChange={(e) => setIncludeExpiredFilter(e.target.checked)}
                />
                Bao gồm đã hết hạn
              </label>
            )}
          </div>

          <div className="filter-group">
            <label htmlFor="search-term">Tìm kiếm (Mã lô, SP):</label>
            <input
              type="text"
              id="search-term"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập mã lô hoặc tên sản phẩm"
            />
          </div>

          <button className="admin-button primary" onClick={fetchBatches}>
            Tìm kiếm / Lọc
          </button>
        </div>

        <div className="actions">
          <button
            className="admin-button secondary"
            onClick={handleUpdateExpiredBatches}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật Lô hết hạn'}
          </button>
        </div>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu lô sản phẩm...</p>
      ) : (
        <>
          {batches.length === 0 ? (
            <p>Không có lô sản phẩm nào để hiển thị.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sản phẩm</th>
                    <th>Mã lô</th>
                    <th>Số lượng</th>
                    <th>Đơn giá nhập</th>
                    <th>Ngày SX</th>
                    <th>Hạn sử dụng</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Displaying only current page's batches */}
                  {currentBatches.map((batch) => (
                    <tr key={batch.batch_id}>
                      <td>{batch.batch_id}</td>
                      <td>{batch.product?.name || 'N/A'}</td>
                      <td>{batch.batch_code}</td>
                      <td>{batch.quantity} {batch.product?.unit || ''}</td>
                      <td>{Number(batch.import_price).toLocaleString('vi-VN')} VNĐ</td>
                      <td>{batch.manufacture_date ? new Date(batch.manufacture_date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                      <td>{new Date(batch.expiry_date).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(batch.status as ProductBatchStatusEnum)}`}>
                          {getStatusDisplayName(batch.status as ProductBatchStatusEnum)}
                        </span>
                      </td>
                      <td>
                        <button className="admin-button info small" onClick={() => handleDetailsClick(batch)}>
                          Chi tiết
                        </button>
                        <button className="admin-button primary small" onClick={() => handleEditClick(batch)}>
                          Chỉnh sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination component */}
              <Pagination
                totalItems={batches.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {showEditModal && selectedBatch && (
        <ProductBatchFormModal
          batch={selectedBatch}
          onClose={handleModalClose}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}

      {showDetailsModal && selectedBatch && (
        <ProductBatchDetailsModal
          batch={selectedBatch}
          onClose={handleModalClose}
        />
      )}

      {showConfirmModal && (
        <ConfirmationModal
          message="Bạn có chắc chắn muốn cập nhật trạng thái của tất cả các lô sản phẩm đã hết hạn không?"
          onConfirm={confirmUpdateExpired}
          onCancel={() => {
            setShowConfirmModal(false);
            setActionBatchId(null);
          }}
          confirmText="Cập nhật"
          cancelText="Hủy"
        />
      )}
    </div>
  );
};

export default ProductBatchManagementPage;