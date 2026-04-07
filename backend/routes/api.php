<?php
// API Routes - Laravel
use Illuminate\Support\Facades\Route;

// Auth routes
Route::prefix('auth')->group(base_path('routes/api/auth.php'));

// Client routes  
Route::prefix('v1')->middleware('auth:sanctum')->group(base_path('routes/api/client.php'));

// Admin routes
Route::prefix('admin')->middleware(['auth:sanctum','role:admin'])->group(base_path('routes/api/admin.php'));