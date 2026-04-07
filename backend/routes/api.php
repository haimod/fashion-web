<?php
// API Routes - Laravel
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Auth\AuthController;

// Auth routes
Route::prefix('auth')->group(base_path('routes/api/auth.php'));

// Client routes  
Route::prefix('v1')->middleware('auth:sanctum')->group(base_path('routes/api/client.php'));

// Admin routes
Route::prefix('admin')->middleware(['auth:sanctum','role:admin'])->group(base_path('routes/api/admin.php'));

// URL thực tế sẽ là: POST http://localhost:8000/api/auth/login
Route::post('/login', [AuthController::class, 'login']);

Route::post('/register', [AuthController::class, 'register']); // Thêm dòng này