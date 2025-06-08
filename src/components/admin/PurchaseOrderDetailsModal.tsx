// src/components/admin/PurchaseOrderDetailsModal.tsx
import React from 'react';
import { PurchaseOrder, PurchaseOrderDetail } from '../../types/purchaseOrder';
import { Supplier } from '../../types/supplier';
import { Product } from '../../types/product';
import './PurchaseOrderDetailsModal.css'; // Đường dẫn đến file CSS mới

interface PurchaseOrderDetailsModalProps {
  order: PurchaseOrder;
  onClose: () => void;
  suppliers: Supplier[];
  products: Product[];
}

const PurchaseOrderDetailsModal: React.FC<PurchaseOrderDetailsModalProps> = ({ order, onClose, suppliers, products }) => {
  const getSupplierName = (supplierId: number): string => {
    const supplier = suppliers.find(s => s.supplier_id === supplierId);
    return supplier ? supplier.name : `Không rõ (${supplierId})`;
  };

  const getProductName = (productId: number): string => {
    const product = products.find(p => p.product_id === productId);
    return product ? product.name : `Sản phẩm #${productId}`;
  };

  return (
    <div className="po-details-overlay"> {/* Đã đổi tên class */}
      <div className="po-details-content"> {/* Đã đổi tên class */}
        <h2 className="po-details-title">Chi tiết Đơn nhập hàng #{order.id}</h2> {/* Thêm class cho tiêu đề */}
        <div className="po-details-section"> {/* Đã đổi tên class */}
          <p><strong>Nhà cung cấp:</strong> {getSupplierName(order.supplier_id)}</p>
          <p><strong>Ngày đặt hàng:</strong> {new Date(order.order_date).toLocaleDateString('vi-VN')}</p>
          <p><strong>Tổng tiền:</strong> {Number(order.total_amount).toLocaleString('vi-VN')} VNĐ</p>
          <p><strong>Ghi chú:</strong> {order.note || 'Không có'}</p>
          <p><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
          <p><strong>Cập nhật cuối:</strong> {new Date(order.updatedAt).toLocaleString('vi-VN')}</p>
        </div>

        <div className="po-details-section"> {/* Đã đổi tên class */}
          <h3 className="po-details-subtitle">Danh sách Sản phẩm</h3> {/* Thêm class cho tiêu đề */}
          {order.PurchaseOrderDetail && order.PurchaseOrderDetail.length > 0 ? (
            <table className="po-details-table"> {/* Đã đổi tên class */}
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Mã lô</th>
                  <th>Ngày SX</th>
                  <th>Hạn sử dụng</th>
                </tr>
              </thead>
              <tbody>
                {order.PurchaseOrderDetail.map((detail: PurchaseOrderDetail) => (
                  <tr key={detail.id}>
                    <td>{getProductName(detail.product_id)}</td>
                    <td>{detail.quantity}</td>
                    <td>{Number(detail.unit_price).toLocaleString('vi-VN')}</td>
                    <td>{detail.batch_code}</td>
                    <td>{detail.manufacture_date ? new Date(detail.manufacture_date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td>{new Date(detail.expiry_date).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Không có sản phẩm nào trong đơn hàng này.</p>
          )}
        </div>

        <div className="po-details-actions"> {/* Đã đổi tên class */}
          <button className="admin-button default" onClick={onClose}>Đóng</button> {/* Giữ nguyên admin-button nếu là class chung */}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailsModal;