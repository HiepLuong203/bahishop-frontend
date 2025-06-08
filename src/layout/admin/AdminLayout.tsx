import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css'; // Import CSS cho layout admin

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const reloadPage = (path: string) => {
    if (location.pathname === path) {
      window.location.reload();
    }
  };
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li>
            <Link to="/admin/dashboard" onClick={() => reloadPage('/admin/dashboard')}
              className={`sidebar-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/products" onClick={() => reloadPage('/admin/products')}
              className={`sidebar-link ${location.pathname === '/admin/products' ? 'active' : ''}`}>
              Quản lý Sản phẩm
            </Link>
          </li>
           <li>
            <Link to="/admin/promotions" onClick={() => reloadPage('/admin/promotions')}
              className={`sidebar-link ${location.pathname === '/admin/promotions' ? 'active' : ''}`}>
              Quản lý Khuyến mãi
            </Link>
          </li>
           <li>
            <Link to="/admin/productimage" onClick={() => reloadPage('/admin/productimage')}
              className={`sidebar-link ${location.pathname === '/admin/productimage' ? 'active' : ''}`}>
              Loạt Ảnh Sản phẩm
            </Link>
          </li>
          <li>
            <Link to="/admin/categories" onClick={() => reloadPage('/admin/categories')}
              className={`sidebar-link ${location.pathname === '/admin/categories' ? 'active' : ''}`}>
              Quản lý Danh mục
            </Link>
          </li>
          <li>
            <Link to="/admin/suppliers" onClick={() => reloadPage('/admin/suppliers')}
              className={`sidebar-link ${location.pathname === '/admin/suppliers' ? 'active' : ''}`}>
              Nhà Cung Cấp
            </Link>
          </li>
          <li>
            <Link to="/admin/purchaseorders" onClick={() => reloadPage('/admin/purchaseorders')}
              className={`sidebar-link ${location.pathname === '/admin/purchaseorders' ? 'active' : ''}`}>
              Quản lý Nhập hàng
            </Link>
          </li>
          <li>
            <Link to="/admin/productbatch" onClick={() => reloadPage('/admin/productbatch')}
              className={`sidebar-link ${location.pathname === '/admin/productbatch' ? 'active' : ''}`}>
              Quản lý Lô Sản phẩm
            </Link>
          </li>
          <li>
            <Link to="/admin/orders" onClick={() => reloadPage('/admin/orders')}
              className={`sidebar-link ${location.pathname === '/admin/orders' ? 'active' : ''}`}>
              Quản lý Đơn hàng
            </Link>
          </li>
          <li>
            <Link to="/admin/orders" onClick={() => reloadPage('/admin/orders')}
              className={`sidebar-link ${location.pathname === '/admin/thongkedoanhthu' ? 'active' : ''}`}>
              Thống Kê Doanh Thu
            </Link>
          </li>
          {/* Thêm các mục quản lý khác */}
        </ul>
      </aside>
      <main className="admin-content">
        <Outlet /> {/* Nội dung của các trang con sẽ được render ở đây */}
      </main>
    </div>
  );
};

export default AdminLayout;