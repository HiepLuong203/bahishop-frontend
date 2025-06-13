// src/pages/CategoryProductsPage.tsx (Chỉ là phần ví dụ để bạn hình dung)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, PriceFilter } from '../types/product';
import productApi from '../api/productApi';
import categoryApi from '../api/categoryApi'; // Vẫn cần để getAllCategoryIdsInBranch
import { Category } from '../types/category';
import CategoryTreeNav from '../components/CategoryTreeNav'; // <-- Import component mới
import './CategoryProductsPage.css';

const CategoryProductsPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allFlatCategories, setAllFlatCategories] = useState<Category[]>([]); // Để dùng cho getAllCategoryIdsInBranch
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>({ min: null, max: null });

  const getAllCategoryIdsInBranch = useCallback((categoryId: number, categories: Category[]): number[] => {
    const ids: number[] = [categoryId];
    const directChildren = categories.filter(cat => cat.parent_id === categoryId);
    directChildren.forEach(child => {
      ids.push(...getAllCategoryIdsInBranch(child.category_id, categories));
    });
    return Array.from(new Set(ids)); // Remove duplicates
  }, []);

  const fetchProductsForSelectedCategory = useCallback(async (selectedCatId: number) => {
    setLoading(true);
    setError(null);
    try {
      const categoryIdsToFetch = getAllCategoryIdsInBranch(selectedCatId, allFlatCategories);
      let allFetchedProducts: Product[] = [];

      for (const id of categoryIdsToFetch) {
        try {
          const response = await productApi.getByCategory(id);
          allFetchedProducts.push(...response.data);
        } catch (subCatError) {
          console.warn(`Không tìm thấy sản phẩm cho danh mục con ID ${id} hoặc lỗi:`, subCatError);
        }
      }

      const uniqueActiveProducts = Array.from(new Set(allFetchedProducts.map(p => p.product_id)))
        .map(id => allFetchedProducts.find(p => p.product_id === id)!)
        .filter((product) => product.is_active);

      setProducts(uniqueActiveProducts);
      setFilteredProducts(uniqueActiveProducts);
      setSelectedCategory(selectedCatId);
      setPriceFilter({ min: null, max: null }); // Reset price filter on category change
    } catch (error: any) {
      setError('Lỗi khi tải sản phẩm theo danh mục.');
      console.error('Lỗi tải sản phẩm theo danh mục:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [allFlatCategories, getAllCategoryIdsInBranch]);

  useEffect(() => {
    const fetchAllCategories = async () => { // Tải tất cả danh mục phẳng cho getAllCategoryIdsInBranch
      try {
        const response = await categoryApi.getAll();
        setAllFlatCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục gốc:", error);
      }
    };
    fetchAllCategories();
  }, []);

  useEffect(() => {
    if (categoryId && allFlatCategories.length > 0) {
      fetchProductsForSelectedCategory(parseInt(categoryId));
    }
  }, [categoryId, allFlatCategories, fetchProductsForSelectedCategory]);

  const handlePriceFilterChange = async () => {
    if (selectedCategory) {
      setLoading(true);
      setError(null);
      const minPrice: number = priceFilter.min === null ? 0 : priceFilter.min;
      const maxPrice: number = priceFilter.max === null ? Number.MAX_SAFE_INTEGER : priceFilter.max;

      try {
        const response = await productApi.filterByPrice(minPrice, maxPrice);

        const categoryIdsInBranch = getAllCategoryIdsInBranch(selectedCategory, allFlatCategories);

        const categoryAndPriceFiltered = response.data.filter(
          (product) => categoryIdsInBranch.includes(product.category_id) && product.is_active
        );
        setFilteredProducts(categoryAndPriceFiltered);
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
    setFilteredProducts(products);
  };

  const currentCategoryName = selectedCategory && allFlatCategories.find((cat) => cat.category_id === selectedCategory)?.name;

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
          <CategoryTreeNav
            selectedCategoryId={selectedCategory}
            onCategorySelect={(catId) => {
              window.history.pushState({}, '', `/categories/${catId}`);
              setSelectedCategory(catId); // Cập nhật state để CategoryTreeNav highlight đúng
              fetchProductsForSelectedCategory(catId); // Tải sản phẩm cho danh mục mới
            }}
          />
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
            {currentCategoryName}
            {priceFilter.min !== null || priceFilter.max !== null ? (
              <>
                <br />
                <span>
                  Lọc theo giá: từ{" "}
                  {priceFilter.min ? Number(priceFilter.min).toLocaleString('vi-VN') + " đ" : 'bất kỳ'}{" "}
                  đến{" "}
                  {priceFilter.max ? Number(priceFilter.max).toLocaleString('vi-VN') + " đ" : 'bất kỳ'}
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
                        className="cp-product-image"
                      />
                    </Link>
                  )}
                   <div className="cp-product-badges">
                    {product.is_new && <span className="cp-badge cp-new-badge">MỚI</span>}
                    {product.is_featured && <span className="cp-badge cp-best-sale-badge">BÁN CHẠY</span>}
                    {(product.discount_price !== null && product.discount_price !== undefined) && (
                      <span className="cp-badge cp-sale-badge">KHUYẾN MÃI</span>
                    )}
                  </div>
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