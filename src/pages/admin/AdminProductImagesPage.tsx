// src/pages/admin/AdminProductImagesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './AdminProductImagesPage.css'; 
import productImageApi from '../../api/productImageApi'; // Import API cho ảnh sản phẩm
import productApi from '../../api/productApi'; 
import { ProductImage } from '../../types/productImage';
import { Product } from '../../types/product';
import ProductImageFormModal from '../../components/admin/ProductImageFormModal'; // Sẽ tạo component này

const AdminProductImagesPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState<ProductImage | null>(null); // Dùng cho chỉnh sửa ảnh

  const fetchProductsAndImages = useCallback(async () => {
    try {
      setLoading(true);
      const productsResponse = await productApi.getAll();
      setProducts(productsResponse.data);

      // Nếu có sản phẩm đã chọn, tải ảnh của sản phẩm đó
      if (selectedProductId) {
        const imagesResponse = await productImageApi.getImagesByProductId(selectedProductId);
        // *** SỬA LẠI DÒNG NÀY ***
        setProductImages(imagesResponse.data?.images || []);
      } else {
        setProductImages([]); // Reset ảnh nếu không có sản phẩm nào được chọn
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu.');
      setLoading(false);
    }
  }, [selectedProductId]);

  useEffect(() => {
    fetchProductsAndImages();
  }, [fetchProductsAndImages]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = parseInt(e.target.value, 10);
    setSelectedProductId(isNaN(productId) ? null : productId);
  };

  const handleAddImage = () => {
    if (!selectedProductId) {
      alert('Vui lòng chọn một sản phẩm để thêm ảnh.');
      return;
    }
    setCurrentImage(null); // Đặt null để biết là đang thêm mới
    setShowModal(true);
  };

  const handleEditImage = (image: ProductImage) => {
    setCurrentImage(image); // Đặt ảnh cần chỉnh sửa
    setShowModal(true);
  };

  const handleDeleteImage = async (imageId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này không?')) {
      try {
        await productImageApi.deleteProductImage(imageId);
        alert('Ảnh đã được xóa thành công!');
        fetchProductsAndImages(); // Tải lại danh sách ảnh
      } catch (err: any) {
        console.error('Lỗi khi xóa ảnh:', err);
        alert(`Không thể xóa ảnh: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleImageFormSubmitSuccess = () => {
    setShowModal(false); // Đóng modal
    fetchProductsAndImages(); // Tải lại danh sách ảnh
  };

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  return (
    <div className="admin-product-images-page">
      <h1>Quản lý Ảnh Sản phẩm</h1>

      <div className="product-selection-container">
        <label htmlFor="product-select">Chọn Sản phẩm:</label>
        <select id="product-select" value={selectedProductId || ''} onChange={handleProductChange}>
          <option value="">-- Chọn sản phẩm --</option>
          {products.map(product => (
            <option key={product.product_id} value={product.product_id}>
              {product.name} (ID: {product.product_id})
            </option>
          ))}
        </select>
        <button className="admin-button primary" onClick={handleAddImage} disabled={!selectedProductId}>Thêm Ảnh mới</button>
      </div>

      {selectedProductId && (
        <>
          <h2>Ảnh của sản phẩm: {products.find(p => p.product_id === selectedProductId)?.name}</h2>
          {productImages.length > 0 ? (
            <div className="product-images-grid">
              {productImages.sort((a,b) => a.display_order - b.display_order).map((image) => (
                <div key={image.image_id} className="image-card">
                  <img src={`http://localhost:5000${image.image_url}`} alt={`Ảnh ${image.image_id}`} className="product-image-thumbnail-admin" />
                  <p>Thứ tự: {image.display_order}</p>
                  <div className="image-actions">
                    <button className="admin-button secondary small" onClick={() => handleEditImage(image)}>Sửa</button>
                    <button className="admin-button danger small" onClick={() => handleDeleteImage(image.image_id)}>Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Sản phẩm này chưa có ảnh nào.</p>
          )}
        </>
      )}

      {showModal && selectedProductId && (
        <ProductImageFormModal
          productId={selectedProductId}
          image={currentImage} // Truyền ảnh hiện tại nếu đang sửa
          onClose={() => setShowModal(false)}
          onSubmitSuccess={handleImageFormSubmitSuccess}
        />
      )}
    </div>
  );
};

export default AdminProductImagesPage;