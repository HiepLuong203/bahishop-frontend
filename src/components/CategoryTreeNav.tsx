// src/components/common/CategoryTreeNav.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import categoryApi from '../api/categoryApi';
import { Category } from '../types/category';

interface NestedCategory extends Category {
  subcategories: NestedCategory[];
}

interface CategoryItemProps {
  category: NestedCategory;
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, selectedCategoryId, onCategorySelect }) => {
  return (
    <div className="cp-category-item-wrapper">
      <Link
        to={`/categories/${category.category_id}`}
        className={`cp-category-item ${selectedCategoryId === category.category_id ? 'cp-active' : ''}`}
        onClick={() => onCategorySelect(category.category_id)}
      >
        {category.name}
      </Link>
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="cp-subcategory-list">
          {category.subcategories.map(subCat => (
            <CategoryItem
              key={subCat.category_id}
              category={subCat}
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={onCategorySelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CategoryTreeNavProps {
  selectedCategoryId?: number | null;
  onCategorySelect?: (categoryId: number) => void;
}

const CategoryTreeNav: React.FC<CategoryTreeNavProps> = ({ selectedCategoryId = null, onCategorySelect }) => {
  const [nestedCategories, setNestedCategories] = useState<NestedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildCategoryTree = useCallback((flatCategories: Category[], parentId: number | null = null): NestedCategory[] => {
    const tree: NestedCategory[] = [];
    flatCategories.forEach(cat => {
      if (cat.parent_id === parentId) {
        const children = buildCategoryTree(flatCategories, cat.category_id);
        tree.push({ ...cat, subcategories: children });
      }
    });
    return tree;
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryApi.getAll();
      // Directly use response.data with buildCategoryTree, no need to store in 'categories' state
      setNestedCategories(buildCategoryTree(response.data));
    } catch (err: any) {
      console.error("Lỗi khi tải danh mục:", err);
      setError("Không thể tải danh mục.");
    } finally {
      setLoading(false);
    }
  }, [buildCategoryTree]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) {
    return <div className="cp-loading-container">Đang tải danh mục...</div>;
  }

  if (error) {
    return <div className="cp-error-container">{error}</div>;
  }

  return (
    <div className="cp-product-categories">
      <h3 className="cp-category-title">DANH MỤC SẢN PHẨM</h3>
      <div className="cp-categories-list">
        {nestedCategories.map(cat => (
          <CategoryItem
            key={cat.category_id}
            category={cat}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={onCategorySelect || (() => {})}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryTreeNav;