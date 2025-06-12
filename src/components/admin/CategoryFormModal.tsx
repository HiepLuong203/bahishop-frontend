// src/components/admin/CategoryFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Category, CategoryInput } from '../../types/category';
import categoryApi from '../../api/categoryApi';
import './CategoryFormModal.css';

// 'child' có phải là con cháu của 'parent' không, gọi ở ngoài tránh lặp
const isDescendant = (potentialChild: Category, potentialParent: Category | null, allCats: Category[]): boolean => {
    if (!potentialParent) return false;
    let current = potentialChild;
    while (current.parent_id !== null) {
      if (current.parent_id === potentialParent.category_id) return true;
      const parent = allCats.find(c => c.category_id === current.parent_id);
      if (!parent) break;
      current = parent;
    }
    return false;
};
interface CategoryFormModalProps {
  category: Category | null; // Danh mục hiện tại để chỉnh sửa, null nếu thêm mới
  onClose: () => void;
  onSubmitSuccess: () => void;
  allCategories: Category[]; // Danh sách tất cả danh mục để chọn parent_id
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ category, onClose, onSubmitSuccess, allCategories }) => {
  const [formData, setFormData] = useState<CategoryInput>({
    name: '',
    description: '',
    parent_id: null,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        parent_id: category.parent_id || null,
      });
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'parent_id') {
      setFormData({ ...formData, [name]: value === '' ? null : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (category) {
        await categoryApi.updateCategory(category.category_id, formData);
        alert('Cập nhật danh mục thành công!');
      } else {
        await categoryApi.createCategory(formData);
        alert('Thêm danh mục thành công!');
      }
      onSubmitSuccess();
    } catch (err: any) {
      console.error('Lỗi khi submit form danh mục:', err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableParentCategories = allCategories.filter(cat =>
    cat.category_id !== category?.category_id &&
    !isDescendant(cat, category, allCategories)
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{category ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Tên Danh mục:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="description">Mô tả:</label>
            <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3}></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="parent_id">Danh mục cha:</label>
            <select id="parent_id" name="parent_id" value={formData.parent_id === null ? '' : formData.parent_id} onChange={handleChange}>
              <option value="">Không có danh mục cha</option>
              {availableParentCategories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {formError && <p className="form-error">{formError}</p>}

          <div className="form-actions">
            <button type="submit" className="admin-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : (category ? 'Cập nhật' : 'Thêm')}
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

export default CategoryFormModal;