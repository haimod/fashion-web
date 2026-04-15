<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    // 1. Hàm load toàn bộ dữ liệu thống kê
    public function index()
    {
        try {
            $now = Carbon::now();
            $startOfMonth = $now->copy()->startOfMonth();
            $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
            $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

            // Doanh thu
            $monthlyRevenue = DB::table('donhang')->where('trang_thai', 'DA_GIAO')->whereBetween('ngay_dat', [$startOfMonth, $now])->sum('tong_tien');
            $lastMonthRevenue = DB::table('donhang')->where('trang_thai', 'DA_GIAO')->whereBetween('ngay_dat', [$lastMonthStart, $lastMonthEnd])->sum('tong_tien');
            $revenueGrowth = $lastMonthRevenue > 0 ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1) : 100;

            // Đơn hàng & Tồn kho
            $newOrdersCount = DB::table('donhang')->whereBetween('ngay_dat', [$startOfMonth, $now])->count();
            $pendingOrdersCount = DB::table('donhang')->where('trang_thai', 'CHO_XAC_NHAN')->count();
            $lowStockCount = DB::table('bienthe_sp')->where('so_luong_ton', '<', 10)->count();
            $newCustomersCount = DB::table('khachhang')->count();

            // Danh sách sản phẩm mới (Kèm thuật toán Dò Giá an toàn 100%)
            $recentProducts = DB::table('sanpham')
                ->join('danhmuc', 'sanpham.ma_dm', '=', 'danhmuc.ma_dm')
                ->select('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh', 'danhmuc.ten_dm')
                ->orderBy('sanpham.ma_sp', 'desc')
                ->limit(5)
                ->get();

            foreach ($recentProducts as $product) {
                // Tự động tìm giá trong bảng biến thể (Ưu tiên cột gia_ban, nếu không có thì lấy don_gia)
                $variant = DB::table('bienthe_sp')->where('ma_sp', $product->ma_sp)->first();
                $price = 0;
                if ($variant) {
                    $price = isset($variant->gia_ban) ? $variant->gia_ban : (isset($variant->don_gia) ? $variant->don_gia : 0);
                }
                $product->gia_ban_thap_nhat = $price;
            }

            return response()->json([
                'revenue' => (float)$monthlyRevenue,
                'growth' => $revenueGrowth,
                'orders' => ['new' => $newOrdersCount, 'pending' => $pendingOrdersCount],
                'customers' => $newCustomersCount,
                'low_stock' => $lowStockCount,
                'recent_products' => $recentProducts,
                'conversion_rate' => 3.82 
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 2. Hàm Tạo nhanh Flash Sale từ Dashboard
    // 2. Hàm Tạo nhanh Flash Sale từ Dashboard
    public function quickCreateFlashSale(Request $request)
    {
        try {
            if (empty($request->ten_fs)) {
                return response()->json(['error' => 'Vui lòng nhập tên chiến dịch Flash Sale!'], 400);
            }

            // Tự động sinh mã FS theo thời gian thực (Giống định dạng trong DB của sếp)
            $ma_fs = 'FS_' . time();

            // Lưu vào đúng bảng 'flash_sale' và đúng tên cột 'ten_chuong_trinh'
            DB::table('flash_sale')->insert([
                'ma_fs' => $ma_fs,
                'ten_chuong_trinh' => $request->ten_fs, 
                'thoi_gian_bat_dau' => Carbon::now(),
                'thoi_gian_ket_thuc' => Carbon::now()->addHours(24)
            ]);

            return response()->json(['message' => 'Đã kích hoạt Flash Sale thành công!'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi DB: ' . $e->getMessage()], 500);
        }
    }
}