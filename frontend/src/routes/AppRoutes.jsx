import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// --- LAYOUTS ---
import ClientLayout from '../components/layout/ClientLayout';
import AdminLayout from '../components/layout/AdminLayout';

// --- GUARDS ---
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

// --- ADMIN PAGES (Import trực tiếp cho mượt) ---
import Dashboard from '../pages/admin/Dashboard';
import ProductManagement from '../pages/admin/ProductManagement';
import AddProduct from '../pages/admin/AddProduct';
import EditProduct from '../pages/admin/EditProduct';
import CategoryManagement from '../pages/admin/CategoryManagement';
import CustomerManagement from '../pages/admin/CustomerManagement';
import Inventory from '../pages/admin/Inventory';
import Settings from '../pages/admin/Settings';
import Support from '../pages/admin/Support';

// --- CLIENT PAGES (Lazy Load để tối ưu tốc độ) ---
const Home          = lazy(() => import('../pages/client/Home'));
const Shop          = lazy(() => import('../pages/client/Shop'));
const ProductDetail = lazy(() => import('../pages/client/ProductDetail'));
const Cart          = lazy(() => import('../pages/client/Cart'));
const Checkout      = lazy(() => import('../pages/client/Checkout'));
const OrderHistory  = lazy(() => import('../pages/client/OrderHistory'));
const Profile       = lazy(() => import('../pages/client/Profile'));
const Wishlist      = lazy(() => import('../pages/client/Wishlist'));

// --- AUTH PAGES ---
const Login          = lazy(() => import('../pages/auth/Login'));
const Register       = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const NotFound       = lazy(() => import('../pages/NotFound'));

// --- ADMIN PAGES (Các module còn lại) ---
const AdminOrders      = lazy(() => import('../pages/admin/Orders'));
const AdminVouchers    = lazy(() => import('../pages/admin/Vouchers'));
const AdminCollections = lazy(() => import('../pages/admin/Collections'));
const AdminFlashSales  = lazy(() => import('../pages/admin/FlashSales'));
const AdminReports     = lazy(() => import('../pages/admin/Reports'));

export default function AppRoutes() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-bold">VIBE STUDIO IS LOADING...</div>}>
            <Routes>
                {/* 1. KHU VỰC NGƯỜI DÙNG (CLIENT) */}
                <Route element={<ClientLayout />}>
                    <Route path='/' element={<Home />} />
                    <Route path='/shop' element={<Shop />} />
                    {/* <Route path='/shop/:slug' element={<ProductDetail />} /> */}
                    <Route path='/cart' element={<Cart />} />
                    <Route path="/shop/:id" element={<ProductDetail />} />
                    
                    {/* Các trang cần đăng nhập mới vào được */}
                    <Route element={<PrivateRoute />}>
                        <Route path='/checkout' element={<Checkout />} />
                        <Route path='/orders' element={<OrderHistory />} />
                        <Route path='/profile' element={<Profile />} />
                        <Route path='/wishlist' element={<Wishlist />} />
                    </Route>
                </Route>

                {/* 2. KHU VỰC ĐĂNG NHẬP / ĐĂNG KÝ */}
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />

                {/* 3. KHU VỰC QUẢN TRỊ (ADMIN) */}
                <Route path='/admin' element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    
                    {/* Các Module đã hoàn thiện */}
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="products/create" element={<AddProduct />} /> 
                    <Route path="products/edit/:id" element={<EditProduct />} />
                    <Route path="categories" element={<CategoryManagement />} />
                    <Route path="users" element={<CustomerManagement />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="support" element={<Support />} />

                    {/* Các Module chờ xử lý tiếp */}
                    <Route path='orders' element={<AdminOrders />} />
                    <Route path='vouchers' element={<AdminVouchers />} />
                    <Route path='collections' element={<AdminCollections />} />
                    <Route path='flash-sales' element={<AdminFlashSales />} />
                    <Route path='reports' element={<AdminReports />} />
                </Route>

                {/* 4. TRANG 404 */}
                <Route path='*' element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}