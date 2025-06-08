// src/routes/AppRouter.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import MainLayout from "../layout/MainLayout";
import SearchResultsPage from "../pages/SearchResultsPage"; 
import CategoryProductsPage from "../pages/CategoryProductsPage"; 
import ProductDetailPage from "../pages/ProductDetailPage"; 
import ProductsPage from "../pages/ProductsPage"; 
import LoginPage from "../pages/LoginPage"; 
import RegisterPage from "../pages/RegisterPage"; 
import ChangePasswordPage from "../pages/ChangePasswordPage"
import ProfilePage from "../pages/ProfilePage";
import CartPage from "../pages/CartPage";
import OrdersPage from "../pages/OrdersPage";
import MyOrderPage from "../pages/MyOrderPage";
import SupplierListPage from "../pages/SupplierListPage";
import AdminLayout from "../layout/admin/AdminLayout"; 
import DashboardPage from "../pages/admin/DashboardPage"; 
import AdminProductsPage from "../pages/admin/AdminProductsPage"; 
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminPurchaseOrdersPage from "../pages/admin/AdminPurchaseOrdersPage";
import AdminSuppliersPage from "../pages/admin/AdminSuppliersPage";
import AdminPromotionsPage from "../pages/admin/AdminPromotionsPage";
import AdminProductImagesPage from "../pages/admin/AdminProductImagesPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import ProductBatchManagementPage from '../pages/admin/ProductBatchManagementPage';
const AppRouter = () => {
  return (  
    <Router>
      <Routes>
        <Route path="/trangchu" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        <Route path="/search" element={
            <MainLayout>
              <SearchResultsPage />
            </MainLayout>
          }
        />
         <Route path="/categories/:categoryId" element={
            <MainLayout>
              <CategoryProductsPage />
            </MainLayout>
          }
        />
        <Route path="/product/:productId" element={ // Add this route
          <MainLayout>
            <ProductDetailPage />
          </MainLayout>
        }
        />
        <Route path="/products" element={
            <MainLayout>
              <ProductsPage />
            </MainLayout>
          }
        />
        <Route path="/dangnhap" element={
            <MainLayout>
              <LoginPage />
            </MainLayout>
          }
        />
        <Route path="/dangky" element={
            <MainLayout>
              <RegisterPage />
            </MainLayout>
          }
        />
        <Route path="/changepassword" element={
            <MainLayout>
              <ChangePasswordPage />
            </MainLayout>
          }
        />
        <Route path="/profile" element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          }
        />
        <Route path="/cartitems/mycart" element={
            <MainLayout>
              <CartPage />
            </MainLayout>
          }
        />
        <Route path="/orders/checkout" element={
            <MainLayout>
              <OrdersPage />
            </MainLayout>
          }
        />
        <Route path="/orders/checkout/:productId" element={
            <MainLayout>
              <OrdersPage />
            </MainLayout>
          }
        />
        <Route path="/orders/myorders" element={
            <MainLayout>
              <MyOrderPage />
            </MainLayout>
          }
        />
        <Route path="/suppliers" element={
            <MainLayout>
              <SupplierListPage />
            </MainLayout>
          }
        />
         <Route path="/product/filter/price" element={ // Add this route
          <MainLayout>
            <ProductDetailPage />
          </MainLayout>
        }
        />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="purchaseorders" element={<AdminPurchaseOrdersPage />} />
          <Route path="suppliers" element={<AdminSuppliersPage />} />
          <Route path="promotions" element={<AdminPromotionsPage />} />
          <Route path="productimage" element={<AdminProductImagesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="productbatch" element={<ProductBatchManagementPage />} />
          {/* ... các route admin khác ... */}
        </Route>
        {/* Các route khác sẽ được thêm vào đây */}
      </Routes>
      
    </Router>
    
  );
};

export default AppRouter;
