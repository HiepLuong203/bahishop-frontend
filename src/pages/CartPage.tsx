import React, { useState, useEffect} from 'react';
import cartApi from '../api/cartApi';
import { CartItemWithProduct } from '../types/cartItem';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css'; // Giữ nguyên tên file CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMoneyBill } from '@fortawesome/free-solid-svg-icons';

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('default');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await cartApi.getCart();
        setCartItems(response.data);
        setLoading(false);
      } catch (err: any) {
        setError('Bạn phải đăng nhập và xác thực email để đặt hàng.');
        console.error('Lỗi tải giỏ hàng:', err);
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const calculateItemTotal = (item: CartItemWithProduct) => {
    const price = item.product.discount_price !== null && item.product.discount_price !== undefined
      ? item.product.discount_price
      : item.product.price;
    return price * item.quantity;
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const handleRemoveItem = async (productId: number,productName: string) => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}" khỏi giỏ hàng không?`);
    if (isConfirmed) {
      try {
        await cartApi.removeFromCart(productId);
        const updatedCart = cartItems.filter(item => item.product_id !== productId);
        setCartItems(updatedCart);
        window.location.reload();
      } catch (error: any) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        alert('Không thể xóa sản phẩm.');
      }
    };  
  }
  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      alert('Số lượng phải lớn hơn 0.');
      return;
    }
    try {
      await cartApi.updateQuantity(productId, newQuantity);
      const updatedCart = cartItems.map(item =>
        item.product_id === productId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedCart);
      window.location.reload();
    } catch (error: any) {
      console.error('Lỗi khi cập nhật số lượng:', error);
      alert('Không thể cập nhật số lượng.');
    }
  };

  const handleContinueShopping = () => {
    navigate('/trangchu');
  };

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(event.target.value);
  };

  if (loading) {
    return <div className="cp-loading-message">Đang tải giỏ hàng...</div>;
  }

  if (error) {
    return <div className="cp-error-message">{error}</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="cp-empty-cart-message">
        Giỏ hàng của bạn đang trống. <Link to="/trangchu" className="cp-continue-shopping-link">Tiếp tục mua hàng!</Link>
      </div>
    );
  }

  return (
    <div className="cp-container">
      <h2 className="cp-cart-title">Giỏ hàng của tôi</h2>

      <table className="cp-cart-table">
        <thead>
          <tr>
            <th className="cp-table-header">Sản phẩm</th>
            <th className="cp-table-header">Giá</th>
            <th className="cp-table-header">Số lượng</th>
            <th className="cp-table-header">Tổng tiền</th>
            <th className="cp-table-header"></th>
            <th className="cp-table-header"></th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(item => (
            <tr key={item.cart_item_id} className="cp-cart-item-row">
              <td className="cp-product-cell">
                <Link to={`/product/${item.product.product_id}`} className="cp-product-info">
                  {item.product.image_url && (
                    <img
                      src={`http://localhost:5000${item.product.image_url}`}
                      alt={item.product.name}
                      className="cp-product-image-cart"
                    />
                  )}
                  <span className="cp-product-name-cart">{item.product.name}</span>
                </Link>
              </td>
              <td className="cp-price-cell">
                {item.product.discount_price !== null && item.product.discount_price !== undefined
                  ? `${Number(item.product.discount_price).toLocaleString('vi-VN')} đ`
                  : `${Number(item.product.price).toLocaleString('vi-VN')} đ`}
              </td>
              <td className="cp-quantity-cell">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value, 10);
                    if (!isNaN(newQuantity)) {
                      handleQuantityChange(item.product_id, newQuantity);
                    }
                  }}
                  className="cp-cart-quantity-input"
                />
              </td>
              <td className="cp-item-total-cell">{Number(calculateItemTotal(item)).toLocaleString('vi-VN')} đ</td>
              <td className="cp-action-buttons-cell">
                <button onClick={() => handleRemoveItem(item.product.product_id,item.product.name)} className="cp-remove-button">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </td>
              <td className="cp-action-buttons-cell">
                <button
                  onClick={() => {
                    const productName = item.product.name;
                    if (window.confirm(`Bạn có muốn thanh toán sản phẩm: ${productName}?`)) {
                      navigate(`/orders/checkout/${item.product.product_id}`);
                    }
                  }}
                  className="cp-checkout-single-button"
                >
                  <FontAwesomeIcon icon={faMoneyBill} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cp-total-bill-section">
        <h2 className="cp-total-bill-title">Tổng Bill</h2>
        <table className="cp-total-summary-table">
          <tbody>
            <tr>
              <td className="cp-summary-label">Tổng tiền giỏ hàng:</td>
              <td className="cp-summary-value">{Number(calculateTotalPrice()).toLocaleString('vi-VN')} đ</td>
            </tr>
          </tbody>
        </table>
        <div className="cp-payment-options">
          <h3 className="cp-payment-options-title">Hình thức thanh toán</h3>
          <div className="cp-payment-option-item">
            <input
              type="radio"
              id="default"
              value="default"
              checked={paymentMethod === 'default'}
              onChange={handlePaymentMethodChange}
              className="cp-radio-input"
            />
            <label htmlFor="default" className="cp-radio-label">Giao Hàng Mặc Định</label>
          </div>
          <div className="cp-payment-option-item">
            <input
              type="radio"
              id="transfer"
              value="transfer"
              checked={paymentMethod === 'transfer'}
              onChange={handlePaymentMethodChange}
              className="cp-radio-input"
            />
            <label htmlFor="transfer" className="cp-radio-label">Chuyển Khoản</label>
          </div>
        </div>
        <div className="cp-cart-actions">
          <button onClick={() => navigate(`/orders/checkout`)} className="cp-checkout-button">
            Tiến hành thanh toán
          </button>
          <button onClick={handleContinueShopping} className="cp-continue-shopping-button">
            Tiếp tục mua hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;