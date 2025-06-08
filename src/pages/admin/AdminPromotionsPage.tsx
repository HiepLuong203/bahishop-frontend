// src/pages/admin/AdminPromotionsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './AdminPromotionsPage.css';
import promotionApi from '../../api/promotionApi';
import productPromotionApi from '../../api/productPromotionApi';
import { Promotion } from '../../types/promotion';
import { ProductPromotion } from '../../types/productPromotion';
import PromotionFormModal from '../../components/admin/PromotionFormModal';
import ApplyPromotionModal from '../../components/admin/ApplyPromotionModal'; // Import modal mới

const AdminPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [productPromotions, setProductPromotions] = useState<ProductPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null);
  const [showApplyPromotionModal, setShowApplyPromotionModal] = useState(false);

  const fetchPromotionsData = useCallback(async () => {
    try {
      setLoading(true);
      const [promotionsResponse, productPromotionsResponse] = await Promise.all([
        promotionApi.getAll(),
        productPromotionApi.getAll(),
      ]);
      setPromotions(promotionsResponse.data);
      setProductPromotions(productPromotionsResponse.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu khuyến mãi.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotionsData();
  }, [fetchPromotionsData]);

  const handleAddPromotion = () => {
    setCurrentPromotion(null);
    setShowPromotionModal(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setCurrentPromotion(promotion);
    setShowPromotionModal(true);
  };

  const handleDeletePromotion = async (promotionId: number, promotionName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khuyến mãi "${promotionName}" không?`)) {
      try {
        await promotionApi.deletePromotion(promotionId);
        alert('Khuyến mãi đã được xóa thành công!');
        fetchPromotionsData();
      } catch (err: any) {
        console.error('Lỗi khi xóa khuyến mãi:', err);
        alert(`Không thể xóa khuyến mãi: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handlePromotionFormSubmitSuccess = () => {
    setShowPromotionModal(false);
    fetchPromotionsData();
  };

  const handleOpenApplyPromotionModal = () => {
    setShowApplyPromotionModal(true);
  };

  const handleCloseApplyPromotionModal = () => {
    setShowApplyPromotionModal(false);
    fetchPromotionsData(); // Reload data after applying/removing promotion
  };

  const handleRemoveProductPromotion = async (productPromotionId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn gỡ khuyến mãi khỏi sản phẩm này?')) {
      try {
        await productPromotionApi.removePromotion(productPromotionId);
        alert('Đã gỡ khuyến mãi khỏi sản phẩm thành công!');
        fetchPromotionsData();
      } catch (error: any) {
        console.error('Lỗi khi gỡ khuyến mãi khỏi sản phẩm:', error);
        alert(`Không thể gỡ khuyến mãi: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  if (loading) {
    return <div>Đang tải dữ liệu khuyến mãi...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  return (
    <div className="admin-promotions-page">
      <h1>Quản lý Khuyến mãi</h1>

      <h2>Sản phẩm đang có khuyến mãi</h2>
      <div className="admin-promotions-actions">
        <button className="admin-button primary" onClick={handleOpenApplyPromotionModal}>Thêm khuyến mãi cho sản phẩm</button>
      </div>
      {productPromotions.length > 0 ? (
        <table className="admin-promotions-table">
          <thead>
            <tr>
              <th>ID Sản phẩm</th>
              <th>Tên Sản phẩm</th>
              <th>ID Khuyến mãi</th>
              <th>Tên Khuyến mãi</th>
              <th>Giá trị giảm</th>
              <th>Loại giảm</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {productPromotions.map((pp) => (
              <tr key={pp.product_promotion_id}>
                <td>{pp.product_id}</td>
                <td>{pp.Product?.name || 'N/A'}</td>
                <td>{pp.promotion_id}</td>
                <td>{pp.Promotion?.name || 'N/A'}</td>
                <td>{Number(pp.Promotion?.discount_value).toLocaleString('vi-VN')}</td>
                <td>{pp.Promotion?.discount_type === 'percentage' ? 'Phần trăm' : 'Cố định'}</td>
                <td>
                  <button className="admin-button danger small" onClick={() => handleRemoveProductPromotion(pp.product_promotion_id)}>Gỡ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Chưa có sản phẩm nào được áp dụng khuyến mãi.</p>
      )}

      <hr style={{ margin: '20px 0' }} />

      <h2>Tất cả khuyến mãi</h2>
      <div className="admin-promotions-actions">
        <button className="admin-button primary" onClick={handleAddPromotion}>Thêm Khuyến mãi mới</button>
      </div>
      {promotions.length > 0 ? (
        <table className="admin-promotions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Giá trị giảm</th>
              <th>Loại giảm giá</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th className="action-header">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => (
              <tr key={promotion.promotion_id}>
                <td>{promotion.promotion_id}</td>
                <td>{promotion.name}</td>
                <td>{promotion.description || 'Không có'}</td>
                <td>{Number(promotion.discount_value).toLocaleString('vi-VN')}</td>
                <td>{promotion.discount_type === 'percentage' ? 'Phần trăm' : 'Cố định'}</td>
                <td>{new Date(promotion.start_date).toLocaleDateString('vi-VN')}</td>
                <td>{new Date(promotion.end_date).toLocaleDateString('vi-VN')}</td>
                <td>{promotion.is_active ? 'Đang hoạt động' : 'Không hoạt động'}</td>
                <td className="actions-cell">
                  <button className="admin-button secondary small" onClick={() => handleEditPromotion(promotion)}>Sửa</button>
                  <button className="admin-button danger small" onClick={() => handleDeletePromotion(promotion.promotion_id, promotion.name)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Không có khuyến mãi nào.</p>
      )}

      {showPromotionModal && (
        <PromotionFormModal
          promotion={currentPromotion}
          onClose={() => setShowPromotionModal(false)}
          onSubmitSuccess={handlePromotionFormSubmitSuccess}
        />
      )}

      {showApplyPromotionModal && (
        <ApplyPromotionModal onClose={handleCloseApplyPromotionModal} onApplySuccess={fetchPromotionsData} />
      )}
    </div>
  );
};

export default AdminPromotionsPage;