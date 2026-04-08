<?php

namespace App\Http\Controllers\API\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class AdminCategoryController extends Controller
{
    // 1. Lấy danh sách
    public function index()
    {
        // Lấy danh mục kèm theo số lượng sản phẩm đang có trong mỗi danh mục
        $categories = DB::table('danhmuc')
            ->leftJoin('sanpham', 'danhmuc.ma_dm', '=', 'sanpham.ma_dm')
            ->select('danhmuc.ma_dm as id', 'danhmuc.ten_dm as name', DB::raw('COUNT(sanpham.ma_sp) as product_count'))
            ->groupBy('danhmuc.ma_dm', 'danhmuc.ten_dm')
            ->get();
            
        return response()->json($categories, 200);
    }

    // 2. Thêm mới
    public function store(Request $request)
    {
        $request->validate([
            'ma_dm' => 'required|string|unique:danhmuc,ma_dm',
            'ten_dm' => 'required|string|max:200'
        ]);

        DB::table('danhmuc')->insert([
            'ma_dm' => strtoupper($request->ma_dm), // Ép viết hoa mã
            'ten_dm' => $request->ten_dm
        ]);

        return response()->json(['message' => 'Thêm danh mục thành công!'], 201);
    }

    // 3. Cập nhật (Sửa tên)
    public function update(Request $request, $id)
    {
        $request->validate(['ten_dm' => 'required|string|max:200']);

        DB::table('danhmuc')->where('ma_dm', $id)->update([
            'ten_dm' => $request->ten_dm
        ]);

        return response()->json(['message' => 'Cập nhật thành công!'], 200);
    }

    // 4. Xóa
    public function destroy($id)
    {
        // Kiểm tra xem có sản phẩm nào đang dùng danh mục này không
        $hasProducts = DB::table('sanpham')->where('ma_dm', $id)->exists();
        if ($hasProducts) {
            return response()->json(['message' => 'Không thể xóa! Danh mục này đang chứa sản phẩm.'], 400);
        }

        DB::table('danhmuc')->where('ma_dm', $id)->delete();
        return response()->json(['message' => 'Xóa danh mục thành công!'], 200);
    }
}