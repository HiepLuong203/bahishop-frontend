import React, { useState, useEffect } from "react";
import "./HomePage.css"; // Giữ nguyên tên file CSS
import { Link } from "react-router-dom";
import { Category } from "../types/category";
import { Product } from "../types/product";
import categoryApi from "../api/categoryApi";
import productApi from "../api/productApi";
import ImageSlider from "../components/ImageSlider";

const sliderImages = [
  "/anhbia1.jpg",
  "/anhbia5.jpg",
  "/anhbia6.jpg",
  "/anhbia3.jpg",
];

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [promotionalProducts, setPromotionalProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await productApi.getAll();
        // Lọc chỉ hiển thị các sản phẩm đang hoạt động
        const activeProducts = response.data.filter((product) => product.is_active);

        const featured = activeProducts.filter((product) => product.is_featured);
        setFeaturedProducts(featured);

        const onSale = activeProducts.filter(
          (product) => product.discount_price !== null && product.discount_price !== undefined
        );
        setPromotionalProducts(onSale);

        const newPro = activeProducts.filter((product) => product.is_new);
        setNewProducts(newPro);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  return (
    <div className="hp-content">
      <div className="hp-top-section">
        <section className="hp-product-categories-homepage">
          <h3 className="hp-category-title">DANH MỤC SẢN PHẨM</h3>
          <div className="hp-categories-list">
            {categories.map((category) => (
              <Link
                key={category.category_id}
                to={`/categories/${category.category_id}`}
                className="hp-category-item"
                style={{ cursor: "pointer", textDecoration: "none", color: 'inherit' }}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
        <div className="hp-slider-wrapper">
          <div className="hp-image-slider-container">
            <ImageSlider images={sliderImages} interval={4000} />
          </div>
        </div>
      </div>
     
      <section className="hp-featured-products hp-product-section">
        <h2 className="hp-section-title">Sản phẩm bán chạy</h2>
        <div className="hp-products-grid">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <div key={product.product_id} className="hp-product-card">
                {product.is_featured && <div className="hp-best-sale-badge hp-badge">BEST SELLER</div>}
                {product.image_url && (
                  <Link to={`/product/${product.product_id}`}>
                    <img src={`http://localhost:5000${product.image_url}`} alt={product.name}
                      className="hp-product-image" />
                  </Link>
                )}
                <h3 className="hp-product-name">{product.name}</h3>
                <div className="hp-price-container">
                  {product.discount_price !== null && product.discount_price !== undefined ? (
                    <>
                      <p className="hp-original-price">Giá: {Number(product.price).toLocaleString('vi-VN')} đ</p>
                      <p className="hp-discount-price">Khuyến mãi: {Number(product.discount_price).toLocaleString('vi-VN')} đ</p>
                    </>
                  ) : (
                    <p className="hp-regular-price">Giá: {Number(product.price).toLocaleString('vi-VN')} đ</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="hp-no-products-message">Không có sản phẩm bán chạy.</p>
          )}
        </div>
      </section>

      <section className="hp-promotions hp-product-section">
        <h2 className="hp-section-title">Sản phẩm khuyến mãi</h2>
        <div className="hp-products-grid">
          {promotionalProducts.length > 0 ? (
            promotionalProducts.map((product) => (
              <div key={product.product_id} className="hp-product-card">
                {product.discount_price !== null && product.discount_price !== undefined && <div className="hp-sale-badge hp-badge">SALE</div>}
                {product.image_url && (
                  <Link to={`/product/${product.product_id}`}>
                    <img src={`http://localhost:5000${product.image_url}`} alt={product.name}
                      className="hp-product-image" />
                  </Link>
                )}
                <h3 className="hp-product-name">{product.name}</h3>
                <div className="hp-price-container">
                  <p className="hp-original-price">Giá gốc: {Number(product.price).toLocaleString('vi-VN')} đ</p>
                  <p className="hp-discount-price">Khuyến mãi: {Number(product.discount_price).toLocaleString('vi-VN')} đ</p>
                </div>
              </div>
            ))
          ) : (
            <p className="hp-no-products-message">Không có sản phẩm khuyến mãi.</p>
          )}
        </div>
      </section>

      <section className="hp-new-products hp-product-section">
        <h2 className="hp-section-title">Sản phẩm mới</h2>
        <div className="hp-products-grid">
          {newProducts.length > 0 ? (
            newProducts.map((product) => (
              <div key={product.product_id} className="hp-product-card">
                {product.is_new && <div className="hp-new-badge hp-badge">NEW</div>}
                {product.image_url && (
                  <Link to={`/product/${product.product_id}`}>
                    <img src={`http://localhost:5000${product.image_url}`} alt={product.name}
                      className="hp-product-image" />
                  </Link>
                )}
                <h3 className="hp-product-name">{product.name}</h3>
                <div className="hp-price-container">
                  {product.discount_price !== null && product.discount_price !== undefined ? (
                    <>
                      <p className="hp-original-price">Giá: {Number(product.price).toLocaleString('vi-VN')} đ</p>
                      <p className="hp-discount-price">Khuyến mãi: {Number(product.discount_price).toLocaleString('vi-VN')} đ</p>
                    </>
                  ) : (
                    <p className="hp-regular-price">Giá: {Number(product.price).toLocaleString('vi-VN')} đ</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="hp-no-products-message">Không có sản phẩm mới.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;