<?php
// API Routes - Laravel
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Admin\AdminProductController; // <--- THÊM DÒNG NÀY VÀO ĐÂY
// Auth routes
Route::prefix('auth')->group(base_path('routes/api/auth.php'));

// Client routes  
Route::prefix('v1')->middleware('auth:sanctum')->group(base_path('routes/api/client.php'));

// Admin routes
Route::prefix('admin')->middleware(['auth:sanctum','role:admin'])->group(base_path('routes/api/admin.php'));
Route::get('/admin/products', [AdminProductController::class, 'index']);
Route::post('/admin/products', [AdminProductController::class, 'store']);
Route::delete('/admin/products/{id}', [AdminProductController::class, 'destroy']); // <--- THÊM DÒNG NÀY
Route::get('/admin/products/{id}', [AdminProductController::class, 'show']);
Route::post('/admin/products/{id}', [AdminProductController::class, 'update']);