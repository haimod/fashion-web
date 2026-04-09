<?php
// API Routes - Laravel
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Admin\AdminProductController; 
use App\Http\Controllers\API\Admin\AdminCategoryController; 
use App\Http\Controllers\API\Admin\AdminCustomerController; 
use App\Http\Controllers\API\Admin\AdminVoucherController;
use App\Http\Controllers\API\Admin\AdminFlashSaleController;

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