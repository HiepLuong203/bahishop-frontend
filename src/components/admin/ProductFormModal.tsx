// src/components/admin/ProductFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Product, ProductInput } from '../../types/product';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import supplierApi from '../../api/supplierApi';
import { Category } from '../../types/category';
import { Supplier } from '../../types/supplier';
import './ProductFormModal.css';

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSubmitSuccess }) => {
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    supplier_id: null,
    unit: '',
    origin: '',
    is_featured: false,
    is_active: true,
    is_new: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
        setLoadingCategories(false);
        if (!product && response.data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: response.data[0].category_id }));
        }
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
        setLoadingCategories(false);
      }
    };
    fetchCategories();

    const fetchSuppliers = async () => {
      try {
        const response = await supplierApi.getAll();
        setSuppliers(response.data);
        setLoadingSuppliers(false);
      } catch (error) {
        console.error('Lỗi khi tải nhà cung cấp:', error);
        setLoadingSuppliers(false);
      }
    };
    fetchSuppliers();

    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category_id: product.category_id || 0,
        supplier_id: product.supplier?.supplier_id || null,
        unit: product.unit || '',
        origin: product.origin || '',
        is_featured: product.is_featured || false,
        is_active: product.is_active || true,
        is_new: product.is_new || false,
      });
      if (product.image_url) {
        setPreviewImage(`http://localhost:5000${product.image_url}`);
      }
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'price') {
      setPriceError(null);
    }
    setFormError(null); 

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else if (type === 'number') {
      let numericValue: number | null = null;
      if (value !== '') {
        numericValue = Number(value);
        if (name === 'price' && numericValue < 0) {
          setPriceError('Giá không thể là số âm.');
        } else if (name === 'price' && isNaN(numericValue)) { 
          setPriceError('Giá phải là một số hợp lệ.');
        }
      }
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setPriceError(null); 

    if (formData.price === null || isNaN(formData.price) || formData.price < 0) {
      setPriceError('Giá sản phẩm phải là một số không âm hợp lệ.');
      setFormError('Vui lòng kiểm tra lại thông tin sản phẩm.');
      return;
    }
    if (formData.category_id === 0) {
      setFormError('Vui lòng chọn một danh mục.');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Tên sản phẩm không được để trống.');
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    for (const key in formData) {
      if (formData[key as keyof ProductInput] !== null && formData[key as keyof ProductInput] !== undefined) {
        data.append(key, String(formData[key as keyof ProductInput]));
      }
    }
    if (imageFile) {
      data.append('image_url', imageFile);
    }

    try {
      if (product) {
        await productApi.updateProduct(product.product_id, data);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await productApi.createProduct(data);
        alert('Thêm sản phẩm thành công!');
      }
      onSubmitSuccess();
    } catch (err: any) {
      console.error('Lỗi khi submit form sản phẩm:', err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{product ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Tên sản phẩm:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="description">Mô tả:</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3}></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="category_id">Danh mục:</label>
            {loadingCategories ? (
              <p>Đang tải danh mục...</p>
            ) : (
              <select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} required>
                <option value={0} disabled>Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="supplier_id">Nhà cung cấp:</label>
            {loadingSuppliers ? (
              <p>Đang tải nhà cung cấp...</p>
            ) : (
              <select id="supplier_id" name="supplier_id" value={formData.supplier_id === null ? '' : formData.supplier_id} onChange={handleChange}>
                <option value="">Chọn nhà cung cấp (tùy chọn)</option>
                {suppliers.map(sup => (
                  <option key={sup.supplier_id} value={sup.supplier_id}>{sup.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="price">Giá:</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price === null ? '' : formData.price}
              onChange={handleChange}
              min="0" 
              step="0.01" 
              required
            />
            {priceError && <p className="input-error">{priceError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="unit">Đơn vị:</label>
            <input type="text" id="unit" name="unit" value={formData.unit} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="origin">Xuất xứ:</label>
            <input type="text" id="origin" name="origin" value={formData.origin} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="image_url_file">Hình ảnh:</label>
            <input type="file" id="image_url_file" name="image_url" accept="image/*" onChange={handleImageChange} />
            {previewImage && (
              <img src={previewImage} alt="Xem trước" className="image-preview" />
            )}
          </div>
          <div className="form-group checkbox-group">
            <input type="checkbox" id="is_featured" name="is_featured" checked={formData.is_featured} onChange={handleChange} />
            <label htmlFor="is_featured">Bán chạy</label>
          </div>
          <div className="form-group checkbox-group">
            <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} />
            <label htmlFor="is_active">Đang bán</label>
          </div>
          <div className="form-group checkbox-group">
            <input type="checkbox" id="is_new" name="is_new" checked={formData.is_new} onChange={handleChange} />
            <label htmlFor="is_new">Sản phẩm mới</label>
          </div>

          {formError && <p className="form-error">{formError}</p>}

          <div className="form-actions">
            <button type="submit" className="admin-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : (product ? 'Cập nhật' : 'Thêm')}
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

export default ProductFormModal;