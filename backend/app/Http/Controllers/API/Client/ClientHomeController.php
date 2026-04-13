<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClientHomeController extends Controller
{
    private function getProductsWithPrices($query)
    {
        $now = Carbon::now('Asia/Ho_Chi_Minh');

        $products = $query->join('bienthe_sp', 'sanpham.ma_sp', '=', 'bienthe_sp.ma_sp')
            ->select('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh', DB::raw('MIN(bienthe_sp.gia_ban) as price'))
            ->groupBy('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh')
            ->get();

        foreach ($products as $product) {
            $flashSalePrice = DB::table('chitiet_flashsale')
                ->join('flash_sale', 'chitiet_flashsale.ma_fs', '=', 'flash_sale.ma_fs')
                ->join('bienthe_sp', 'chitiet_flashsale.ma_bien_the', '=', 'bienthe_sp.ma_bien_the')
                ->where('bienthe_sp.ma_sp', $product->ma_sp)
                ->where('flash_sale.thoi_gian_bat_dau', '<=', $now)
                ->where('flash_sale.thoi_gian_ket_thuc', '>=', $now)
                // ĐÃ XÓA ĐIỀU KIỆN TRẠNG THÁI GÂY LỖI
                ->min('chitiet_flashsale.gia_flash');

            $product->gia_flash = $flashSalePrice ? $flashSalePrice : null;
        }

        return $products;
    }

    public function getHomeData()
    {
        try {
            $now = Carbon::now('Asia/Ho_Chi_Minh'); 

            // 1. LẤY FLASH SALES (ĐÃ XÓA ĐIỀU KIỆN TRẠNG THÁI GÂY LỖI)
            $flashSales = DB::table('flash_sale')
                ->where('thoi_gian_bat_dau', '<=', $now)
                ->where('thoi_gian_ket_thuc', '>=', $now)
                ->get();
                
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

            // 2. LẤY DANH MỤC
            $categories = DB::table('danhmuc')
                ->leftJoin('sanpham', 'danhmuc.ma_dm', '=', 'sanpham.ma_dm')
                ->select('danhmuc.ma_dm', 'danhmuc.ten_dm', DB::raw('MIN(sanpham.hinh_anh) as representative_image'))
                ->groupBy('danhmuc.ma_dm', 'danhmuc.ten_dm')
                ->get();

            $queryNam = DB::table('sanpham')->where('sanpham.trang_thai', 1)->where('sanpham.ma_dm', 'DM_NAM')->limit(12);
            $queryNu  = DB::table('sanpham')->where('sanpham.trang_thai', 1)->where('sanpham.ma_dm', 'DM_NU')->limit(12);
            $queryMoi = DB::table('sanpham')->where('sanpham.trang_thai', 1)->orderBy('sanpham.ma_sp', 'desc')->limit(12);

            return response()->json([
                'flashSales' => $flashSalesData,
                'categories' => $categories,
                'mensFashion' => $this->getProductsWithPrices($queryNam), 
                'womensFashion' => $this->getProductsWithPrices($queryNu), 
                'newArrivals' => $this->getProductsWithPrices($queryMoi)   
            ], 200);

        } catch (\Exception $e) { 
            return response()->json(['error' => $e->getMessage()], 500); 
        }
    }

    public function getCategoryProducts($ma_dm)
    {
        $query = DB::table('sanpham')->where('sanpham.trang_thai', 1)->where('sanpham.ma_dm', $ma_dm)->limit(12);
        return response()->json($this->getProductsWithPrices($query));
    }
}