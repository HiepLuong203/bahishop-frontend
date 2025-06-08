// src/components/admin/ProductImageFormModal.tsx
import React, { useState, useEffect } from 'react';
import productImageApi from '../../api/productImageApi';
import { ProductImage } from '../../types/productImage';
import './ProductImageFormModal.css';

interface ProductImageFormModalProps {
  productId: number; // ID của sản phẩm mà ảnh thuộc về
  image: ProductImage | null; // Null nếu thêm mới, ProductImage object nếu sửa
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const ProductImageFormModal: React.FC<ProductImageFormModalProps> = ({ productId, image, onClose, onSubmitSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [displayOrder, setDisplayOrder] = useState<number>(image?.display_order || 0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Để hiển thị ảnh xem trước khi sửa

  useEffect(() => {
    if (image) {
      setDisplayOrder(image.display_order);
      setPreviewImage(`http://localhost:5000${image.image_url}`);
    } else {
      setDisplayOrder(0); // Reset cho thêm mới
      setPreviewImage(null);
    }
  }, [image]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
      if (e.target.files.length > 0) {
        setPreviewImage(URL.createObjectURL(e.target.files[0]));
      } else {
        setPreviewImage(null);
      }
    }
  };

  const handleDisplayOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayOrder(parseInt(e.target.value, 10) || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (image) {
        // Chế độ chỉnh sửa ảnh
        if (!selectedFiles && displayOrder === image.display_order) {
            setFormError('Không có thay đổi nào để cập nhật.');
            setIsSubmitting(false);
            return;
        }
        const fileToUpload = selectedFiles ? selectedFiles[0] : undefined;
        const dataToUpdate = {
            display_order: displayOrder,
            file: fileToUpload,
        };
        await productImageApi.updateProductImage(image.image_id, dataToUpdate);
        alert('Cập nhật ảnh sản phẩm thành công!');

      } else {
        // Chế độ thêm mới ảnh
        if (!selectedFiles || selectedFiles.length === 0) {
          setFormError('Vui lòng chọn ít nhất một ảnh.');
          setIsSubmitting(false);
          return;
        }
        const filesArray = Array.from(selectedFiles);
        await productImageApi.createProductImages(productId, filesArray);
        alert('Thêm ảnh sản phẩm thành công!');
      }
      onSubmitSuccess();
    } catch (err: any) {
      console.error('Lỗi khi submit form ảnh sản phẩm:', err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{image ? 'Chỉnh sửa Ảnh Sản phẩm' : `Thêm Ảnh cho Sản phẩm ID: ${productId}`}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="image_file">{image ? 'Chọn ảnh mới (nếu muốn thay đổi):' : 'Chọn ảnh:'}</label>
            <input
              type="file"
              id="image_file"
              name="image_file"
              onChange={handleFileChange}
              multiple={!image} // Cho phép chọn nhiều file khi thêm mới
              accept="image/*"
              required={!image} // Bắt buộc chọn file khi thêm mới
            />
            {previewImage && (
              <div className="image-preview-container">
                <img src={previewImage} alt="Preview" className="image-preview" />
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="display_order">Thứ tự hiển thị:</label>
            <input
              type="number"
              id="display_order"
              name="display_order"
              value={displayOrder}
              onChange={handleDisplayOrderChange}
              min="0"
            />
          </div>

          {formError && <p className="form-error">{formError}</p>}

          <div className="form-actions">
            <button type="submit" className="admin-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : (image ? 'Cập nhật' : 'Thêm')}
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

export default ProductImageFormModal;