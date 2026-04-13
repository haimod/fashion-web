<?php
// API Routes - Laravel
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Admin\AdminProductController; 
use App\Http\Controllers\API\Admin\AdminCategoryController; 
use App\Http\Controllers\API\Admin\AdminCustomerController; 
use App\Http\Controllers\API\Admin\AdminVoucherController;
use App\Http\Controllers\API\Admin\AdminFlashSaleController;
use App\Http\Controllers\API\Admin\AdminCollectionController;
use App\Http\Controllers\API\Admin\AdminInventoryController;
use App\Http\Controllers\API\Admin\AdminProfileController;
use App\Http\Controllers\API\Admin\ClientProductController;


use App\Http\Controllers\API\Client\ClientHomeController;
// Auth routes
Route::prefix('auth')->group(base_path('routes/api/auth.php'));

// Client routes  
Route::prefix('v1')->middleware('auth:sanctum')->group(base_path('routes/api/client.php'));

// Admin routes
Route::prefix('admin')->middleware(['auth:sanctum','role:admin'])->group(base_path('routes/api/admin.php'));

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

// --- FLASH SALE ROUTES (ĐÃ SỬA LỖI 405) ---
Route::get('/admin/flash-sales', [AdminFlashSaleController::class, 'index']); // <-- Sửa 'current' thành 'index'
Route::post('/admin/flash-sales', [AdminFlashSaleController::class, 'store']);
Route::delete('/admin/flash-sales/{ma_fs}', [AdminFlashSaleController::class, 'destroy']); // API Hủy toàn bộ chiến dịch
Route::get('/admin/flash-sales/{ma_fs}/items', [AdminFlashSaleController::class, 'getItems']);
Route::get('/admin/flash-sales/{ma_fs}/available-variants', [AdminFlashSaleController::class, 'getAvailableVariants']);
Route::post('/admin/flash-sales/{ma_fs}/items', [AdminFlashSaleController::class, 'addItem']);
Route::delete('/admin/flash-sales/{ma_fs}/items/{ma_bien_the}', [AdminFlashSaleController::class, 'removeItem']);

// --- QUẢN LÝ BỘ SƯU TẬP ---
Route::get('/admin/collections', [AdminCollectionController::class, 'index']);
Route::post('/admin/collections', [AdminCollectionController::class, 'store']);
Route::delete('/admin/collections/{id}', [AdminCollectionController::class, 'destroy']);

// Route cho Chi tiết Bộ sưu tập
Route::get('/admin/collections/{id}/items', [AdminCollectionController::class, 'getItems']);
Route::get('/admin/collections/{id}/available', [AdminCollectionController::class, 'getAvailableProducts']);
Route::post('/admin/collections/{id}/items', [AdminCollectionController::class, 'addItem']);
Route::delete('/admin/collections/{id}/items/{ma_sp}', [AdminCollectionController::class, 'removeItem']);
Route::post('/admin/collections/{id}', [AdminCollectionController::class, 'update']);

// --- QUẢN LÝ TỒN KHO ---
Route::get('/admin/inventory', [AdminInventoryController::class, 'index']);
Route::put('/admin/inventory/{ma_sp}/stock', [AdminInventoryController::class, 'updateStock']);

Route::get('/admin/profile', [AdminProfileController::class, 'getAdminInfo']);

Route::get('/client/category/{ma_dm}', [App\Http\Controllers\API\Client\ClientHomeController::class, 'getCategoryProducts']);
Route::get('/client/home-data', [ClientHomeController::class, 'getHomeData']);

Route::get('/client/product/{id}', [App\Http\Controllers\API\Client\ClientProductController::class, 'getProductDetail']);

Route::get('/client/category/{ma_dm}', [App\Http\Controllers\API\Client\ClientHomeController::class, 'getCategoryProducts']);

// Route cho trang Shop tổng (Tất cả sản phẩm) và Tìm kiếm
Route::get('/client/shop', [App\Http\Controllers\API\Client\ClientHomeController::class, 'getAllProducts']);