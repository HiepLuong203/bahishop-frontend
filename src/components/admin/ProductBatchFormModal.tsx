// src/components/admin/ProductBatchFormModal.tsx
import React, { useState, useEffect } from 'react';
import { ProductBatchAttributes, ProductBatchStatus, UpdateBatchStatusPayload, AdjustBatchQuantityPayload, ProductBatchStatusEnum } from '../../types/productBatch';
import productBatchApi from '../../api/productBatchApi';
import './ProductBatchFormModal.css';

interface ProductBatchFormModalProps {
  batch: ProductBatchAttributes; // Luôn có batch để chỉnh sửa
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const ProductBatchFormModal: React.FC<ProductBatchFormModalProps> = ({ batch, onClose, onSubmitSuccess }) => {
  const [formType, setFormType] = useState<'status' | 'quantity'>('status'); // Mặc định là chỉnh sửa trạng thái
  const [newStatus, setNewStatus] = useState<ProductBatchStatus>(batch.status);
  const [quantityChange, setQuantityChange] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNewStatus(batch.status);
    setQuantityChange(0);
    setReason('');
    setFormError(null);
    setFormType('status'); // Reset form type khi batch thay đổi
  }, [batch]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStatus(e.target.value as ProductBatchStatus);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantityChange(Number(e.target.value));
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (formType === 'status') {
        const payload: UpdateBatchStatusPayload = { newStatus };
        await productBatchApi.updateStatus(batch.batch_id, payload);
        alert('Cập nhật trạng thái lô sản phẩm thành công!');
      } else { // formType === 'quantity'
        if (quantityChange === 0) {
          setFormError('Vui lòng nhập giá trị thay đổi số lượng khác 0.');
          setIsSubmitting(false);
          return;
        }
        if (!reason.trim()) {
          setFormError('Vui lòng nhập lý do điều chỉnh số lượng.');
          setIsSubmitting(false);
          return;
        }
        const payload: AdjustBatchQuantityPayload = { quantityChange, reason };
        await productBatchApi.adjustQuantity(batch.batch_id, payload);
        alert('Điều chỉnh số lượng lô sản phẩm thành công!');
      }
      onSubmitSuccess();
    } catch (err: any) {
      console.error('Lỗi khi submit form lô sản phẩm:', err);
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDisplayName = (status: ProductBatchStatus): string => {
    switch (status) {
      case ProductBatchStatusEnum.Available: return 'Khả dụng';
      case ProductBatchStatusEnum.Expired: return 'Hết hạn';
      case ProductBatchStatusEnum.Quarantined: return 'Cách ly';
      case ProductBatchStatusEnum.SoldOut: return 'Đã bán hết';
      default: return status;
    }
  };

  return (
    <div className="pb-form-overlay">
      <div className="pb-form-content">
        <h2 className="pb-form-title">
          Chỉnh sửa Lô sản phẩm #{batch.batch_id} ({batch.product?.name})
        </h2>

        <div className="pb-form-tabs">
          <button
            className={`pb-form-tab-button ${formType === 'status' ? 'active' : ''}`}
            onClick={() => setFormType('status')}
            disabled={isSubmitting}
          >
            Cập nhật Trạng thái
          </button>
          <button
            className={`pb-form-tab-button ${formType === 'quantity' ? 'active' : ''}`}
            onClick={() => setFormType('quantity')}
            disabled={isSubmitting}
          >
            Điều chỉnh Số lượng
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {formType === 'status' && (
            <div className="pb-form-section">
              <div className="pb-form-group">
                <label htmlFor="current_status">Trạng thái hiện tại:</label>
                <input
                  type="text"
                  id="current_status"
                  value={getStatusDisplayName(batch.status)}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="pb-form-group">
                <label htmlFor="new_status">Chọn trạng thái mới:</label>
                <select
                  id="new_status"
                  name="new_status"
                  value={newStatus}
                  onChange={handleStatusChange}
                  required
                  disabled={isSubmitting}
                >
                  {Object.values(ProductBatchStatusEnum).map(status => (
                    <option key={status} value={status}>
                      {getStatusDisplayName(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {formType === 'quantity' && (
            <div className="pb-form-section">
              <div className="pb-form-group">
                <label htmlFor="current_quantity">Số lượng hiện tại:</label>
                <input
                  type="text"
                  id="current_quantity"
                  value={`${batch.quantity} ${batch.product?.unit || ''}`}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="pb-form-group">
                <label htmlFor="quantity_change">Thay đổi số lượng (Âm để giảm, Dương để tăng):</label>
                <input
                  type="number"
                  id="quantity_change"
                  name="quantity_change"
                  value={quantityChange}
                  onChange={handleQuantityChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Ví dụ: -5 (giảm 5) hoặc 3 (tăng 3)"
                />
              </div>
              <div className="pb-form-group">
                <label htmlFor="reason">Lý do điều chỉnh:</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={reason}
                  onChange={handleReasonChange}
                  rows={3}
                  required
                  disabled={isSubmitting}
                  placeholder="Ví dụ: Hàng hỏng, mất mát, nhập thêm, v.v."
                ></textarea>
              </div>
              <p className="pb-form-info">
                Số lượng mới sẽ là: **{batch.quantity + quantityChange}** {batch.product?.unit || ''}
              </p>
            </div>
          )}

          {formError && <p className="pb-form-error">{formError}</p>}

          <div className="pb-form-actions">
            <button type="submit" className="admin-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : (formType === 'status' ? 'Cập nhật Trạng thái' : 'Điều chỉnh Số lượng')}
            </button>
            <button type="button" className="admin-button default" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductBatchFormModal;