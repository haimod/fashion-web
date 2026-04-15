<?php
// API Routes - Laravel
use Illuminate\Support\Facades\Route;

// --- ADMIN CONTROLLERS ---
use App\Http\Controllers\API\Admin\AdminProductController; 
use App\Http\Controllers\API\Admin\AdminCategoryController; 
use App\Http\Controllers\API\Admin\AdminCustomerController; 
use App\Http\Controllers\API\Admin\AdminVoucherController;
use App\Http\Controllers\API\Admin\AdminFlashSaleController;
use App\Http\Controllers\API\Admin\AdminCollectionController;
use App\Http\Controllers\API\Admin\AdminInventoryController;
use App\Http\Controllers\API\Admin\AdminProfileController;
use App\Http\Controllers\API\Admin\AdminOrderController;
use App\Http\Controllers\API\Admin\AdminDashboardController; // Thêm đúng dòng này sếp nhé!


// --- CLIENT CONTROLLERS ---
use App\Http\Controllers\API\Client\ClientHomeController;
use App\Http\Controllers\API\Client\ClientProductController;


use App\Http\Controllers\API\Client\ClientProfileController;
use App\Http\Controllers\API\Client\ClientCartController;
use App\Http\Controllers\API\Client\ClientOrderController;
// Auth routes
Route::prefix('auth')->group(base_path('routes/api/auth.php'));

// Client routes (Sanctum auth)
//Route::prefix('v1')->middleware('auth:sanctum')->group(base_path('routes/api/client.php'));
Route::middleware('auth:sanctum')->group(function () {
    // API lấy thông tin Profile
    Route::get('/client/profile', [ClientProfileController::class, 'getProfile']);
    // API Sổ địa chỉ
    Route::get('/client/addresses', [ClientProfileController::class, 'getAddresses']);
    Route::post('/client/addresses', [ClientProfileController::class, 'addAddress']);
    // Cập nhật thông tin
    Route::put('/client/profile', [ClientProfileController::class, 'updateProfile']);
    // Sửa, xóa địa chỉ
    Route::put('/client/addresses/{id}', [ClientProfileController::class, 'updateAddress']);
    Route::delete('/client/addresses/{id}', [ClientProfileController::class, 'deleteAddress']);

    // API Giỏ hàng
    Route::get('/client/cart', [ClientCartController::class, 'getCart']);
    Route::put('/client/cart/{ma_bien_the}', [ClientCartController::class, 'updateQuantity']);
    Route::delete('/client/cart/{ma_bien_the}', [ClientCartController::class, 'removeItem']);
    Route::post('/client/cart/add', [ClientCartController::class, 'addToCart']);
    Route::post('/client/checkout', [ClientOrderController::class, 'placeOrder']);
    Route::get('/client/orders', [ClientOrderController::class, 'getOrders']);
    Route::post('/client/voucher/apply', [ClientCartController::class, 'applyVoucher']);
    Route::get('/client/orders/{ma_dh}', [ClientOrderController::class, 'getOrderDetail']);
    Route::put('/client/orders/{ma_dh}/cancel', [ClientOrderController::class, 'cancelOrder']);

});
// Admin routes (Sanctum auth + Role)
Route::prefix('admin')->middleware(['auth:sanctum','role:admin'])->group(base_path('routes/api/admin.php'));
// =====================================================================
// 🔴 KHU VỰC QUẢN TRỊ (ADMIN)
// =====================================================================
Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);
Route::post('/admin/dashboard/flash-sale', [AdminDashboardController::class, 'quickCreateFlashSale']); // THÊM DÒNG NÀY
// --- QUẢN LÝ SẢN PHẨM ---
Route::get('/admin/products', [AdminProductController::class, 'index']);
Route::post('/admin/products', [AdminProductController::class, 'store']);
Route::delete('/admin/products/{id}', [AdminProductController::class, 'destroy']); 
Route::get('/admin/products/{id}', [AdminProductController::class, 'show']);
Route::post('/admin/products/{id}', [AdminProductController::class, 'update']);

// --- QUẢN LÝ DANH MỤC ---
Route::get('/admin/categories', [AdminCategoryController::class, 'index']);
Route::post('/admin/categories', [AdminCategoryController::class, 'store']);
Route::put('/admin/categories/{id}', [AdminCategoryController::class, 'update']);
Route::delete('/admin/categories/{id}', [AdminCategoryController::class, 'destroy']);

