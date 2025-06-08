import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Category } from "../types/category";
import { Product, PriceFilter } from "../types/product";
import categoryApi from "../api/categoryApi";
import productApi from "../api/productApi";
import './ProductPage.css'; // Vẫn import file CSS này
import Pagination from "../components/Pagination"; // Import Pagination component

const ProductPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;
  const [priceFilter, setPriceFilter] = useState<PriceFilter>({ min: null, max: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };

    const fetchInitialProducts = async () => {
      try {
        const response = await productApi.getAll();
        const activeProducts = response.data.filter((product) => product.is_active);
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };

    fetchCategories();
    fetchInitialProducts();
  }, []);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        if (selectedCategory) {
          const response = await productApi.getByCategory(selectedCategory);
          setFilteredProducts(response.data);
          setCurrentPage(1);
        } else {
          setFilteredProducts(products); // Reset to all products when no category is selected
          setCurrentPage(1);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm theo danh mục:", error);
        setFilteredProducts([]);
      }
    };

    fetchCategoryProducts();
  }, [selectedCategory, products]); // products is a dependency because 'else' branch depends on it

  const totalItems = filteredProducts.length;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setPriceFilter({ min: null, max: null }); // Clear price filter when changing category
    setCurrentPage(1);
    if (categoryId) {
      navigate(`/categories/${categoryId}`);
    } else {
      navigate('/products');
    }
  };

  const handlePriceFilterChange = async () => {
    setSelectedCategory(null); // Clear category selection when applying price filter
    setCurrentPage(1);

    const minPrice: number = priceFilter.min === null ? 0 : priceFilter.min;
    const maxPrice: number = priceFilter.max === null ? Number.MAX_SAFE_INTEGER : priceFilter.max;

    console.log("Filtering by price - Min:", minPrice, "Max:", maxPrice);

    try {
      const response = await productApi.filterByPrice(minPrice, maxPrice);
      setFilteredProducts(response.data);
      console.log("Filtered products updated:", response.data);
    } catch (error) {
      console.error("Lỗi khi lọc sản phẩm theo giá:", error);
      setFilteredProducts([]);
    }
  };

  const handleClearPriceFilter = () => {
    setPriceFilter({ min: null, max: null });
    setSelectedCategory(null); // Clear category selection as well
    setCurrentPage(1);
    setFilteredProducts(products); // Reset to original products
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="pp-content">
      <section className="pp-main-content">
        <section className="pp-product-categories">
          <h3 className="pp-category-title">DANH MỤC SẢN PHẨM</h3>
          <div className="pp-categories-list">
            <div
              className={`pp-category-item ${selectedCategory === null ? "pp-active" : ""}`}
              style={{ cursor: "pointer", textDecoration: "none", color: 'inherit' }}
              onClick={() => handleCategoryClick(null)}
            >
              Tất cả sản phẩm
            </div>
            {categories.map((category) => (
              <div
                key={category.category_id}
                className={`pp-category-item ${selectedCategory === category.category_id ? "pp-active" : ""}`}
                style={{ cursor: "pointer", textDecoration: "none", color: 'inherit' }}
                onClick={() => handleCategoryClick(category.category_id)}
              >
                {category.name}
              </div>
            ))}
          </div>
          <div className="pp-price-filter-sidebar">
            <h3>LỌC THEO GIÁ</h3>
            <div className="pp-price-inputs">
              <input
                type="number"
                placeholder="Từ (VNĐ)"
                value={priceFilter.min === null ? '' : priceFilter.min}
                onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value === '' ? null : parseInt(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Đến (VNĐ)"
                value={priceFilter.max === null ? '' : priceFilter.max}
                onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value === '' ? null : parseInt(e.target.value) })}
              />
              <button onClick={handlePriceFilterChange}>Lọc</button>
              <button onClick={handleClearPriceFilter}>Bỏ lọc</button>
            </div>
          </div>
        </section>

        <section className="pp-product-list">
          <h2>
            {selectedCategory
              ? `Sản phẩm thuộc danh mục: ${
                  categories.find((cat) => cat.category_id === selectedCategory)?.name
                }`
              : priceFilter.min !== null || priceFilter.max !== null
                ? `Sản phẩm có giá từ ${priceFilter.min ? Number(priceFilter.min).toLocaleString('vi-VN')+' đ' : '0 đ'} đến ${priceFilter.max ? Number(priceFilter.max).toLocaleString('vi-VN')+' đ' : 'bất kỳ'}`
                : 'Tất cả sản phẩm'}
          </h2>
          <div className="pp-products-grid">
            {currentProducts.map((product) => (
              <div key={product.product_id} className="pp-product-card">
                {product.image_url && (
                  <Link to={`/product/${product.product_id}`}>
                    <img
                      src={`http://localhost:5000${product.image_url}`}
                      alt={product.name}
                      className="pp-product-image" // Thêm class cho ảnh
                    />
                  </Link>
                )}
                <h3>{product.name}</h3>
                <div className="pp-price-container">
                  {product.discount_price !== null &&
                  product.discount_price !== undefined ? (
                    <>
                      <p className="pp-original-price">
                        Giá: {Number(product.price).toLocaleString('vi-VN')} đ
                      </p>
                      <p className="pp-discount-price">
                        Khuyến mãi: {Number(product.discount_price).toLocaleString('vi-VN')} đ
                      </p>
                    </>
                  ) : (
                    <p className="pp-regular-price">
                      Giá: {Number(product.price).toLocaleString('vi-VN')} đ
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length > productsPerPage && (
            <Pagination
              totalItems={totalItems}
              itemsPerPage={productsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </section>
      </section>
    </div>
  );
};

export default ProductPage;