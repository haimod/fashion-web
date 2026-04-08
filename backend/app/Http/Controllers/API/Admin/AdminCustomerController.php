<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash; 

class AdminCustomerController extends Controller
{
    // 1. Lấy danh sách khách hàng
    public function index()
    {
        $customers = DB::table('khachhang')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($customers, 200);
    }

    // 2. Thêm khách hàng mới
    public function store(Request $request)
    {
        $request->validate([
            'ma_kh' => 'required|string|max:20|unique:khachhang,ma_kh',
            'tenkh' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:khachhang,email',
            'sodt' => 'required|string|max:15',
            'matkhau' => 'required|string|min:6', 
            'role' => 'nullable|string|max:50'
        ]);

        DB::table('khachhang')->insert([
            'ma_kh' => strtoupper($request->ma_kh),
            'tenkh' => $request->tenkh,
            'email' => $request->email,
            'sodt' => $request->sodt,
            'matkhau' => Hash::make($request->matkhau), // Mã hóa pass
            'role' => $request->role ?? 'customer', 
            'trang_thai' => 1,
            'created_at' => now()
        ]);

        return response()->json(['message' => 'Thêm khách hàng thành công!'], 201);
    }

    // 3. Cập nhật thông tin (Chỉ cho sửa Tên và SĐT)
    public function update(Request $request, $id)
    {
        $request->validate([
            'tenkh' => 'required|string|max:100',
            'sodt' => 'required|string|max:15'
        ]);

        DB::table('khachhang')->where('ma_kh', $id)->update([
            'tenkh' => $request->tenkh,
            'sodt' => $request->sodt
        ]);

        return response()->json(['message' => 'Cập nhật thành công!'], 200);
    }

    // 4. Khóa / Mở khóa tài khoản
    public function toggleStatus($id)
    {
        $customer = DB::table('khachhang')->where('ma_kh', $id)->first();
        
        if (!$customer) {
            return response()->json(['message' => 'Không tìm thấy khách hàng'], 404);
        }

        $newStatus = $customer->trang_thai == 1 ? 0 : 1;

        DB::table('khachhang')->where('ma_kh', $id)->update(['trang_thai' => $newStatus]);

        $message = $newStatus == 1 ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản khách hàng!';
        return response()->json(['message' => $message], 200);
    }
}