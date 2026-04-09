<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class AdminProfileController extends Controller
{
    public function getAdminInfo()
    {
        try {
            // Lấy tài khoản đầu tiên trong bảng (vì bạn nói DB chỉ có 1 tài khoản Admin)
            // LƯU Ý: Nếu bảng của bạn tên là 'users' hoặc 'tai_khoan', hãy sửa chữ 'khachhang' lại nhé.
            $admin = DB::table('khachhang')->first();

            if ($admin) {
                return response()->json([
                    // Nếu cột tên của bạn là 'name' hoặc 'ho_ten', hãy sửa chữ 'ten_kh' lại nhé
                    'fullName' => $admin->ten_kh ?? $admin->name ?? 'Admin', 
                    'email' => $admin->email,
                ], 200);
            }

            return response()->json(['message' => 'Không tìm thấy tài khoản admin'], 404);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi SQL: ' . $e->getMessage()], 500);
        }
    }
}