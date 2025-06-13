// src/pages/admin/AdminCategoriesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './AdminCategoriesPage.css';
import categoryApi from '../../api/categoryApi';
import { Category } from '../../types/category';
import CategoryFormModal from '../../components/admin/CategoryFormModal';
import Pagination from '../../components/Pagination'; 

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); 

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAll();
      setCategories(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh mục.');
      setLoading(false);
    }
  }, []); // useCallback để tránh tạo lại hàm liên tục

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]); // Dependency include fetchCategories

  const handleAddCategory = () => {
    setCurrentCategory(null); // Đặt null để biết là đang thêm mới
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category); // Đặt danh mục cần chỉnh sửa
    setShowModal(true);
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${categoryName}" không?`)) {
      try {
        await categoryApi.deleteCategory(categoryId);
        alert('Danh mục đã được xóa thành công!');
        fetchCategories();
        // Cần đảm bảo trang hiện tại vẫn hợp lệ sau khi xóa một item
        // Nếu trang hiện tại không còn item nào, quay về trang trước
        const totalPages = Math.ceil((categories.length - 1) / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        } else if (categories.length -1 === 0) { // Nếu xóa item cuối cùng
            setCurrentPage(1);
        }
      } catch (err: any) {
        console.error('Lỗi khi xóa danh mục:', err);
        alert(`Không thể xóa danh mục: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleCategoryFormSubmitSuccess = () => {
    setShowModal(false); // Đóng modal
    fetchCategories(); // Tải lại danh sách danh mục
    setCurrentPage(1); // Quay về trang đầu tiên sau khi thêm/sửa thành công
  };

  // --- Logic Pagination ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div className="admin-categories-page">Đang tải danh mục...</div>;
  }

  if (error) {
    return <div className="admin-categories-page">Lỗi: {error}</div>;
  }

  return (
    <div className="admin-categories-page">
      <h1>Quản lý Danh mục</h1>
      <div className="admin-categories-actions">
        <button className="admin-button primary" onClick={handleAddCategory}>Thêm Danh mục</button>
      </div>
      {categories.length > 0 ? (
        <>
          <table className="admin-categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Danh mục</th>
                <th>Mô tả</th>
                <th>Danh mục cha</th>
                <th className="action-header">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {/* Thay đổi categories.map thành currentCategories.map */}
              {currentCategories.map((category) => (
                <tr key={category.category_id}>
                  <td>{category.category_id}</td>
                  <td>{category.name}</td>
                  <td>{category.description || 'N/A'}</td>
                  {/* Hiển thị tên danh mục cha thay vì ID */}
                  <td>
                    {category.parent_id
                      ? categories.find(cat => cat.category_id === category.parent_id)?.name || 'Không xác định'
                      : 'Không có'}
                  </td>
                  <td className="actions-cell">
                    <button className="admin-button secondary small" onClick={() => handleEditCategory(category)}>Sửa</button>
                    <button className="admin-button danger small" onClick={() => handleDeleteCategory(category.category_id, category.name)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Thêm Pagination component */}
          <Pagination
            totalItems={categories.length} // Tổng số danh mục
            itemsPerPage={itemsPerPage}   // Số danh mục mỗi trang
            currentPage={currentPage}     // Trang hiện tại
            onPageChange={handlePageChange} // Hàm xử lý khi chuyển trang
          />
        </>
      ) : (
        <p>Không có danh mục nào.</p>
      )}

      {showModal && (
        <CategoryFormModal
          category={currentCategory}
          onClose={() => setShowModal(false)}
          onSubmitSuccess={handleCategoryFormSubmitSuccess}
          allCategories={categories} // Truyền tất cả danh mục để chọn parent_id
        />
      )}
    </div>
  );
};

export default AdminCategoriesPage;