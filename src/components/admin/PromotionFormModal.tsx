// src/components/admin/PromotionFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Promotion, PromotionInput } from '../../types/promotion';
import promotionApi from '../../api/promotionApi';
import './PromotionFormModal.css'; // Đường dẫn đến file CSS mới

interface PromotionFormModalProps {
  promotion: Promotion | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const PromotionFormModal: React.FC<PromotionFormModalProps> = ({ promotion, onClose, onSubmitSuccess }) => {
  const [formData, setFormData] = useState<PromotionInput>({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    is_active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name,
        description: promotion.description || '',
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        start_date: promotion.start_date.split('T')[0],
        end_date: promotion.end_date.split('T')[0],
        is_active: promotion.is_active !== undefined ? promotion.is_active : true,
      });
    }
  }, [promotion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prevFormData => {
      if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        return { ...prevFormData, [name]: e.target.checked };
      } else {
        return { ...prevFormData, [name]: value };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      // Validate dates
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        setFormError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');
        setIsSubmitting(false);
        return;
      }
      // Validate discount value
      if (formData.discount_type === 'percentage' && (formData.discount_value < 0 || formData.discount_value > 100)) {
          setFormError('Giá trị giảm phần trăm phải nằm trong khoảng từ 0 đến 100.');
          setIsSubmitting(false);
          return;
      }
      if (formData.discount_type === 'fixed' && formData.discount_value < 0) {
          setFormError('Giá trị giảm cố định không thể âm.');
          setIsSubmitting(false);
          return;
      }

      if (promotion) {
        await promotionApi.updatePromotion(promotion.promotion_id, formData);
        alert('Cập nhật khuyến mãi thành công!');
      } else {
        await promotionApi.createPromotion(formData);
        alert('Thêm khuyến mãi thành công!');
      }
      onSubmitSuccess();
    } catch (err: any) {
      console.error('Lỗi khi submit form khuyến mãi:', err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="promo-form-overlay"> {/* Đã đổi tên class */}
      <div className="promo-form-content"> {/* Đã đổi tên class */}
        <h2 className="promo-form-title">{promotion ? 'Chỉnh sửa Khuyến mãi' : 'Thêm Khuyến mãi mới'}</h2> {/* Thêm class cho tiêu đề */}
        <form onSubmit={handleSubmit}>
          <div className="promo-form-group"> {/* Đã đổi tên class */}
            <label htmlFor="name">Tên Khuyến mãi:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="promo-form-group"> {/* Đã đổi tên class */}
            <label htmlFor="description">Mô tả:</label>
            <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3}></textarea>
          </div>
          <div className="promo-form-group"> {/* Đã đổi tên class */}
            <label htmlFor="discount_type">Loại giảm giá:</label>
            <select id="discount_type" name="discount_type" value={formData.discount_type} onChange={handleChange}>
              <option value="percentage">Phần trăm</option>
              <option value="fixed">Cố định</option>
            </select>
          </div>
          <div className="promo-form-group"> {/* Đã đổi tên class */}
            <label htmlFor="discount_value">Giá trị giảm:</label>
            <input type="number" id="discount_value" name="discount_value" value={formData.discount_value} onChange={handleChange} required />
          </div>
          <div className="promo-form-group"> {/* Đã đổi tên class */}
            <label htmlFor="start_date">Ngày bắt đầu:</label>
            <input type="date" id="start_date" name="start_date" value={formData.start_date} onChange={handleChange} required />
          </div>
          <div className="promo-form-group"> {/* Đã đổi tên class */}
            <label htmlFor="end_date">Ngày kết thúc:</label>
            <input type="date" id="end_date" name="end_date" value={formData.end_date} onChange={handleChange} required />
          </div>
          <div className="promo-form-group promo-form-group-checkbox"> {/* Thêm class cho checkbox để dễ tùy chỉnh */}
            <label htmlFor="is_active">Đang hoạt động:</label>
            <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active || false} onChange={handleChange} />
          </div>

          {formError && <p className="promo-form-error">{formError}</p>} {/* Đã đổi tên class */}

          <div className="promo-form-actions"> {/* Đã đổi tên class */}
            <button type="submit" className="admin-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : (promotion ? 'Cập nhật' : 'Thêm')}
            </button>
            <button type="button" className="admin-button secondary" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionFormModal;