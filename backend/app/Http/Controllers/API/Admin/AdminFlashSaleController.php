<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminFlashSaleController extends Controller
{
    // 1. Lấy chương trình Flash Sale mới nhất đang chạy
  // Đổi từ current() thành index()
    public function index()
    {
        $flashSales = DB::table('flash_sale')->orderBy('thoi_gian_ket_thuc', 'desc')->get();
        return response()->json($flashSales, 200);
    }

    // 2. Kích hoạt Flash Sale mới
    public function store(Request $request)
    {
        $request->validate([
            'ten_chuong_trinh' => 'required|string|max:200',
            'thoi_gian_bat_dau' => 'required|date',
            'thoi_gian_ket_thuc' => 'required|date|after:thoi_gian_bat_dau',
        ]);

        $ma_fs = 'FS_' . time(); // Tạo mã ID tự động

        DB::table('flash_sale')->insert([
            'ma_fs' => $ma_fs,
            'ten_chuong_trinh' => $request->ten_chuong_trinh,
            'thoi_gian_bat_dau' => $request->thoi_gian_bat_dau,
            'thoi_gian_ket_thuc' => $request->thoi_gian_ket_thuc
        ]);

        return response()->json(['message' => 'Kích hoạt Flash Sale thành công!'], 201);
    }

    // 3. Lấy danh sách sản phẩm ĐÃ CÓ trong Flash Sale này
    public function getItems($ma_fs)
    {
        $items = DB::table('chitiet_flashsale')
            ->join('bienthe_sp', 'chitiet_flashsale.ma_bien_the', '=', 'bienthe_sp.ma_bien_the')
            ->join('sanpham', 'bienthe_sp.ma_sp', '=', 'sanpham.ma_sp')
            ->where('chitiet_flashsale.ma_fs', $ma_fs)
            ->select('chitiet_flashsale.*', 'bienthe_sp.kich_thuoc', 'bienthe_sp.mau_sac', 'bienthe_sp.gia_ban', 'bienthe_sp.so_luong_ton', 'sanpham.ten_sp', 'sanpham.hinh_anh')
            ->get();
            
        return response()->json($items);
    }

    // 4. Lấy danh sách biến thể CHƯA ĐƯỢC THÊM vào Flash Sale (để hiện trong Popup)
    public function getAvailableVariants($ma_fs)
    {
        $existing = DB::table('chitiet_flashsale')->where('ma_fs', $ma_fs)->pluck('ma_bien_the');
        
        $variants = DB::table('bienthe_sp')
            ->join('sanpham', 'bienthe_sp.ma_sp', '=', 'sanpham.ma_sp')
            ->whereNotIn('bienthe_sp.ma_bien_the', $existing)
            ->select('bienthe_sp.*', 'sanpham.ten_sp', 'sanpham.hinh_anh')
            ->get();
            
        return response()->json($variants);
    }

    // 5. Thêm 1 sản phẩm (biến thể) vào Flash Sale
    public function addItem(Request $request, $ma_fs)
    {
        $request->validate([
            'ma_bien_the' => 'required|string',
            'gia_flash' => 'required|numeric|min:0'
        ]);

        DB::table('chitiet_flashsale')->insert([
            'ma_fs' => $ma_fs,
            'ma_bien_the' => $request->ma_bien_the,
            'gia_flash' => $request->gia_flash
        ]);

        return response()->json(['message' => 'Đã thêm sản phẩm!'], 201);
    }

    // 6. Xóa 1 sản phẩm khỏi Flash Sale
    public function removeItem($ma_fs, $ma_bien_the)
    {
        DB::table('chitiet_flashsale')
            ->where('ma_fs', $ma_fs)
            ->where('ma_bien_the', $ma_bien_the)
            ->delete();
            
        return response()->json(['message' => 'Đã xóa sản phẩm khỏi Flash Sale!']);
    }

    // 7. Hủy khẩn cấp chương trình Flash Sale
    public function destroy($ma_fs)
    {
        // Phải xóa các sản phẩm bên trong chi tiết trước để tránh lỗi khóa ngoại (Foreign Key)
        DB::table('chitiet_flashsale')->where('ma_fs', $ma_fs)->delete();
        
        // Xóa vỏ chương trình Flash Sale
        DB::table('flash_sale')->where('ma_fs', $ma_fs)->delete();
        
        return response()->json(['message' => 'Đã hủy chương trình Flash Sale thành công!']);
    }
}