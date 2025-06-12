import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productApi from '../api/productApi';
import { ProductWithDetails } from '../types/product';
import './ProductDetailPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons'; // Không cần faChevronLeft/Right ở đây nữa
import cartApi from '../api/cartApi';
import authApi from '../api/authApi';
import ProductReviews from '../components/ProductReviews';
import CategoryTreeNav from '../components/CategoryTreeNav';
import ImageModal from '../components/ImageModal'; // Import component ImageModal mới

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: any }>();
  const numericProductId = parseInt(productId || '0');
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [mainImageId, setMainImageId] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showInactiveAlert, setShowInactiveAlert] = useState(false);

  const [isLoggedIn] = useState(() => !!localStorage.getItem('authToken'));
  const [isUserActive, setIsUserActive] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const [showImageModal, setShowImageModal] = useState(false);

  // Tạo một mảng chứa tất cả các URL ảnh có tiền tố
  const [allImagesWithPrefix, setAllImagesWithPrefix] = useState<Array<{ imageUrl: string; imageId: number | null }>>([]);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await productApi.getById(parseInt(productId, 10));
        const productWithImages: ProductWithDetails = productData.data;
        setProduct(productWithImages);

        if (productWithImages.category_id) {
          setSelectedCategory(productWithImages.category_id);
        }

        const imagesToProcess: Array<{ imageUrl: string; imageId: number | null; isPrimary?: boolean }> = [];

        // Thêm ảnh chính từ product.image_url nếu có
        if (productWithImages.image_url) {
          imagesToProcess.push({ imageUrl: productWithImages.image_url, imageId: null, isPrimary: true });
        }
        // Thêm ảnh từ mảng product.images
        if (productWithImages.images && productWithImages.images.length > 0) {
          productWithImages.images.forEach(img => {
            imagesToProcess.push({ imageUrl: img.image_url, imageId: img.image_id, isPrimary: img.is_primary });
          });
        }

        // Tạo mảng ảnh với tiền tố và định nghĩa ảnh chính ban đầu
        const processedImages = imagesToProcess.map(img => ({
          imageUrl: `http://localhost:5000${img.imageUrl}`,
          imageId: img.imageId,
        }));
        setAllImagesWithPrefix(processedImages);

        let initialMainImageUrl = '';
        let initialMainImageId: number | null = null;

        if (processedImages.length > 0) {
          // Ưu tiên ảnh is_primary hoặc ảnh đầu tiên trong mảng processedImages
          const primaryImage = processedImages.find(
            (img, index) =>
              (productWithImages.images && productWithImages.images[index] && productWithImages.images[index].is_primary && img.imageId === productWithImages.images[index].image_id) ||
              (img.imageId === null && productWithImages.image_url === img.imageUrl.replace('http://localhost:5000', ''))
          ) || processedImages[0];

          initialMainImageUrl = primaryImage.imageUrl;
          initialMainImageId = primaryImage.imageId;
        }

        setMainImageUrl(initialMainImageUrl);
        setMainImageId(initialMainImageId);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
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
    fetchUserActiveStatus();
  }, [productId]);

  const handleQuantityChange = (value: number) => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity + value));
  };

  const handleThumbnailClick = (clickedImageUrl: string, clickedImageId: number | null) => {
    setMainImageUrl(clickedImageUrl);
    setMainImageId(clickedImageId);
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
    if (quantity < 1) {
        alert("Số lượng sản phẩm phải lớn hơn 0.");
        setQuantity(1); // Reset quantity to 1
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

  const handleCategorySelect = (categoryId: number) => {
    navigate(`/categories/${categoryId}`);
  };

  const openImageModal = () => {
    if (mainImageUrl) {
      setShowImageModal(true);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const goToPrevImage = () => {
    const currentIndex = allImagesWithPrefix.findIndex(img => img.imageUrl === mainImageUrl && img.imageId === mainImageId);
    if (currentIndex > 0) {
      const prevImage = allImagesWithPrefix[currentIndex - 1];
      setMainImageUrl(prevImage.imageUrl);
      setMainImageId(prevImage.imageId);
    }
  };

  const goToNextImage = () => {
    const currentIndex = allImagesWithPrefix.findIndex(img => img.imageUrl === mainImageUrl && img.imageId === mainImageId);
    if (currentIndex < allImagesWithPrefix.length - 1) {
      const nextImage = allImagesWithPrefix[currentIndex + 1];
      setMainImageUrl(nextImage.imageUrl);
      setMainImageId(nextImage.imageId);
    }
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

  const currentImageIndex = allImagesWithPrefix.findIndex(img => img.imageUrl === mainImageUrl && img.imageId === mainImageId);
  const hasPrev = currentImageIndex > 0;
  const hasNext = currentImageIndex < allImagesWithPrefix.length - 1;


  return (
    <div className="pdp-content">
      <section className="pdp-main-content">
        <CategoryTreeNav
          selectedCategoryId={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />

        <section className="pdp-product-detail-section">
          <div className="pdp-product-main-display-area">
            <div className="pdp-product-images-and-thumbnails">
              <div className="pdp-product-image-frame" onClick={openImageModal}>
                <img src={mainImageUrl} alt={product.name} className="pdp-product-image-main" />
              </div>
              <div className="pdp-product-thumbnails">
                {allImagesWithPrefix.map((image) => (
                  <img
                    key={image.imageId !== null ? image.imageId : image.imageUrl} // Dùng imageUrl nếu imageId là null
                    src={image.imageUrl}
                    alt={`${product.name} - ${image.imageId || 'main'}`}
                    className={`pdp-product-image-thumbnail ${
                      image.imageUrl === mainImageUrl && image.imageId === mainImageId ? 'pdp-active-thumbnail' : ''
                    }`}
                    onClick={() => handleThumbnailClick(image.imageUrl, image.imageId)}
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
                <p className="pdp-product-origin">
                  Xuất xứ: {product.origin || 'N/A'}
                </p>
                <p className='pdp-product-unit'>
                  Đơn vị: {product.unit || 'N/A'}
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
            <div className="pdp-product-description-content" style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: product.description || 'Không có mô tả.' }}></div>
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

      {showImageModal && (
        <ImageModal
          imageUrl={mainImageUrl}
          onClose={closeImageModal}
          onPrev={goToPrevImage}
          onNext={goToNextImage}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;