// src/components/admin/ProductImageFormModal.tsx
import React, { useState, useEffect } from 'react';
import productImageApi from '../../api/productImageApi';
import { ProductImage } from '../../types/productImage';
import './ProductImageFormModal.css';

interface ProductImageFormModalProps {
  productId: number;
  image: ProductImage | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const ProductImageFormModal: React.FC<ProductImageFormModalProps> = ({ productId, image, onClose, onSubmitSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [displayOrder, setDisplayOrder] = useState<number>(image?.display_order || 0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    if (image) {
      setDisplayOrder(image.display_order);
      setPreviewImages([`http://localhost:5000${image.image_url}`]);
    } else {
      setDisplayOrder(0);
      setPreviewImages([]);
    }
    return () => {
      // Clean up object URLs
      previewImages.forEach(URL.revokeObjectURL);
    };
  }, [image, previewImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
      const newPreviews = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setPreviewImages(newPreviews);
    } else {
      setPreviewImages([]);
      setSelectedFiles(null);
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
        // Edit mode
        if (!selectedFiles && displayOrder === image.display_order) {
          setFormError('No changes to update.');
          setIsSubmitting(false);
          return;
        }
        const fileToUpload = selectedFiles ? selectedFiles[0] : undefined;
        const dataToUpdate = {
          display_order: displayOrder,
          file: fileToUpload,
        };
        await productImageApi.updateProductImage(image.image_id, dataToUpdate);
        alert('Product image updated successfully!');
      } else {
        // Add mode
        if (!selectedFiles || selectedFiles.length === 0) {
          setFormError('Please select at least one image.');
          setIsSubmitting(false);
          return;
        }
        const filesArray = Array.from(selectedFiles);
        await productImageApi.createProductImages(productId, filesArray);
        alert('Product images added successfully!');
      }
      onSubmitSuccess();
    } catch (err: any) {
      console.error('Error submitting product image form:', err);
      setFormError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pim-modal-overlay">
      <div className="pim-modal-content">
        <h2>{image ? 'Edit Product Image' : `Add Images for Product ID: ${productId}`}</h2>
        <form onSubmit={handleSubmit}>
          <div className="pim-form-group">
            <label htmlFor="image_file">{image ? 'Select new image (optional):' : 'Select images:'}</label>
            <input
              type="file"
              id="image_file"
              name="image_file"
              onChange={handleFileChange}
              multiple
              accept="image/*"
              required={!image}
            />
            {previewImages.length > 0 && (
              <div className="pim-image-preview-container">
                {previewImages.map((preview, index) => (
                  <img key={index} src={preview} alt={`Preview ${index}`} className="pim-image-preview" />
                ))}
              </div>
            )}
          </div>
          <div className="pim-form-group">
            <label htmlFor="display_order">Display Order:</label>
            <input
              type="number"
              id="display_order"
              name="display_order"
              value={displayOrder}
              onChange={handleDisplayOrderChange}
              min="0"
            />
          </div>

          {formError && <p className="pim-form-error">{formError}</p>}

          <div className="pim-form-actions">
            <button type="submit" className="pim-admin-button pim-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : (image ? 'Update' : 'Add')}
            </button>
            <button type="button" className="pim-admin-button pim-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductImageFormModal;