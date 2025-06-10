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
  const productsPerPage = 16;
  const [priceFilter, setPriceFilter] = useState<PriceFilter>({ min: null, max: null });
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
        const response = await categoryApi.getAll();
        setAllFlatCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục phẳng:", error);
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

    fetchAllCategoriesFlat();
    fetchInitialProducts();
  }, []);

  useEffect(() => {
    const applyCategoryFilter = async () => {
      if (selectedCategory !== null) {
        const categoryIdsToFetch = getAllCategoryIdsInBranch(selectedCategory, allFlatCategories);
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

        setFilteredProducts(uniqueActiveProducts);
      } else {
        setFilteredProducts(products);
      }
      setCurrentPage(1);
    };

    if (allFlatCategories.length > 0 || selectedCategory === null) {
      applyCategoryFilter();
    }
  }, [selectedCategory, products, allFlatCategories, getAllCategoryIdsInBranch]);

  const totalItems = filteredProducts.length;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

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

  const handlePriceFilterChange = async () => {
    setSelectedCategory(null);
    setCurrentPage(1);

    const minPrice: number = priceFilter.min === null ? 0 : priceFilter.min;
    const maxPrice: number = priceFilter.max === null ? Number.MAX_SAFE_INTEGER : priceFilter.max;

    console.log("Filtering by price - Min:", minPrice, "Max:", maxPrice);

    try {
      const response = await productApi.filterByPrice(minPrice, maxPrice);
      const activeAndPriceFiltered = response.data.filter(product => product.is_active);
      setFilteredProducts(activeAndPriceFiltered);
      console.log("Filtered products updated:", activeAndPriceFiltered);
    } catch (error) {
      console.error("Lỗi khi lọc sản phẩm theo giá:", error);
      setFilteredProducts([]);
    }
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
          <h2>
            {selectedCategory
              ? `Sản phẩm thuộc danh mục: ${currentCategoryName}`
              : priceFilter.min !== null || priceFilter.max !== null
                ? `Sản phẩm có giá từ ${priceFilter.min ? Number(priceFilter.min).toLocaleString('vi-VN')+' đ' : '0 đ'} đến ${priceFilter.max ? Number(priceFilter.max).toLocaleString('vi-VN')+' đ' : 'bất kỳ'}`
                : 'Tất cả sản phẩm'}
          </h2>
          <div className="pp-products-grid">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <div key={product.product_id} className="pp-product-card">
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
              ))
            ) : (
              <p className="pp-no-products-message">
                Không có sản phẩm nào
                {selectedCategory ? ` trong danh mục "${currentCategoryName}"` : ''}
                {priceFilter.min !== null || priceFilter.max !== null
                  ? ` trong khoảng giá từ ${priceFilter.min ? Number(priceFilter.min).toLocaleString('vi-VN')+' đ' : '0 đ'} đến ${priceFilter.max ? Number(priceFilter.max).toLocaleString('vi-VN')+' đ' : 'bất kỳ'}`
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