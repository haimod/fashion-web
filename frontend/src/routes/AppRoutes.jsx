import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// --- LAYOUTS ---
import ClientLayout from '../components/layout/ClientLayout';
import AdminLayout from '../components/layout/AdminLayout';

// --- GUARDS ---
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

// --- ADMIN PAGES ---
import Dashboard from '../pages/admin/Dashboard';
import ProductManagement from '../pages/admin/ProductManagement';
import AddProduct from '../pages/admin/AddProduct';
import EditProduct from '../pages/admin/EditProduct';
import CategoryManagement from '../pages/admin/CategoryManagement';
import CustomerManagement from '../pages/admin/CustomerManagement';
import Inventory from '../pages/admin/Inventory';
import Settings from '../pages/admin/Settings';
import Support from '../pages/admin/Support';

// --- CLIENT PAGES ---
import CategoryPage from '../pages/client/CategoryPage'; 
import CollectionPage from '../pages/client/CollectionPage';

const Home          = lazy(() => import('../pages/client/Home'));
const Shop          = lazy(() => import('../pages/client/Shop'));
const ProductDetail = lazy(() => import('../pages/client/ProductDetail'));
const Cart          = lazy(() => import('../pages/client/Cart'));
const Checkout      = lazy(() => import('../pages/client/Checkout'));
const OrderHistory  = lazy(() => import('../pages/client/OrderHistory'));
const Profile       = lazy(() => import('../pages/client/Profile'));
const Wishlist      = lazy(() => import('../pages/client/Wishlist'));
const CollectionDetail = lazy(() => import('../pages/client/CollectionDetail'));
const SalePage = lazy(() => import('../pages/client/SalePage'));

// 🚨 THÊM DÒNG NÀY: Khai báo trang Tìm kiếm 🚨
const SearchPage    = lazy(() => import('../pages/client/SearchPage'));

// --- AUTH PAGES ---
const Login          = lazy(() => import('../pages/auth/Login'));
const Register       = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const NotFound       = lazy(() => import('../pages/NotFound'));

// --- ADMIN PAGES ---
const AdminOrders      = lazy(() => import('../pages/admin/Orders'));
const AdminVouchers    = lazy(() => import('../pages/admin/Vouchers'));
const AdminCollections = lazy(() => import('../pages/admin/Collections'));
const AdminFlashSales  = lazy(() => import('../pages/admin/FlashSales'));
const AdminReports     = lazy(() => import('../pages/admin/Reports'));

export default function AppRoutes() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-bold text-[#3E2723]">VIBE STUDIO IS LOADING...</div>}>
            <Routes>
                {/* 1. KHU VỰC NGƯỜI DÙNG (CLIENT) */}
                <Route element={<ClientLayout />}>
                    <Route path='/' element={<Home />} />
                    <Route path='/cart' element={<Cart />} />

                    {/* 🚨 THÊM DÒNG NÀY: Route cho trang kết quả tìm kiếm 🚨 */}
                    <Route path='/search' element={<SearchPage />} />

                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="category/:id" element={<CategoryPage />} />
                    <Route path='/collection/:id' element={<CollectionDetail />} />
                    <Route element={<PrivateRoute />}>
                        <Route path='/checkout' element={<Checkout />} />
                        <Route path='/orders' element={<OrderHistory />} />
                        <Route path='/profile' element={<Profile />} />
                        <Route path='/wishlist' element={<Wishlist />} />


                    </Route>
                    
                    <Route path="/shop" element={<CollectionPage />} />
                     <Route path='/sale' element={<SalePage />} />

                </Route>

                {/* 2. KHU VỰC ĐĂNG NHẬP / ĐĂNG KÝ */}
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />

                {/* 3. KHU VỰC QUẢN TRỊ (ADMIN) */}
                <Route path='/admin' element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="products/create" element={<AddProduct />} /> 
                    <Route path="products/edit/:id" element={<EditProduct />} />
                    <Route path="categories" element={<CategoryManagement />} />
                    <Route path="users" element={<CustomerManagement />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="support" element={<Support />} />
                    <Route path='orders' element={<AdminOrders />} />
                    <Route path='vouchers' element={<AdminVouchers />} />
                    <Route path='collections' element={<AdminCollections />} />
                    <Route path='flash-sales' element={<AdminFlashSales />} />
                    <Route path='reports' element={<AdminReports />} />
                </Route>

                <Route path='*' element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}