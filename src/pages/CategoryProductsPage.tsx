import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, PriceFilter } from '../types/product';
import productApi from '../api/productApi';
import categoryApi from '../api/categoryApi';
import { Category } from '../types/category';
import './CategoryProductsPage.css'; // Import the NEW CSS file for styling

const CategoryProductsPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>({ min: null, max: null });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };

    const fetchProductsByCategory = async () => {
      if (categoryId) {
        setLoading(true);
        setError(null);
        try {
          const response = await productApi.getByCategory(parseInt(categoryId));
          const activeProducts = response.data.filter((product) => product.is_active); // Chỉ hiển thị sản phẩm đang hoạt động
          setProducts(activeProducts);
          setFilteredProducts(activeProducts); // Initialize filtered products
          setSelectedCategory(parseInt(categoryId));
        } catch (error: any) {
          setError('Lỗi khi tải sản phẩm theo danh mục.');
          console.error('Lỗi tải sản phẩm theo danh mục:', error);
          setProducts([]);
          setFilteredProducts([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategories();
    fetchProductsByCategory();
  }, [categoryId]);

  const handlePriceFilterChange = async () => {
    if (categoryId) {
      setLoading(true);
      setError(null);
      const minPrice: number = priceFilter.min === null ? 0 : priceFilter.min;
      const maxPrice: number = priceFilter.max === null ? Number.MAX_SAFE_INTEGER : priceFilter.max;

      try {
        const response = await productApi.filterByPrice(minPrice, maxPrice);
        // Filter the response to only include products within the current category AND are active
        const categoryFiltered = response.data.filter(
          (product) => product.category_id === parseInt(categoryId!) && product.is_active
        );
        setFilteredProducts(categoryFiltered);
      } catch (error) {
        console.error("Lỗi khi lọc sản phẩm theo giá:", error);
        setError("Lỗi khi lọc sản phẩm theo giá.");
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearPriceFilter = () => {
    setPriceFilter({ min: null, max: null });
    setFilteredProducts(products); // Reset to all products in the category (which are already active)
  };

  if (loading) {
    return <div className="cp-loading-container">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="cp-error-container">{error}</div>;
  }

  return (
    <div className="cp-content">
      <section className="cp-main-content">
        <section className="cp-product-categories">
          <h3 className="cp-category-title">DANH MỤC SẢN PHẨM</h3>
          <div className="cp-categories-list">
            {categories.map((category) => (
              <Link
                key={category.category_id}
                to={`/categories/${category.category_id}`}
                className={`cp-category-item ${
                  selectedCategory === category.category_id ? "cp-active" : ""
                }`}
                style={{ cursor: "pointer", textDecoration: "none", color: 'inherit' }}
              >
                {category.name}
              </Link>
            ))}
          </div>
          <div className="cp-price-filter-sidebar">
            <h3>LỌC THEO GIÁ</h3>
            <div className="cp-price-inputs">
              <input
                type="number"
                placeholder="Từ (VNĐ)"
                value={priceFilter.min === null ? '' : priceFilter.min}
                onChange={(e) =>
                  setPriceFilter({
                    ...priceFilter,
                    min: e.target.value === '' ? null : parseInt(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="Đến (VNĐ)"
                value={priceFilter.max === null ? '' : priceFilter.max}
                onChange={(e) =>
                  setPriceFilter({
                    ...priceFilter,
                    max: e.target.value === '' ? null : parseInt(e.target.value),
                  })
                }
              />
              <button onClick={handlePriceFilterChange}>Lọc</button>
              <button onClick={handleClearPriceFilter}>Bỏ lọc</button>
            </div>
          </div>
        </section>
        <section className="cp-product-list">
          <h2 className="cp-search-results-title">
            Sản phẩm thuộc danh mục:{" "}
            {categoryId && categories.find((cat) => cat.category_id === parseInt(categoryId))?.name}
            {priceFilter.min !== null || priceFilter.max !== null ? (
              <>
                <br />
                <span>
                  Lọc theo giá: từ{" "}
                  {priceFilter.min ? Number(priceFilter.min).toLocaleString('vi-VN')+" đ" : 'bất kỳ'}{" "}
                  đến{" "}
                  {priceFilter.max ? Number(priceFilter.max).toLocaleString('vi-VN')+" đ" : 'bất kỳ'}
                </span>
              </>
            ) : null}
          </h2>
          <div className="cp-products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.product_id} className="cp-product-card">
                  {product.image_url && (
                    <Link to={`/product/${product.product_id}`}>
                      <img
                        src={`http://localhost:5000${product.image_url}`}
                        alt={product.name}
                        className="cp-product-image" // Thêm class cho ảnh
                      />
                    </Link>
                  )}
                  <h3>{product.name}</h3>
                  <div className="cp-price-container">
                    {product.discount_price !== null &&
                    product.discount_price !== undefined ? (
                      <>
                        <p className="cp-original-price">
                          Giá: {Number(product.price).toLocaleString('vi-VN')} đ
                        </p>
                        <p className="cp-discount-price">
                          Khuyến mãi: {Number(product.discount_price).toLocaleString('vi-VN')} đ
                        </p>
                      </>
                    ) : (
                      <p className="cp-regular-price">
                        Giá: {Number(product.price).toLocaleString('vi-VN')} đ
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="cp-no-products-message">
                Không có sản phẩm nào thuộc danh mục này
                {priceFilter.min !== null || priceFilter.max !== null
                  ? ' trong khoảng giá này.'
                  : '.'}
              </p>
            )}
          </div>
        </section>
      </section>
    </div>
  );
};

export default CategoryProductsPage;