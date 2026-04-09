<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminInventoryController extends Controller
{
    // 1. Lấy toàn bộ dữ liệu Tồn Kho và Thống kê
    public function index()
    {
        $products = DB::table('sanpham')
            ->join('danhmuc', 'sanpham.ma_dm', '=', 'danhmuc.ma_dm')
            ->select('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh', 'danhmuc.ten_dm')
            // ĐÃ SỬA LỖI 500: Chuyển sang sắp xếp theo mã SP thay vì created_at
            ->orderBy('sanpham.ma_sp', 'desc')
            ->get();

        $totalValue = 0;
        $outOfStock = 0;
        $lowStock = 0;

        foreach ($products as $prod) {
            // Lấy các biến thể của sản phẩm
            $variants = DB::table('bienthe_sp')->where('ma_sp', $prod->ma_sp)->get();
            
            $totalStock = 0;
            foreach ($variants as $v) {
                $totalStock += $v->so_luong_ton;
                $totalValue += ($v->so_luong_ton * $v->gia_ban); // Tính giá trị tồn kho
            }

            $prod->variants = $variants;
            $prod->total_stock = $totalStock;
            
            // Phân loại trạng thái
            if ($totalStock == 0) {
                $prod->status = 'out_of_stock';
                $outOfStock++;
            } elseif ($totalStock < 15) { // Dưới 15 cái là báo Sắp hết hàng
                $prod->status = 'low_stock';
                $lowStock++;
            } else {
                $prod->status = 'in_stock';
            }
        }

        return response()->json([
            'items' => $products,
            'stats' => [
                'total_items' => count($products),
                'out_of_stock' => $outOfStock,
                'low_stock' => $lowStock,
                'total_value' => $totalValue
            ]
        ], 200);
    }

    // 2. Cập nhật nhanh số lượng tồn kho (Quick Update)
    public function updateStock(Request $request, $ma_sp)
    {
        $variants = $request->variants; // Nhận mảng các biến thể [{ma_bien_the, so_luong_ton}]
        
        foreach ($variants as $v) {
            DB::table('bienthe_sp')
                ->where('ma_bien_the', $v['ma_bien_the'])
                ->update(['so_luong_ton' => $v['so_luong_ton']]);
        }

        return response()->json(['message' => 'Cập nhật kho hàng thành công!'], 200);
    }
}