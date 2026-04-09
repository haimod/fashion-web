import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ClientLayout from '../components/layout/ClientLayout'
import AdminLayout from '../components/layout/AdminLayout'
import PrivateRoute from './PrivateRoute'
import AdminRoute from './AdminRoute'
import Inventory from '../pages/admin/Inventory';
import Settings from '../pages/admin/Settings';

// --- CÁC PAGE ĐÃ LÀM XONG TRỰC TIẾP ---
import AddProduct from '../pages/admin/AddProduct';
import CategoryManagement from '../pages/admin/CategoryManagement';
import ProductManagement from '../pages/admin/ProductManagement';
import EditProduct from '../pages/admin/EditProduct'; 
import CustomerManagement from '../pages/admin/CustomerManagement'; 
import Support from '../pages/admin/Support';
// Client pages (lazy load)
const Home         = lazy(() => import('../pages/client/Home'))
const Shop         = lazy(() => import('../pages/client/Shop'))
const ProductDetail = lazy(() => import('../pages/client/ProductDetail'))
const Cart         = lazy(() => import('../pages/client/Cart'))
const Checkout     = lazy(() => import('../pages/client/Checkout'))
const OrderHistory = lazy(() => import('../pages/client/OrderHistory'))
const Profile      = lazy(() => import('../pages/client/Profile'))
const Wishlist     = lazy(() => import('../pages/client/Wishlist'))
const Login        = lazy(() => import('../pages/auth/Login'))
const Register     = lazy(() => import('../pages/auth/Register'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'))
const NotFound     = lazy(() => import('../pages/NotFound'))

// Admin pages (lazy load)
const Dashboard    = lazy(() => import('../pages/admin/Dashboard'))
// ĐÃ XÓA SẠCH CÁC DÒNG IMPORT LỖI (Products, Categories, Users) Ở ĐÂY
const AdminOrders  = lazy(() => import('../pages/admin/Orders'))
const AdminVouchers    = lazy(() => import('../pages/admin/Vouchers'))
const AdminCollections = lazy(() => import('../pages/admin/Collections'))
const AdminFlashSales  = lazy(() => import('../pages/admin/FlashSales'))
const AdminReports = lazy(() => import('../pages/admin/Reports'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* CLIENT */}
        <Route element={<ClientLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/shop' element={<Shop />} />
          <Route path='/shop/:slug' element={<ProductDetail />} />
          <Route path='/cart' element={<Cart />} />
          <Route element={<PrivateRoute />}>
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/orders' element={<OrderHistory />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/wishlist' element={<Wishlist />} />
          </Route>
        </Route>

        {/* AUTH */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />

        {/* ADMIN */}
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          
          {/* CÁC MODULE ĐÃ HOÀN THIỆN */}
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/create" element={<AddProduct />} /> 
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="users" element={<CustomerManagement />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="settings" element={<Settings />} />
          <Route path="support" element={<Support />} />

          {/* CÁC MODULE CHƯA LÀM (Lazy Load) */}
          <Route path='orders' element={<AdminOrders />} />
          <Route path='vouchers' element={<AdminVouchers />} />
          <Route path='collections' element={<AdminCollections />} />
          <Route path='flash-sales' element={<AdminFlashSales />} />
          <Route path='reports' element={<AdminReports />} />
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}