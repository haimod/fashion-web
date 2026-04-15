<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ClientHomeController extends Controller
{
    /**
     * CỖ MÁY QUÉT GIÁ DÙNG CHUNG
     */
    private function getProductsWithPrices($query, $sort = null)
    {
        $now = Carbon::now('Asia/Ho_Chi_Minh');

        $productsQuery = $query->join('bienthe_sp', 'sanpham.ma_sp', '=', 'bienthe_sp.ma_sp')
            ->select('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh', DB::raw('MIN(bienthe_sp.gia_ban) as price'))
            ->groupBy('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh');

        if ($sort === 'price_asc') $productsQuery->orderBy('price', 'asc');
        elseif ($sort === 'price_desc') $productsQuery->orderBy('price', 'desc');
        else $productsQuery->orderBy('sanpham.ma_sp', 'desc');

        $products = $productsQuery->get();

        foreach ($products as $product) {
            $flashSalePrice = DB::table('chitiet_flashsale')
                ->join('flash_sale', 'chitiet_flashsale.ma_fs', '=', 'flash_sale.ma_fs')
                ->join('bienthe_sp', 'chitiet_flashsale.ma_bien_the', '=', 'bienthe_sp.ma_bien_the')
                ->where('bienthe_sp.ma_sp', $product->ma_sp)
                ->where('flash_sale.thoi_gian_bat_dau', '<=', $now)
                ->where('flash_sale.thoi_gian_ket_thuc', '>=', $now)
                ->min('chitiet_flashsale.gia_flash');

            $product->gia_flash = $flashSalePrice ?: null;
        }

        return $products;
    }

    /**
     * API TRANG CHỦ 
     */
    public function getHomeData()
    {
        try {
            $now = Carbon::now('Asia/Ho_Chi_Minh'); 
            
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

            $categories = DB::table('danhmuc')->leftJoin('sanpham', 'danhmuc.ma_dm', '=', 'sanpham.ma_dm')->select('danhmuc.ma_dm', 'danhmuc.ten_dm', DB::raw('MIN(sanpham.hinh_anh) as representative_image'))->groupBy('danhmuc.ma_dm', 'danhmuc.ten_dm')->get();
            
            return response()->json([
                'flashSales' => $flashSalesData,
                'categories' => $categories,
                'mensFashion' => $this->getProductsWithPrices(DB::table('sanpham')->where('trang_thai', 1)->where('ma_dm', 'LIKE', 'NAM_%')->limit(12)),
                'womensFashion' => $this->getProductsWithPrices(DB::table('sanpham')->where('trang_thai', 1)->where('ma_dm', 'LIKE', 'NU_%')->limit(12)),
                'newArrivals' => $this->getProductsWithPrices(DB::table('sanpham')->where('trang_thai', 1)->limit(12))
            ], 200);
            
        } catch (\Exception $e) { 
            return response()->json(['error' => $e->getMessage()], 500); 
        }
    }

    /**
     * API TRANG SHOP & TÌM KIẾM
     */
    public function getAllProducts(Request $request)
    {
        try {
            $query = DB::table('sanpham')->where('sanpham.trang_thai', 1);
            return $this->applyFiltersAndResponse($query, $request);
        } catch (\Exception $e) { return response()->json(['error' => $e->getMessage()], 500); }
    }

    /**
     * API DANH MỤC LỌC ĐỒ
     */
    public function getCategoryProducts(Request $request, $prefix)
    {
        try {
            $query = DB::table('sanpham')->where('sanpham.trang_thai', 1);

            if ($request->has('sub_category') && $request->sub_category !== '') {
                $query->where('sanpham.ma_dm', $request->sub_category);
            } else {
                $query->where('sanpham.ma_dm', 'LIKE', $prefix . '\_%');
            }

            return $this->applyFiltersAndResponse($query, $request);
        } catch (\Exception $e) { return response()->json(['error' => 'Lỗi lọc sản phẩm: ' . $e->getMessage()], 500); }
    }

    private function applyFiltersAndResponse($query, $request)
    {
        if ($request->has('search')) $query->where('ten_sp', 'LIKE', '%' . $request->search . '%');
        if ($request->has('type')) $query->where('ten_sp', 'LIKE', '%' . $request->type . '%');
        if ($request->has('price_max')) {
            $query->whereExists(function ($q) use ($request) {
                $q->select(DB::raw(1))->from('bienthe_sp')->whereRaw('bienthe_sp.ma_sp = sanpham.ma_sp')->where('gia_ban', '<=', $request->price_max);
            });
        }
        if ($request->has('size')) {
            $query->whereExists(function ($q) use ($request) {
                $q->select(DB::raw(1))->from('bienthe_sp')->whereRaw('bienthe_sp.ma_sp = sanpham.ma_sp')->where('kich_thuoc', $request->size);
            });
        }

        $products = $this->getProductsWithPrices($query, $request->sort);
        return response()->json($products, 200);
    }

    // =======================================================
    // 🚨 CÁC HÀM XỬ LÝ BỘ SƯU TẬP (MỚI THÊM VÀO ĐÂY) 🚨
    // =======================================================

    /**
     * 1. LẤY DANH SÁCH TẤT CẢ BỘ SƯU TẬP
     */
    public function getCollections()
    {
        try {
            // Lấy tất cả Bộ sưu tập từ database (không kiểm tra trạng thái để chống lỗi)
            $collections = DB::table('bosuutap')->get();

            return response()->json($collections, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi tải danh sách bộ sưu tập: ' . $e->getMessage()], 500);
        }
    }

    /**
     * 2. LẤY CHI TIẾT 1 BỘ SƯU TẬP + SẢN PHẨM BÊN TRONG (KHI CLICK BANNER)
     */
   /**
     * LẤY CHI TIẾT 1 BỘ SƯU TẬP + CÁC SẢN PHẨM TRONG ĐÓ
     */
    public function getCollectionDetail($id)
    {
        try {
            // Lấy thông tin cái banner Bộ sưu tập
            $collection = DB::table('bosuutap')->where('ma_bst', $id)->first();
            
            if (!$collection) {
                return response()->json(['error' => 'Không tìm thấy bộ sưu tập'], 404);
            }

            // 🚨 ĐÃ SỬA LẠI THÀNH BẢNG chitiet_bst CHUẨN THEO DATABASE CỦA SẾP 🚨
            $query = DB::table('sanpham')
                ->join('chitiet_bst', 'sanpham.ma_sp', '=', 'chitiet_bst.ma_sp')
                ->where('chitiet_bst.ma_bst', $id)
                ->where('sanpham.trang_thai', 1);

            // Dùng cỗ máy quét giá để lấy giá Flash Sale nếu có
            $products = $this->getProductsWithPrices($query);

            return response()->json([
                'collection' => $collection,
                'products' => $products
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi tải chi tiết BST: ' . $e->getMessage()], 500);
        }
    }

    /**
     * API LẤY DANH SÁCH VOUCHER CHO TRANG SALE
     */
    public function getVouchers()
    {
        try {
            $now = Carbon::now('Asia/Ho_Chi_Minh');
            $vouchers = DB::table('voucher')
                ->where('ngay_bat_dau', '<=', $now)
                ->where('ngay_het_han', '>=', $now)
                ->whereRaw('so_lan_da_dung < so_lan_su_dung_toi_da') // Chỉ lấy mã chưa hết lượt
                ->get();
            return response()->json($vouchers, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi tải voucher: ' . $e->getMessage()], 500);
        }
    }
}