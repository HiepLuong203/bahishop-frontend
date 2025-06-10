import React, { useState, useEffect, useCallback } from 'react'; 
import { useLocation, Link } from 'react-router-dom'; 
import productApi from '../api/productApi';
import categoryApi from '../api/categoryApi'; 
import { Product } from '../types/product';
import { Category } from '../types/category'; 
import './SearchResultsPage.css';
import CategoryTreeNav from '../components/CategoryTreeNav'; 

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('query');
  const [searchResults, setSearchResults] = useState<Product[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allFlatCategories, setAllFlatCategories] = useState<Category[]>([]); // To use for getAllCategoryIdsInBranch
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

  const getAllCategoryIdsInBranch = useCallback((categoryId: number, categories: Category[]): number[] => {
    const ids: number[] = [categoryId];
    const directChildren = categories.filter(cat => cat.parent_id === categoryId);
    directChildren.forEach(child => {
      ids.push(...getAllCategoryIdsInBranch(child.category_id, categories));
    });
    return Array.from(new Set(ids)); // Remove duplicates
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

    fetchAllCategoriesFlat();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setLoading(true);
      setError(null);
      productApi.searchByName(searchTerm)
        .then(response => {
          const activeResults = response.data.filter((product: Product) => product.is_active);
          setSearchResults(activeResults);
          setDisplayedProducts(activeResults); // Initially show all active search results
          setSelectedCategory(null); // Reset category selection
        })
        .catch(error => {
          setError('Có lỗi khi tìm kiếm sản phẩm.');
          console.error('Lỗi tìm kiếm:', error);
          setSearchResults([]);
          setDisplayedProducts([]);
        })
        .finally(() => setLoading(false));
    } else {
      setSearchResults([]);
      setDisplayedProducts([]);
      setSelectedCategory(null);
      setLoading(false);
    }
  }, [searchTerm]); 

  useEffect(() => {
    if (selectedCategory !== null && allFlatCategories.length > 0) {
      const categoryIdsInBranch = getAllCategoryIdsInBranch(selectedCategory, allFlatCategories);
      const filtered = searchResults.filter(product =>
        product.category_id !== undefined && categoryIdsInBranch.includes(product.category_id)
      );
      setDisplayedProducts(filtered);
    } else {
      setDisplayedProducts(searchResults);
    }
  }, [selectedCategory, searchResults, allFlatCategories, getAllCategoryIdsInBranch]);


  
  const handleCategorySelectFromNav = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleShowAllResults = () => {
    setSelectedCategory(null);
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
        <aside className="cp-product-categories">
          <CategoryTreeNav
            selectedCategoryId={selectedCategory}
            onCategorySelect={handleCategorySelectFromNav}
          />
          <div className="srp-all-results-button-wrapper">
             <div
                className={`srp-category-item ${selectedCategory === null ? "active" : ""}`}
                style={{ cursor: "pointer", textDecoration: "none", color: 'inherit' }}
                onClick={handleShowAllResults}
              >
              </div>
          </div>
        </aside>

        <section className="srp-product-list">
          <h2 className="srp-search-results-title">
            Kết quả tìm kiếm cho: "{searchTerm}"
          </h2>
          <div className="srp-products-grid">
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product) => (
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
                {searchTerm ? `Không tìm thấy sản phẩm nào cho "${searchTerm}"` : 'Vui lòng nhập từ khóa để tìm kiếm.'}
                {selectedCategory && searchResults.length > 0 ? ` trong danh mục đã chọn.` : '.'}
              </p>
            )}
          </div>
        </section>
      </section>
    </div>
  );
};

export default SearchResultsPage;