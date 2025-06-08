// src/components/admin/ApplyPromotionModal.tsx
import React, { useState, useEffect } from 'react';
import productApi from '../../api/productApi';
import promotionApi from '../../api/promotionApi';
import productPromotionApi from '../../api/productPromotionApi';
import { Product } from '../../types/product';
import { Promotion } from '../../types/promotion';
import { ApplyPromotionInput } from '../../types/productPromotion';
import './ApplyPromotionModal.css';

interface ApplyPromotionModalProps {
  onClose: () => void;
  onApplySuccess: () => void;
}

const ApplyPromotionModal: React.FC<ApplyPromotionModalProps> = ({ onClose, onApplySuccess }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, promotionsResponse] = await Promise.all([
          productApi.getAll(),
          promotionApi.getAll(),
        ]);
        setProducts(productsResponse.data);
        setPromotions(promotionsResponse.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(parseInt(e.target.value, 10) || null);
  };

  const handlePromotionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPromotion(parseInt(e.target.value, 10) || null);
  };

  const handleApplyPromotion = async () => {
    if (!selectedProduct || !selectedPromotion) {
      setApplyError('Vui lòng chọn sản phẩm và khuyến mãi.');
      return;
    }

    setIsApplying(true);
    setApplyError(null);

    const data: ApplyPromotionInput = {
      product_id: selectedProduct,
      promotion_id: selectedPromotion,
    };

    try {
      await productPromotionApi.applyPromotion(data);
      alert('Áp dụng khuyến mãi cho sản phẩm thành công!');
      onApplySuccess();
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi áp dụng khuyến mãi:', err);
      setApplyError(err.response?.data?.message || 'Không thể áp dụng khuyến mãi do khuyến mãi đã hết thời gian hiệu lực.');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content apply-promotion-modal">
        <h2>Áp dụng Khuyến mãi cho Sản phẩm</h2>
        {applyError && <p className="form-error">{applyError}</p>}

        <div className="form-group">
          <label htmlFor="product">Chọn sản phẩm:</label>
          <select id="product" onChange={handleProductChange} value={selectedProduct || ''}>
            <option value="">-- Chọn sản phẩm --</option>
            {products.map((product) => (
              <option key={product.product_id} value={product.product_id}>
                {product.name} (ID: {product.product_id})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="promotion">Chọn khuyến mãi:</label>
          <select id="promotion" onChange={handlePromotionChange} value={selectedPromotion || ''}>
            <option value="">-- Chọn khuyến mãi --</option>
            {promotions.map((promo) => (
              <option key={promo.promotion_id} value={promo.promotion_id}>
                {promo.name} (ID: {promo.promotion_id}) - {Number(promo.discount_value).toLocaleString('vi-VN')}{promo.discount_type === 'percentage' ? '%' : ' VNĐ'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button className="admin-button primary" onClick={handleApplyPromotion} disabled={isApplying}>
            {isApplying ? 'Đang áp dụng...' : 'Áp dụng'}
          </button>
          <button className="admin-button secondary" onClick={onClose} disabled={isApplying}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyPromotionModal;