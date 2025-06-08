// src/components/admin/ProductBatchDetailsModal.tsx
import React from 'react';
import { ProductBatchAttributes, ProductBatchStatusEnum } from '../../types/productBatch';
import './ProductBatchDetailsModal.css';

interface ProductBatchDetailsModalProps {
  batch: ProductBatchAttributes;
  onClose: () => void;
}

const ProductBatchDetailsModal: React.FC<ProductBatchDetailsModalProps> = ({ batch, onClose }) => {

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

  return (
    <div className="pb-details-overlay">
      <div className="pb-details-content">
        <h2 className="pb-details-title">Chi tiết Lô sản phẩm #{batch.batch_id}</h2>

        <div className="pb-details-section">
          <p><strong>Sản phẩm:</strong> {batch.product?.name || 'Không rõ sản phẩm'}</p>
          <p><strong>Mã lô:</strong> {batch.batch_code}</p>
          <p><strong>Số lượng:</strong> {batch.quantity} {batch.product?.unit || ''}</p>
          <p><strong>Đơn giá nhập:</strong> {Number(batch.import_price).toLocaleString('vi-VN')} VNĐ</p>
          <p><strong>Ngày sản xuất:</strong> {batch.manufacture_date ? new Date(batch.manufacture_date).toLocaleDateString('vi-VN') : 'N/A'}</p>
          <p><strong>Hạn sử dụng:</strong> {new Date(batch.expiry_date).toLocaleDateString('vi-VN')}</p>
          <p>
            <strong>Trạng thái:</strong>
            <span className={`pb-status-badge ${getStatusClass(batch.status as ProductBatchStatusEnum)}`}>
              {getStatusDisplayName(batch.status as ProductBatchStatusEnum)}
            </span>
          </p>
          <p><strong>Ngày tạo:</strong> {new Date(batch.createdAt).toLocaleString('vi-VN')}</p>
          <p><strong>Cập nhật cuối:</strong> {new Date(batch.updatedAt).toLocaleString('vi-VN')}</p>
        </div>

        <div className="pb-details-actions">
          <button className="admin-button default" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default ProductBatchDetailsModal;