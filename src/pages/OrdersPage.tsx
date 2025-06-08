import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import cartApi from '../api/cartApi';
import orderApi from '../api/orderApi';
import { CartItemWithProduct } from '../types/cartItem';
import { OrderInput, CheckoutItem, PaymentMethod } from '../types/order';
import './OrdersPage.css'; // Đảm bảo đường dẫn này đúng
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const OrdersPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();
  const { productId } = useParams<{ productId?: string }>();
  const [itemsToPay, setItemsToPay] = useState<CartItemWithProduct[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false); // State mới để điều khiển modal

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoadingCart(true);
        const response = await cartApi.getCart();
        setCartItems(response.data);
        setLoadingCart(false);
      } catch (err: any) {
        setCartError('Không thể tải giỏ hàng.');
        console.error('Lỗi tải giỏ hàng:', err);
        setLoadingCart(false);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    if (productId) {
      const singleProduct = cartItems.find(item => item.product.product_id === parseInt(productId));
      if (singleProduct) {
        setItemsToPay([singleProduct]);
      }
    } else {
      setItemsToPay(cartItems);
    }
  }, [cartItems, productId]);

  const calculateItemTotal = (item: CartItemWithProduct) => {
    const price = item.product.discount_price !== null && item.product.discount_price !== undefined
      ? item.product.discount_price
      : item.product.price;
    return price * item.quantity;
  };

  const calculateTotalPrice = (items: CartItemWithProduct[]) => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'shipping_name':
        setShippingName(value);
        break;
      case 'shipping_address':
        setShippingAddress(value);
        break;
      case 'shipping_phone':
        setShippingPhone(value);
        break;
      case 'payment_method':
        setPaymentMethod(value as PaymentMethod);
        break;
      case 'notes':
        setNotes(value);
        break;
      default:
        break;
    }
  };

  const handleRemoveItem = async (productIdToRemove: number) => {
    try {
      setItemsToPay(prevItems => prevItems.filter(item => item.product.product_id !== productIdToRemove));
      await cartApi.removeFromCart(productIdToRemove);
      setCartItems(prevCartItems => prevCartItems.filter(item => item.product.product_id !== productIdToRemove));
      window.location.reload()
    } catch (error: any) {
      console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
    }
  };

  const handleCheckout = async () => {
    if (!shippingName || !shippingAddress || !shippingPhone || !paymentMethod) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng và chọn phương thức thanh toán.');
      return;
    }

    if (itemsToPay.length === 0) {
      alert('Không có sản phẩm nào để thanh toán.');
      return;
    }

    const orderData: OrderInput = {
      shipping_name: shippingName,
      shipping_address: shippingAddress,
      shipping_phone: shippingPhone,
      payment_method: paymentMethod,
      notes: notes,
    };

    try {
      setLoadingCart(true);
      let response;

      if (productId) {
        const productToCheckout = itemsToPay[0];
        if (!productToCheckout) {
          alert('Không tìm thấy sản phẩm để thanh toán.');
          setLoadingCart(false);
          return;
        }
        response = await orderApi.checkoutSingle(parseInt(productId), orderData);
        console.log("QR Code URL received:", response.data?.order?.qr_code_url);
      } else {
        const itemsToCheckout: CheckoutItem[] = itemsToPay.map(item => {
          const price = item.product.discount_price !== null && item.product.discount_price !== undefined
            ? item.product.discount_price
            : item.product.price;
          return {
            product_id: item.product.product_id,
            quantity: item.quantity,
            unit_price: item.product.price,
            discount_price: item.product.discount_price,
            total_price: price * item.quantity,
          };
        });
        response = await orderApi.checkoutAll(orderData, itemsToCheckout);
        console.log("QR Code URL received:", response.data?.order?.qr_code_url);
      }

      setLoadingCart(false);

      if (paymentMethod === 'bank_transfer' && response.data?.order?.qr_code_url) {
        setQrCodeUrl(response.data.order.qr_code_url);
        setShowQrModal(true); // Hiển thị modal thay vì alert
      } else {
        alert('Đặt hàng thành công');
        navigate('/orders/myorders');
      }

    } catch (error: any) {
      console.error('Lỗi khi thanh toán:', error);
      alert('Đã có lỗi xảy ra khi thanh toán. Vui lòng thử lại.');
      setLoadingCart(false);
    }
  };

  const handleCloseQrModal = () => {
    setShowQrModal(false);
    navigate('/orders/myorders'); // Chuyển hướng người dùng về trang đơn hàng của tôi
    window.location.reload()
  };

  if (loadingCart) {
    return (
      <div className="order-container">
        <div className="orders-loading-message">Đang tải thông tin thanh toán...</div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="order-container">
        <div className="orders-error-message">{cartError}</div> 
      </div>
    );
  }

  return (
    <div className="order-container">
      <div className="orders-page-content"> 
        <div className="orders-container">
          <div className="orders-info-column">
            <h2 className="orders-title">Thông tin đặt hàng</h2>
            <form className="orders-form">
              <div className="orders-form-group">
                <label htmlFor="shipping_name">Tên người nhận:</label>
                <input type="text" id="shipping_name" name="shipping_name" value={shippingName} onChange={handleInputChange} required />
              </div>
              <div className="orders-form-group">
                <label htmlFor="shipping_address">Địa chỉ giao hàng:</label>
                <textarea id="shipping_address" name="shipping_address" value={shippingAddress} onChange={handleInputChange} required />
              </div>
              <div className="orders-form-group">
                <label htmlFor="shipping_phone">Số điện thoại:</label>
                <input type="tel" id="shipping_phone" name="shipping_phone" value={shippingPhone} onChange={handleInputChange} required />
              </div>
              <div className="orders-form-group">
                <label htmlFor="payment_method">Phương thức thanh toán:</label>
                <select id="payment_method" name="payment_method" value={paymentMethod} onChange={handleInputChange}>
                  <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                  <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                </select>
              </div>
              <div className="orders-form-group">
                <label htmlFor="notes">Ghi chú (tùy chọn):</label>
                <textarea id="notes" name="notes" value={notes} onChange={handleInputChange} />
              </div>
            </form>
          </div>
          <div className="orders-summary-column">
            <h2 className="orders-title">Đơn hàng của bạn</h2>
            {itemsToPay.length > 0 ? (
              <table className="orders-summary-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                    <th>Tổng</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {itemsToPay.map(item => (
                    <tr key={item.cart_item_id} className="orders-cart-item-row">
                      <td>
                        <Link to={`/product/${item.product.product_id}`} className="orders-product-info">
                          {item.product.image_url && (
                            <img
                              src={`http://localhost:5000${item.product.image_url}`}
                              alt={item.product.name}
                              className="orders-product-image"
                              // style={{ width: '50px', height: '50px', objectFit: 'contain', marginRight: '10px' }}
                              // Remove inline style, move to CSS
                            />
                          )}
                          <span className="orders-product-name">{item.product.name}</span>
                        </Link>
                      </td>
                      <td>{item.quantity}</td>
                      <td>
                        {item.product.discount_price !== null && item.product.discount_price !== undefined
                          ? `${Number(item.product.discount_price).toLocaleString('vi-VN')} đ`
                          : `${Number(item.product.price).toLocaleString('vi-VN')} đ`}
                      </td>
                      <td>{Number(calculateItemTotal(item)).toLocaleString('vi-VN')} đ</td>
                      {productId ? null : ( // Ẩn nút xóa khi thanh toán đơn lẻ
                        <td className="orders-action-buttons">
                          <button onClick={() => handleRemoveItem(item.product.product_id)} className="orders-remove-button">
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="orders-total-label">Tổng cộng:</td>
                    <td className="orders-total-amount">{Number(calculateTotalPrice(itemsToPay)).toLocaleString('vi-VN')} đ</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="orders-checkout-button-cell">
                      <button onClick={handleCheckout} className="orders-checkout-button">
                        Tiến hành thanh toán ({Number(calculateTotalPrice(itemsToPay)).toLocaleString('vi-VN')} đ)
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5}>
                      <button className="orders-continue-shopping-button">
                        <Link to="/trangchu" className="orders-continue-shopping-link">Tiếp tục mua hàng </Link>
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p>Không có sản phẩm nào để thanh toán.</p>
            )}
          </div>
        </div>
      </div>
      {/* QR Code Modal */}
      {showQrModal && qrCodeUrl && (
        <div className="qr-modal-overlay">
          <div className="qr-modal-content">
            <button className="qr-modal-close-button" onClick={handleCloseQrModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3 className="qr-modal-title">Quét mã QR để thanh toán chuyển khoản:</h3>
            <img src={qrCodeUrl} alt="Mã QR thanh toán" className="qr-modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;