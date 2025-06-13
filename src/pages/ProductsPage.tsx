import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product, PriceFilter } from "../types/product";
import { Category } from "../types/category";
import categoryApi from "../api/categoryApi";
import productApi from "../api/productApi";
import './ProductPage.css';
import Pagination from "../components/Pagination";
import CategoryTreeNav from "../components/CategoryTreeNav";

const ProductPage: React.FC = () => {
  const [allFlatCategories, setAllFlatCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>({ min: null, max: null });
  const [sortOption, setSortOption] = useState<{
    sortBy: 'price' | 'name' | 'newest' | 'promotion' | 'featured';
    sortOrder: 'ASC' | 'DESC';
  }>({ sortBy: 'name', sortOrder: 'ASC' });
  const [loading, setLoading] = useState(false);
  const productsPerPage = 16;
  const navigate = useNavigate();

  const getAllCategoryIdsInBranch = useCallback((categoryId: number, categories: Category[]): number[] => {
    const ids: number[] = [categoryId];
    const directChildren = categories.filter(cat => cat.parent_id === categoryId);
    directChildren.forEach(child => {
      ids.push(...getAllCategoryIdsInBranch(child.category_id, categories));
    });
    return Array.from(new Set(ids));
  }, []);

  useEffect(() => {
    const fetchAllCategoriesFlat = async () => {
      try {
        setLoading(true);
        const response = await categoryApi.getAll();
        setAllFlatCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục phẳng:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchInitialProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.filterAndSortProducts({ isActive: true });
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCategoriesFlat();
    fetchInitialProducts();
  }, []);

  useEffect(() => {
    const applyFilters = async () => {
  try {
    setLoading(true);
    let productsToFilter: Product[] = [];

    if (selectedCategory !== null) {
      const categoryIdsToFetch = getAllCategoryIdsInBranch(selectedCategory, allFlatCategories);
      const allProducts: Product[] = [];

      for (const id of categoryIdsToFetch) {
        try {
          const response = await productApi.getByCategory(id);
          allProducts.push(...response.data);
        } catch (subCatError) {
          console.warn(`Không tìm thấy sản phẩm cho danh mục con ID ${id}`, subCatError);
        }
      }

      // Lọc trùng + lọc is_active
      const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.product_id, p])).values())
        .filter((p) => p.is_active);

      // Áp dụng lọc theo giá nếu có
      if (priceFilter.min !== null || priceFilter.max !== null) {
        productsToFilter = uniqueProducts.filter(p => {
          const price = p.discount_price ?? p.price;
          return (
            (priceFilter.min === null || price >= priceFilter.min) &&
            (priceFilter.max === null || price <= priceFilter.max)
          );
        });
      } else {
        productsToFilter = uniqueProducts;
      }

      // Áp dụng sắp xếp
      productsToFilter.sort((a, b) => {
        const getCompareValue = (p: Product) => {
          switch (sortOption.sortBy) {
            case "price": return p.discount_price ?? p.price;
            case "name": return p.name;
            case "promotion": return p.discount_price !== null ? 1 : 0;
            case "newest": return p.is_new ? 1 : 0;
            case "featured": return p.is_featured ? 1 : 0;
          }
        };
        const valA = getCompareValue(a);
        const valB = getCompareValue(b);
        if (valA < valB) return sortOption.sortOrder === "ASC" ? -1 : 1;
        if (valA > valB) return sortOption.sortOrder === "ASC" ? 1 : -1;
        return 0;
      });

    } else {
      const response = await productApi.filterAndSortProducts({
      ...(priceFilter.min !== null && { minPrice: priceFilter.min }),
      ...(priceFilter.max !== null && { maxPrice: priceFilter.max }),
      sortBy: sortOption.sortBy,
      sortOrder: sortOption.sortOrder,
      isActive: true,
    });
    productsToFilter = response.data;

    }

    setFilteredProducts(productsToFilter);
    setCurrentPage(1);
  } catch (error) {
    console.error("Lỗi khi áp dụng bộ lọc:", error);
    setFilteredProducts([]);
  } finally {
    setLoading(false);
  }
};


    if (allFlatCategories.length > 0 || selectedCategory === null) {
      applyFilters();
    }
  }, [selectedCategory, priceFilter, sortOption, allFlatCategories, getAllCategoryIdsInBranch]);

  const handleCategorySelectFromNav = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setPriceFilter({ min: null, max: null });
    setCurrentPage(1);
    if (categoryId) {
      navigate(`/categories/${categoryId}`);
    } else {
      navigate('/products');
    }
  };

  const handlePriceFilterChange = () => {
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-') as [
      'price' | 'name' | 'newest' | 'promotion' | 'featured',
      'ASC' | 'DESC'
    ];
    setSortOption({ sortBy, sortOrder });
    setCurrentPage(1);
  };

  const handleClearPriceFilter = () => {
    setPriceFilter({ min: null, max: null });
    setSelectedCategory(null);
    setCurrentPage(1);
    setFilteredProducts(products);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const totalItems = filteredProducts.length;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const currentCategoryName = selectedCategory
    ? allFlatCategories.find((cat) => cat.category_id === selectedCategory)?.name
    : null;

  return (
    <div className="pp-content">
      <section className="pp-main-content">
        <aside className="cp-product-categories">
          <CategoryTreeNav
            selectedCategoryId={selectedCategory}
            onCategorySelect={handleCategorySelectFromNav}
          />
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
        </aside>

        <section className="pp-product-list">
          <div className="pp-filter-controls">
            <h2>
              {selectedCategory
                ? `Sản phẩm thuộc danh mục: ${currentCategoryName}`
                : priceFilter.min !== null || priceFilter.max !== null
                ? `Sản phẩm có giá từ ${priceFilter.min ? Number(priceFilter.min).toLocaleString('vi-VN') + ' đ' : '0 đ'} đến ${priceFilter.max ? Number(priceFilter.max).toLocaleString('vi-VN') + ' đ' : 'bất kỳ'}`
                : 'Tất cả sản phẩm'}
            </h2>
            <div className="pp-sort-controls">
              <label htmlFor="sortOption">Sắp xếp: </label>
              <select id="sortOption" onChange={handleSortChange} value={`${sortOption.sortBy}-${sortOption.sortOrder}`}>
                <option value="name-ASC">Tên (A-Z)</option>
                <option value="name-DESC">Tên (Z-A)</option>
                <option value="price-ASC">Giá (Thấp - Cao)</option>
                <option value="price-DESC">Giá (Cao - Thấp)</option>
                <option value="newest-DESC">Mới</option>
                <option value="promotion-DESC">Khuyến mãi</option>
                <option value="featured-DESC">Bán chạy</option>
              </select>
            </div>
          </div>
          {loading && <p className="pp-loading-message">Đang tải...</p>}
          <div className="pp-products-grid">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <div key={product.product_id} className="pp-product-card">
                  <div className="pp-product-badges">
                    {product.is_new && <span className="pp-badge pp-new-badge">MỚI</span>}
                    {product.is_featured && <span className="pp-badge pp-best-sale-badge">BÁN CHẠY</span>}
                    {product.discount_price !== null && product.discount_price !== undefined && (
                      <span className="pp-badge pp-sale-badge">KHUYẾN MÃI</span>
                    )}
                  </div>
                  {product.image_url && (
                    <Link to={`/product/${product.product_id}`}>
                      <img
                        src={`http://localhost:5000${product.image_url}`}
                        alt={product.name}
                        className="pp-product-image"
                      />
                    </Link>
                  )}
                  <h3>{product.name}</h3>
                  <div className="pp-price-container">
                    {product.discount_price !== null && product.discount_price !== undefined ? (
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
              ))
            ) : (
              <p className="pp-no-products-message">
                Không có sản phẩm nào
                {selectedCategory ? ` trong danh mục "${currentCategoryName}"` : ''}
                {priceFilter.min !== null || priceFilter.max !== null
                  ? ` trong khoảng giá từ ${priceFilter.min ? Number(priceFilter.min).toLocaleString('vi-VN') + ' đ' : '0 đ'} đến ${priceFilter.max ? Number(priceFilter.max).toLocaleString('vi-VN') + ' đ' : 'bất kỳ'}`
                  : ''}.
              </p>
            )}
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