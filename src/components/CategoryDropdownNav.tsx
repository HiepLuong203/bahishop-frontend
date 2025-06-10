// src/components/common/CategoryDropdownNav.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types/category'; 
import './CategoryDropdownNav.css'; 

interface NestedCategory extends Category {
  subcategories: NestedCategory[];
}

interface CategoryDropdownNavProps {
  categories: Category[]; // Tất cả danh mục phẳng từ API
  onCategorySelect: (categoryId: number) => void; // Callback khi một danh mục được chọn
  parentCategoryId?: number | null;
  level?: number; 
}

// Hàm trợ giúp để xây dựng cấu trúc cây từ danh sách phẳng
const buildCategoryTree = (
  flatCategories: Category[],
  parentId: number | null = null
): NestedCategory[] => {
  const tree: NestedCategory[] = [];
  flatCategories
    .filter((category) => category.parent_id === parentId)
    .forEach((category) => {
      tree.push({
        ...category,
        subcategories: buildCategoryTree(flatCategories, category.category_id),
      });
    });
  return tree;
};

const CategoryDropdownNav: React.FC<CategoryDropdownNavProps> = ({
  categories,
  onCategorySelect,
  parentCategoryId = null,
  level = 0,
}) => {
  // Lọc và xây dựng các danh mục con cho cấp độ hiện tại
  const nestedCategories = buildCategoryTree(categories, parentCategoryId);

  if (nestedCategories.length === 0) {
    return null; // Không có danh mục con nào ở cấp độ này
  }

  return (
    <ul className={`cdn-category-list cdn-level-${level}`}>
      {nestedCategories.map((category) => (
        <li key={category.category_id} className="cdn-category-item">
          <Link
            to={`/categories/${category.category_id}`}
            onClick={() => onCategorySelect(category.category_id)}
            className="cdn-category-link"
            style={{ paddingLeft: `${15 + level * 20}px` }} // Thụt lề cho danh mục con
          >
            {category.name}
          </Link>
          {/* Gọi đệ quy để hiển thị danh mục con nếu có */}
          {category.subcategories.length > 0 && (
            <CategoryDropdownNav
              categories={categories} // Luôn truyền tất cả danh mục phẳng cho các lời gọi đệ quy
              onCategorySelect={onCategorySelect}
              parentCategoryId={category.category_id}
              level={level + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

export default CategoryDropdownNav;