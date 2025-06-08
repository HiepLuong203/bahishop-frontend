// src/components/admin/SupplierFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Supplier, SupplierInput } from '../../types/supplier';
import supplierApi from '../../api/supplierApi';
import './SupplierFormModal.css'; // Sẽ tạo file CSS này

interface SupplierFormModalProps {
  supplier: Supplier | null; // Null nếu thêm mới, Supplier object nếu sửa
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ supplier, onClose, onSubmitSuccess }) => {
  const [formData, setFormData] = useState<SupplierInput>({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        contact_person: supplier.contact_person || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
      });
    }
  }, [supplier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (supplier) {
        await supplierApi.updateSupplier(supplier.supplier_id, formData);
        alert('Cập nhật nhà cung cấp thành công!');
      } else {
        await supplierApi.createSupplier(formData);
        alert('Thêm nhà cung cấp thành công!');
      }
      onSubmitSuccess();
    } catch (err: any) {
      console.error('Lỗi khi submit form nhà cung cấp:', err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{supplier ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Tên Nhà cung cấp:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="contact_person">Người liên hệ:</label>
            <input type="text" id="contact_person" name="contact_person" value={formData.contact_person || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Điện thoại:</label>
            <input type="text" id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="address">Địa chỉ:</label>
            <textarea id="address" name="address" value={formData.address || ''} onChange={handleChange} rows={3}></textarea>
          </div>

          {formError && <p className="form-error">{formError}</p>}

          <div className="form-actions">
            <button type="submit" className="admin-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : (supplier ? 'Cập nhật' : 'Thêm')}
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

export default SupplierFormModal;