<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClientHomeController extends Controller
{
    public function getHomeData()
    {
        try {
            $now = Carbon::now('Asia/Ho_Chi_Minh'); 

            // 1. FLASH SALES
            $flashSales = DB::table('flash_sale')->where('thoi_gian_bat_dau', '<=', $now)->where('thoi_gian_ket_thuc', '>=', $now)->get();
            $flashSalesData = [];
            foreach ($flashSales as $fs) {
                $items = DB::table('chitiet_flashsale')
                    ->join('bienthe_sp', 'chitiet_flashsale.ma_bien_the', '=', 'bienthe_sp.ma_bien_the')
                    ->join('sanpham', 'bienthe_sp.ma_sp', '=', 'sanpham.ma_sp')
                    ->where('chitiet_flashsale.ma_fs', $fs->ma_fs)
                    ->select('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh', 'bienthe_sp.gia_ban as gia_goc', 'chitiet_flashsale.gia_flash as gia_giam',
                        DB::raw('IFNULL(ROUND((1 - (chitiet_flashsale.gia_flash / NULLIF(bienthe_sp.gia_ban, 0))) * 100), 0) as phan_tram_giam'))
                    ->get();
                if ($items->isNotEmpty()) {
                    $flashSalesData[] = ['ma_fs' => $fs->ma_fs, 'ten_chuong_trinh' => $fs->ten_chuong_trinh, 'endTime' => $fs->thoi_gian_ket_thuc, 'items' => $items];
                }
            }

            // 2. LẤY DANH MỤC KÈM ẢNH ĐẠI DIỆN
            $categories = DB::table('danhmuc')
                ->leftJoin('sanpham', 'danhmuc.ma_dm', '=', 'sanpham.ma_dm')
                ->select('danhmuc.ma_dm', 'danhmuc.ten_dm', DB::raw('MIN(sanpham.hinh_anh) as representative_image'))
                ->groupBy('danhmuc.ma_dm', 'danhmuc.ten_dm')
                ->get();

            return response()->json([
                'flashSales' => $flashSalesData,
                'categories' => $categories,
                'mensFashion' => $this->getProdsByDm('DM_NAM'),
                'womensFashion' => $this->getProdsByDm('DM_NU'),
                'newArrivals' => DB::table('sanpham')->join('bienthe_sp', 'sanpham.ma_sp', '=', 'bienthe_sp.ma_sp')->where('sanpham.trang_thai', 1)->select('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh', DB::raw('MIN(bienthe_sp.gia_ban) as price'))->groupBy('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh')->orderBy('sanpham.ma_sp', 'desc')->limit(12)->get()
            ], 200);
        } catch (\Exception $e) { return response()->json(['error' => $e->getMessage()], 500); }
    }

    public function getCategoryProducts($ma_dm)
    {
        return response()->json($this->getProdsByDm($ma_dm));
    }

    private function getProdsByDm($ma_dm) {
        return DB::table('sanpham')->join('bienthe_sp', 'sanpham.ma_sp', '=', 'bienthe_sp.ma_sp')->where('sanpham.ma_dm', $ma_dm)->where('sanpham.trang_thai', 1)->select('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh', DB::raw('MIN(bienthe_sp.gia_ban) as price'))->groupBy('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh')->limit(12)->get();
    }
}