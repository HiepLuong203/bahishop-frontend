import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productApi from '../api/productApi';
import categoryApi from '../api/categoryApi';
import { ProductWithDetails } from '../types/product';
import { Category } from '../types/category';
import './ProductDetailPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import cartApi from '../api/cartApi';
import authApi from '../api/authApi';
import ProductReviews from '../components/ProductReviews'; 

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: any }>();
  const numericProductId = parseInt(productId || '0');
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [mainImageId, setMainImageId] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showInactiveAlert, setShowInactiveAlert] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('authToken')); 
  const [isUserActive, setIsUserActive] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await productApi.getById(parseInt(productId, 10));
        const productWithImages: ProductWithDetails = productData.data;
        setProduct(productWithImages);

        let initialMainImageUrl = '';
        let initialMainImageId: number | null = null;
        if (productWithImages.image_url) {
          initialMainImageUrl = `http://localhost:5000${productWithImages.image_url}`;
          setMainImageUrl(initialMainImageUrl);
          initialMainImageId = null;
          setMainImageId(initialMainImageId);
        } else if (productWithImages.images && productWithImages.images.length > 0) {
          const primaryImage = productWithImages.images.find(img => img.is_primary) || productWithImages.images[0];
          initialMainImageUrl = `http://localhost:5000${primaryImage.image_url}`;
          setMainImageUrl(initialMainImageUrl);
          initialMainImageId = primaryImage.image_id;
          setMainImageId(initialMainImageId);
        } else {
          setMainImageUrl('');
          setMainImageId(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
      } catch (error: any) {
        setError("Lỗi khi tải danh mục.");
        console.error("Lỗi khi tải danh mục:", error);
      }
    };

    const fetchUserActiveStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await authApi.getProfile();
          setIsUserActive(response.data.is_active);
        } catch (error) {
          console.error("Lỗi khi kiểm tra trạng thái người dùng:", error);
          setIsUserActive(false);
        }
      } else {
        setIsUserActive(false);
      }
    };

    fetchProduct();
    fetchCategories();
    fetchUserActiveStatus();
  }, [productId]);

  const handleQuantityChange = (value: number) => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity + value));
  };

  const handleThumbnailClick = (clickedImageUrl: string, clickedImageId: number | null) => {
    setMainImageUrl(clickedImageUrl);
    setMainImageId(clickedImageId); // Giữ nguyên việc set ID
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      setShowAlert(true);
      return;
    }
    if (isUserActive === false) {
      setShowInactiveAlert(true);
      return;
    }

    if (!product || !product.product_id) {
      console.error("Không có thông tin sản phẩm để thêm vào giỏ hàng.");
      return;
    }

    try {
      const cartItemData = {
        product_id: product.product_id,
        quantity: quantity,
      };
      const response = await cartApi.addToCart(cartItemData);
      console.log("Đã thêm vào giỏ hàng:", response.data);
      alert("Đã thêm sản phẩm vào giỏ hàng.");
      window.location.reload();
    } catch (error: any) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      if (error.response && error.response.data && error.response.data.message === "Tài khoản chưa được kích hoạt. Vui lòng xác thực email.") {
        setShowInactiveAlert(true);
      } else {
        alert("Có lỗi khi thêm sản phẩm vào giỏ hàng.");
      }
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const handleCloseInactiveAlert = () => {
    setShowInactiveAlert(false);
  };

  const handleLoginClick = () => {
    navigate('/dangnhap');
  };

  const handleActiveEmailClick = () => {
    navigate('/profile');
  };

  if (loading) {
    return <div className="pdp-loading">Đang tải thông tin sản phẩm...</div>;
  }

  if (error) {
    return <div className="pdp-error">Lỗi: {error}</div>;
  }

  if (!product) {
    return <div className="pdp-not-found">Không tìm thấy sản phẩm.</div>;
  }

  const allImages: { image_url: string; image_id: number | null }[] = [];
  // Luôn thêm ảnh chính từ product.image_url nếu có, với image_id là null
  if (product.image_url) {
    allImages.push({ image_url: product.image_url, image_id: null });
  }
  // Thêm các ảnh phụ từ product.images
  if (product.images) {
    product.images.forEach((img) => {
      allImages.push({ image_url: img.image_url, image_id: img.image_id });
    });
  }

  return (
    <div className="pdp-content">
      <section className="pdp-main-content">
        <section className="pdp-product-categories">
          <h3 className="pdp-category-title">DANH MỤC SẢN PHẨM</h3>
          <div className="pdp-categories-list">
            {categories.map((category) => (
              <Link
                key={category.category_id}
                to={`/categories/${category.category_id}`}
                className={`pdp-category-item ${
                  selectedCategory === category.category_id ? 'pdp-active' : ''
                }`}
                style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                onClick={() => setSelectedCategory(category.category_id)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="pdp-product-detail-section">
          <div className="pdp-product-main-display-area">
            <div className="pdp-product-images-and-thumbnails">
              <div className="pdp-product-image-frame">
                <img src={mainImageUrl} alt={product.name} className="pdp-product-image-main" />
              </div>
              <div className="pdp-product-thumbnails">
                {allImages.map((image) => (
                  <img
                    key={image.image_id !== null ? image.image_id : image.image_url} // Sử dụng image_id nếu có, nếu không thì dùng image_url làm key
                    src={`http://localhost:5000${image.image_url}`}
                    alt={`${product.name} - ${image.image_id || 'main'}`}
                    className={`pdp-product-image-thumbnail ${
                      // So sánh cả URL và ID để xác định ảnh đang được chọn
                      (mainImageUrl === `http://localhost:5000${image.image_url}` && mainImageId === image.image_id) ? 'pdp-active-thumbnail' : ''
                    }`}
                    onClick={() =>
                      handleThumbnailClick(`http://localhost:5000${image.image_url}`, image.image_id)
                    }
                  />
                ))}
              </div>
            </div>

            <div className="pdp-product-info-buy-box-wrapper">
              <div className="pdp-product-info-buy-box">
                <h1 className="pdp-product-name-detail">{product.name}</h1>
                <p className="pdp-product-category-supplier">
                  Danh mục: <Link to={`/categories/${product.category_id}`}>{product.category?.name || 'N/A'}</Link>
                </p>
                <div className="pdp-product-price-detail">
                  {product.discount_price !== null && product.discount_price !== undefined ? (
                    <>
                      <span className="pdp-current-price-display">
                        {Number(product.discount_price).toLocaleString('vi-VN')} đ
                      </span>
                      <span className="pdp-old-price-display">
                        {Number(product.price).toLocaleString('vi-VN')} đ
                      </span>
                    </>
                  ) : (
                    <span className="pdp-current-price-display">
                      {Number(product.price).toLocaleString('vi-VN')} đ
                    </span>
                  )}
                </div>
                <div className="pdp-quantity-container">
                  <p className="pdp-quantity-label">Số lượng:</p>
                  <div className="pdp-quantity-input-container">
                    <button className="pdp-quantity-button" onClick={() => handleQuantityChange(-1)}>
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                      className="pdp-quantity-input-box"
                    />
                    <button className="pdp-quantity-button" onClick={() => handleQuantityChange(1)}>
                      +
                    </button>
                  </div>
                </div>
                <button className="pdp-add-to-cart-button-detail" onClick={handleAddToCart}>
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>

          <div className="pdp-product-description-section-detail">
            <h2>Mô tả sản phẩm</h2>
            <div className="pdp-product-description-content" dangerouslySetInnerHTML={{ __html: product.description || 'Không có mô tả.' }}></div>
          </div>
        </section>
      </section>

      {showAlert && (
        <div className="pdp-login-alert">
          <button onClick={handleCloseAlert} className="pdp-close-button">
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <p>Bạn cần phải đăng nhập để mua sản phẩm.</p>
          <button className="pdp-login-button" onClick={handleLoginClick}>
            Đăng nhập
          </button>
        </div>
      )}
      {showInactiveAlert && (
        <div className="pdp-login-alert">
          <button onClick={handleCloseInactiveAlert} className="pdp-close-button">
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <p>Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực email để mua sản phẩm.</p>
          <button className="pdp-login-button" onClick={handleActiveEmailClick}>
            Kích hoạt tài khoản
          </button>
        </div>
      )}
      {numericProductId > 0 && <ProductReviews product_id={numericProductId} />}
    </div>
  );
};

export default ProductDetailPage;