// --- QUẢN LÝ KHÁCH HÀNG ---
Route::get('/admin/customers', [AdminCustomerController::class, 'index']);
Route::post('/admin/customers', [AdminCustomerController::class, 'store']);
Route::put('/admin/customers/{id}', [AdminCustomerController::class, 'update']);
Route::patch('/admin/customers/{id}/toggle-status', [AdminCustomerController::class, 'toggleStatus']);

// --- QUẢN LÝ VOUCHER ---
Route::get('/admin/vouchers', [AdminVoucherController::class, 'index']);
Route::post('/admin/vouchers', [AdminVoucherController::class, 'store']); 
Route::put('/admin/vouchers/{id}', [AdminVoucherController::class, 'update']);
Route::delete('/admin/vouchers/{id}', [AdminVoucherController::class, 'destroy']);

// --- FLASH SALE ---
Route::get('/admin/flash-sales', [AdminFlashSaleController::class, 'index']); 
Route::post('/admin/flash-sales', [AdminFlashSaleController::class, 'store']);
Route::delete('/admin/flash-sales/{ma_fs}', [AdminFlashSaleController::class, 'destroy']); 
Route::get('/admin/flash-sales/{ma_fs}/items', [AdminFlashSaleController::class, 'getItems']);
Route::get('/admin/flash-sales/{ma_fs}/available-variants', [AdminFlashSaleController::class, 'getAvailableVariants']);
Route::post('/admin/flash-sales/{ma_fs}/items', [AdminFlashSaleController::class, 'addItem']);
Route::delete('/admin/flash-sales/{ma_fs}/items/{ma_bien_the}', [AdminFlashSaleController::class, 'removeItem']);

// --- QUẢN LÝ BỘ SƯU TẬP ---
Route::get('/admin/collections', [AdminCollectionController::class, 'index']);
Route::post('/admin/collections', [AdminCollectionController::class, 'store']);
Route::delete('/admin/collections/{id}', [AdminCollectionController::class, 'destroy']);
Route::get('/admin/collections/{id}/items', [AdminCollectionController::class, 'getItems']);
Route::get('/admin/collections/{id}/available', [AdminCollectionController::class, 'getAvailableProducts']);
Route::post('/admin/collections/{id}/items', [AdminCollectionController::class, 'addItem']);
Route::delete('/admin/collections/{id}/items/{ma_sp}', [AdminCollectionController::class, 'removeItem']);
Route::post('/admin/collections/{id}', [AdminCollectionController::class, 'update']);

// --- QUẢN LÝ TỒN KHO & PROFILE ---
Route::get('/admin/inventory', [AdminInventoryController::class, 'index']);
Route::put('/admin/inventory/{ma_sp}/stock', [AdminInventoryController::class, 'updateStock']);
Route::get('/admin/profile', [AdminProfileController::class, 'getAdminInfo']);
//--- Quản lí đơn hàng
Route::get('/admin/orders', [AdminOrderController::class, 'getOrders']);
Route::get('/admin/orders/{ma_dh}', [AdminOrderController::class, 'getOrderDetail']);
Route::put('/admin/orders/{ma_dh}/status', [AdminOrderController::class, 'updateOrderStatus']);
Route::delete('/admin/orders/{ma_dh}', [AdminOrderController::class, 'deleteOrder']);

// =====================================================================
// 🟢 KHU VỰC NGƯỜI DÙNG BÊN NGOÀI (CLIENT)
// =====================================================================

// Lấy dữ liệu cho trang chủ (Flash sale, sản phẩm mới...)
Route::get('/client/home-data', [ClientHomeController::class, 'getHomeData']);

// Lấy danh sách các Bộ Sưu Tập (API Đã Fix Lỗi)
Route::get('/client/collections', [ClientHomeController::class, 'getCollections']);

// Lấy danh sách sản phẩm theo từng nhóm phân loại (Nam, Nữ, Phụ kiện)
Route::get('/client/category/{prefix}', [ClientHomeController::class, 'getCategoryProducts']);

// API Tổng để lọc toàn cửa hàng và Thanh Tìm Kiếm
Route::get('/client/shop', [ClientHomeController::class, 'getAllProducts']);

// Lấy chi tiết của 1 Sản phẩm khi khách bấm vào xem
Route::get('/client/product/{id}', [ClientProductController::class, 'getProductDetail']);


Route::get('/client/collections/{id}', [ClientHomeController::class, 'getCollectionDetail']);

Route::get('/client/vouchers', [ClientHomeController::class, 'getVouchers']);