// src/pages/SearchResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import productApi from '../api/productApi';
import categoryApi from '../api/categoryApi';
import { Product } from '../types/product';
import { Category } from '../types/category';
import './SearchResultsPage.css'; // Thay đổi import CSS sang file mới

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('query');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

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
        const activeProducts = response.data.filter((product) => product.is_active);
        setAllProducts(activeProducts);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setLoading(true);
      setError(null);
      productApi.searchByName(searchTerm)
        .then(response => {
          const activeResults = response.data.filter((product: Product) => product.is_active);
          setSearchResults(activeResults);
          setFilteredProducts(activeResults); // Initially show all active search results
          setSelectedCategory(null); // Reset category selection
        })
        .catch(error => {
          setError('Có lỗi khi tìm kiếm sản phẩm.');
          console.error('Lỗi tìm kiếm:', error);
          setSearchResults([]);
          setFilteredProducts([]);
        })
        .finally(() => setLoading(false));
    } else {
      // Nếu không có từ khóa tìm kiếm, hiển thị tất cả sản phẩm đang hoạt động
      setSearchResults(allProducts);
      setFilteredProducts(allProducts);
      setSelectedCategory(null); // Reset category selection
      setLoading(false);
    }
  }, [searchTerm, allProducts]);

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId);
    // Lọc trên kết quả tìm kiếm ban đầu, không phải trên tất cả sản phẩm
    const filtered = searchResults.filter((product) => product.category_id === categoryId);
    setFilteredProducts(filtered);
  };
  
  // Hiển thị tất cả kết quả tìm kiếm khi bỏ chọn danh mục
  const handleShowAllResults = () => {
    setSelectedCategory(null);
    setFilteredProducts(searchResults);
  };

  if (loading) {
    return <div className="srp-loading-message">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="srp-error-message">{error}</div>;
  }

  return (
    <div className="srp-container">
      <section className="srp-main-content">
        <section className="srp-product-categories">
          <h3 className="srp-category-title">DANH MỤC SẢN PHẨM</h3>
          <div className="srp-categories-list">
             {/* Thêm nút "Tất cả sản phẩm" */}
             <div
                className={`srp-category-item ${
                  selectedCategory === null ? "active" : ""
                }`}
                style={{ cursor: "pointer", textDecoration: "none", color: 'inherit' }}
                onClick={handleShowAllResults}
              >
                Tất cả kết quả
              </div>
            {categories.map((category) => (
              <div // Thay Link bằng div để xử lý onClick lọc
                key={category.category_id}
                className={`srp-category-item ${
                  selectedCategory === category.category_id ? "active" : ""
                }`}
                style={{ cursor: "pointer", textDecoration: "none", color: 'inherit' }}
                onClick={() => handleCategoryClick(category.category_id)}
              >
                {category.name}
              </div>
            ))}
          </div>
        </section>
        <section className="srp-product-list">
          <h2 className="srp-search-results-title">
            Kết quả tìm kiếm cho: "{searchTerm}"
          </h2>
          <div className="srp-products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.product_id} className="srp-product-card">
                  {product.is_new && <div className="srp-new-badge srp-badge">NEW</div>}
                  {product.discount_price !== null && product.discount_price !== undefined && <div className="srp-sale-badge srp-badge">SALE</div>}
                  {product.is_featured && <div className="srp-best-sale-badge srp-badge">BEST SELLER</div>}

                  {product.image_url && (
                    <Link to={`/product/${product.product_id}`}>
                      <img
                        src={`http://localhost:5000${product.image_url}`}
                        alt={product.name}
                        className="srp-product-image" 
                      />
                    </Link>
                  )}
                  <h3 className="srp-product-name">{product.name}</h3>
                  <div className="srp-price-container">
                    {product.discount_price !== null &&
                      product.discount_price !== undefined ? (
                      <>
                        <p className="srp-original-price">
                          Giá: {Number(product.price).toLocaleString('vi-VN')} đ
                        </p>
                        <p className="srp-discount-price">
                          Khuyến mãi: {Number(product.discount_price).toLocaleString('vi-VN')} đ
                        </p>
                      </>
                    ) : (
                      <p className="srp-regular-price">
                        Giá: {Number(product.price).toLocaleString('vi-VN')} đ
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="srp-no-results-message">
                {searchTerm ? `Không tìm thấy sản phẩm nào cho "${searchTerm}".` : 'Vui lòng nhập từ khóa để tìm kiếm.'}
              </p>
            )}
          </div>
        </section>
      </section>
    </div>
  );
};

export default SearchResultsPage;