import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ClientLayout from '../components/layout/ClientLayout'
import AdminLayout from '../components/layout/AdminLayout'
import PrivateRoute from './PrivateRoute'
import AdminRoute from './AdminRoute'
import AddProduct from '../pages/admin/AddProduct';
// Import trang quản lý sản phẩm vào đầu file
import ProductManagement from '../pages/admin/ProductManagement';
import EditProduct from '../pages/admin/EditProduct'; // <-- THÊM DÒNG NÀY
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
const AdminProducts = lazy(() => import('../pages/admin/Products'))
const AdminOrders  = lazy(() => import('../pages/admin/Orders'))
const AdminUsers   = lazy(() => import('../pages/admin/Users'))
const AdminCategories = lazy(() => import('../pages/admin/Categories'))
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
        {/* <Route path='/admin' element={<AdminRoute><AdminLayout /></AdminRoute>}> */}
        {/* Thành dòng này (tạm thời): */}
          <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          {/* <Route path='products' element={<AdminProducts />} /> */}
          <Route path='orders' element={<AdminOrders />} />
          <Route path='users' element={<AdminUsers />} />
          <Route path='categories' element={<AdminCategories />} />
          <Route path='vouchers' element={<AdminVouchers />} />
          <Route path='collections' element={<AdminCollections />} />
          <Route path='flash-sales' element={<AdminFlashSales />} />
          <Route path='reports' element={<AdminReports />} />
          <Route path="products" element={<ProductManagement />} />
         {/* thêm sản phẩm */}
          <Route path="products/create" element={<AddProduct />} /> 
          <Route path="products/edit/:id" element={<EditProduct />} /> {/* <-- THÊM DÒNG NÀY */}
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
