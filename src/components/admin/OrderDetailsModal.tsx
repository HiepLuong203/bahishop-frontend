// src/components/admin/OrderDetailsModal.tsx
import React from 'react';
import { OrderDetailsModalProps } from '../../types/order';
import './OrderDetailsModal.css';

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  return (
    <div className="order-details-modal-wrapper modal-overlay">
      <div className="modal-content">
        <h2>Chi tiết Đơn hàng #{order.order_id}</h2>
        <div className="order-summary-details">
          <p><strong>Người đặt:</strong> {order.shipping_name}</p>
          <p><strong>Địa chỉ giao hàng:</strong> {order.shipping_address}</p>
          <p><strong>Điện thoại:</strong> {order.shipping_phone}</p>
          <p><strong>Ngày đặt hàng:</strong> {new Date(order.order_date).toLocaleDateString('vi-VN')}</p>
          <p><strong>Tổng tiền:</strong> {Number(order.total_amount).toLocaleString('vi-VN')} VNĐ</p>
          <p><strong>Trạng thái đơn hàng:</strong> {order.order_status}</p>
          <p><strong>Phương thức thanh toán:</strong> {order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</p>
          <p><strong>Trạng thái thanh toán:</strong> {order.payment_status}</p>
          {order.notes && <p><strong>Ghi chú:</strong> {order.notes}</p>}
          <p><strong>Ngày cập nhật trạng thái:</strong> {new Date(order.updatedAt).toLocaleDateString('vi-VN')}</p>
        </div>

        <h3>Sản phẩm trong đơn hàng:</h3>
        {order.orderItems && order.orderItems.length > 0 ? (
          <table className="order-items-table">
            <thead>
              <tr>
                <th>ID Sản phẩm</th>
                <th>Tên Sản phẩm</th>
                <th>Số lượng</th>
                <th>Giá gốc</th>
                <th>Giá KM</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map(item => (
                <tr key={item.id}>
                  <td>{item.product_id}</td>
                  <td>{item.product?.name || 'N/A'}</td>
                  <td>{item.quantity}</td>
                  <td>{Number(item.unit_price).toLocaleString('vi-VN')} VNĐ</td>
                  <td>
                    {item.discount_price !== null && item.discount_price !== undefined
                      ? Number(item.discount_price).toLocaleString('vi-VN') + ' VNĐ'
                      : 'Không áp dụng'}
                  </td>
                  <td>{Number(item.total_price).toLocaleString('vi-VN')} VNĐ</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Không có sản phẩm nào trong đơn hàng này.</p>
        )}

        <div className="modal-actions">
          <button type="button" className="admin-button secondary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;