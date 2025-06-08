// src/components/MyOrderPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import orderApi from '../api/orderApi';
import reviewApi from '../api/reviewApi';
import { Order, OrderItem } from '../types/order';
import CreateReviewForm from '../components/CreateReviewForm';
import { Review } from '../types/review';
import './MyOrderPage.css';

const MyOrderPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<number | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentReviewProductId, setCurrentReviewProductId] = useState<number | null>(null);
  const [currentReviewOrderId, setCurrentReviewOrderId] = useState<number | null>(null);

  const [reviewedProductMap, setReviewedProductMap] = useState<Map<string, boolean>>(new Map());

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [hasCheckedUserId, setHasCheckedUserId] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (typeof user.id === 'number') {
          setCurrentUserId(user.id);
        } else {
          console.error("user_id trong localStorage không hợp lệ (không phải số):", user);
          setCurrentUserId(null);
        }
      } catch (e) {
        console.error("Lỗi khi parse currentUser từ localStorage:", e);
        setCurrentUserId(null);
      }
    } else {
      setCurrentUserId(null);
    }
    // Đặt cờ này sau khi đã kiểm tra localStorage
    setHasCheckedUserId(true);
  }, []);

  useEffect(() => {
    if (currentUserId !== null && hasCheckedUserId) {
      const fetchDataAndReviewStatus = async () => {
        try {
          setLoading(true); // Bắt đầu loading khi fetch dữ liệu
          setError(null); // Reset lỗi trước khi fetch mới

          const ordersResponse = await orderApi.getOrders();
          const fetchedOrders = ordersResponse.data;

          const newReviewedProductMap = new Map<string, boolean>();
          const productIdsToFetchReviews: Set<number> = new Set();
          const promises: Promise<void>[] = [];

          fetchedOrders.forEach((order: Order) => {
            if (order.order_status === 'delivered') {
              order.orderItems.forEach((item: OrderItem) => {
                productIdsToFetchReviews.add(item.product_id);
              });
            }
          });

          // Chuyển Set sang Array để có thể sử dụng forEach
          Array.from(productIdsToFetchReviews).forEach((productId) => {
            promises.push(
              (async () => {
                try {
                  const reviewsResponse = await reviewApi.getReviewsByProduct(productId);
                  const reviewsForProduct = reviewsResponse.data;

                  // Duyệt qua các đơn hàng đã fetch để cập nhật map
                  fetchedOrders.forEach((order: Order) => {
                    if (order.order_status === 'delivered') {
                      order.orderItems.forEach(item => {
                        if (item.product_id === productId) {
                          const hasUserReviewedForThisOrder = reviewsForProduct.some(
                            (review) =>
                              review.user_id === currentUserId &&
                              review.product_id === productId &&
                              review.order_id === order.order_id
                          );
                          if (hasUserReviewedForThisOrder) {
                            newReviewedProductMap.set(`${order.order_id}-${productId}`, true);
                          }
                        }
                      });
                    }
                  });
                } catch (err) {
                  console.error(`Lỗi khi lấy đánh giá cho sản phẩm ${productId}:`, err);
                  // Không set error ở đây để tránh ghi đè lỗi chính (nếu có)
                }
              })()
            );
          });

          await Promise.all(promises);

          setReviewedProductMap(newReviewedProductMap);
          setOrders(fetchedOrders);
          setLoading(false);
        } catch (err: any) {
          setError(err.message || 'Không lấy được danh sách đơn hàng.');
          setLoading(false);
        }
      };
      fetchDataAndReviewStatus();
    }
    else if (currentUserId === null && hasCheckedUserId) {
      setLoading(false);
      setError(null); // Đảm bảo không có lỗi khác được hiển thị
    }
  }, [currentUserId, hasCheckedUserId]); // currentUserId và hasCheckedUserId là dependencies

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng "${orderId}" không?`)) {
      try {
        setCancelLoading(orderId);
        const result = await orderApi.cancelOrderByUser(orderId);
        setCancelSuccess(result.data.message);
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.order_id === orderId ? { ...order, order_status: 'cancelled' } : order
          )
        );
        alert(
          `✓ Thành công\nĐơn hàng ${orderId} đã được hủy thành công.`
        );
      } catch (err: any) {
        setError(err.message || 'Không thể hủy đơn hàng.');
      } finally {
        setCancelLoading(null);
      }
    }
  };

  const getOrderStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'shipped': return 'default';
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Vui lòng đợi shop xác nhận';
      case 'processing': return 'Shop đã xác nhận, đơn hàng sẽ được tới tay bạn';
      case 'shipped': return 'Shipper đã lấy hàng';
      case 'delivered': return 'Đơn hàng đã giao thành công';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const handleReviewClick = (orderId: number, productId: number) => {
    setCurrentReviewOrderId(orderId);
    setCurrentReviewProductId(productId);
    setShowReviewForm(true);
  };

  const handleReviewCreated = (newReview: Review) => {
    setReviewedProductMap(prevMap => {
      const newMap = new Map(prevMap);
      if (newReview.order_id && newReview.product_id) {
        newMap.set(`${newReview.order_id}-${newReview.product_id}`, true);
      }
      return newMap;
    });

    alert('✓ Đánh giá đã được gửi thành công!');
    handleCloseReviewForm();

    if (newReview.product_id) {
      navigate(`/product/${newReview.product_id}`);
    }
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setCurrentReviewOrderId(null);
    setCurrentReviewProductId(null);
    window.location.reload()
  };
  if (!hasCheckedUserId) {
    return (
      <div className="cp-container">
        <div className="my-orders-loading-text">Đang tải thông tin người dùng...</div>
      </div>
    );
  }
  if (currentUserId === null) {
    return (
      <div className="cp-container">
        <div className="my-orders-error-alert">
          <span className="my-orders-error-icon">!</span>
          <div className="my-orders-error-content">
            <h2 className="my-orders-error-title">Truy cập bị từ chối</h2>
            <p className="my-orders-error-description">Bạn cần <Link to="/dangnhap">đăng nhập</Link> để xem đơn hàng của mình.</p>
          </div>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="cp-container">
        <div className="my-orders-loading-text">Đang tải đơn hàng...</div>
      </div>
    );
  }
  if (error && !cancelSuccess) {
    return (
      <div className="cp-container">
        <div className="my-orders-error-alert">
          <span className="my-orders-error-icon">!</span>
          <div className="my-orders-error-content">
            <h2 className="my-orders-error-title">Lỗi</h2>
            <p className="my-orders-error-description">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  if (cancelSuccess) {
    return (
      <div className="cp-container">
        <div className="my-orders-success-alert">
          <span className="my-orders-success-icon">✓</span>
          <h2 className="my-orders-success-title">Thành công</h2>
          <p className="my-orders-success-description">{cancelSuccess}</p>
        </div>
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <div className="myorders-container">
        <div className="my-orders-no-orders-message">
          Bạn chưa có đơn hàng nào. <Link to="/trangchu">Tiếp tục mua hàng!</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="myorders-container">
      <div className="my-orders-page">
        <h2 className="my-orders-title">Đơn hàng của tôi</h2>
        <table className="my-orders-table">
          <thead className="my-orders-thead">
            <tr>
              <th className="my-orders-header-cell">Mã đơn hàng</th>
              <th className="my-orders-header-cell">Ngày đặt hàng</th>
              <th className="my-orders-header-cell">Trạng thái</th>
              <th className="my-orders-header-cell">Tổng tiền</th>
              <th className="my-orders-header-cell">Sản phẩm</th>
              <th className="my-orders-header-cell">Hành động</th>
            </tr>
          </thead>
          <tbody className="my-orders-tbody">
            {orders.map((order) => {
              return (
                <tr key={order.order_id} className="my-orders-row">
                  <td className="my-orders-cell">{order.order_id}</td>
                  <td className="my-orders-cell">{order.order_date}</td>
                  <td className="my-orders-cell">
                    <span
                      className={`order-status-badge ${getOrderStatusBadgeVariant(
                        order.order_status
                      )}`}
                    >
                      {getOrderStatusText(order.order_status)}
                    </span>
                  </td>
                  <td className="my-orders-cell">
                    {Number(order.total_amount).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="my-orders-cell">
                    {order.orderItems.map((item: OrderItem) => (
                      <div key={item.product_id} className="my-orders-item">
                          {item.quantity} x {item.product?.name || `Sản phẩm ${item.product_id}`}
                      </div>
                    ))}
                  </td>
                  <td className="my-orders-cell">
                    {order.order_status === 'pending' ? (
                      <button
                        onClick={() => handleCancelOrder(order.order_id)}
                        disabled={cancelLoading === order.order_id}
                        className="my-orders-cancel-button"
                      >
                        {cancelLoading === order.order_id ? 'Đang hủy...' : 'Hủy Đơn'}
                      </button>
                    ) : null}

                    {order.order_status === 'delivered' &&
                     order.orderItems.map((item: OrderItem) => {
                       const productOrderKey = `${order.order_id}-${item.product_id}`;
                       const hasBeenReviewed = reviewedProductMap.get(productOrderKey);

                       if (!hasBeenReviewed) {
                         return (
                           <button
                             key={`review-btn-${productOrderKey}`}
                             className="my-orders-review-button"
                             onClick={() => handleReviewClick(order.order_id, item.product_id)}
                           >
                             Đánh giá {item.product?.name || `Sản phẩm ${item.product_id}`}
                           </button>
                         );
                       }
                       return null;
                     })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          onClick={() => navigate('/trangchu')}
          className="my-orders-continue-shopping-button"
        >
          Tiếp tục mua hàng
        </button>
      </div>
      {showReviewForm && currentReviewProductId && currentReviewOrderId && (
        <CreateReviewForm
          product_id={currentReviewProductId}
          order_id={currentReviewOrderId}
          onReviewCreated={handleReviewCreated}
          onClose={handleCloseReviewForm}
        />
      )}
    </div>
  );
};

export default MyOrderPage;