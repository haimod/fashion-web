<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ClientHomeController extends Controller
{
    /**
     * CỖ MÁY QUÉT GIÁ (Đã tối ưu Sắp xếp)
     */
    private function getProductsWithPrices($query, $sort = null)
    {
        $now = Carbon::now('Asia/Ho_Chi_Minh');

        // Bước 1: Query gốc
        $productsQuery = $query->join('bienthe_sp', 'sanpham.ma_sp', '=', 'bienthe_sp.ma_sp')
            ->select(
                'sanpham.ma_sp', 
                'sanpham.ten_sp', 
                'sanpham.hinh_anh', 
                DB::raw('MIN(bienthe_sp.gia_ban) as price')
            )
            ->groupBy('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh');

        // Bước 2: Logic sắp xếp
        if ($sort === 'price_asc') $productsQuery->orderBy('price', 'asc');
        elseif ($sort === 'price_desc') $productsQuery->orderBy('price', 'desc');
        else $productsQuery->orderBy('sanpham.ma_sp', 'desc');

        // Bước 3: Lấy dữ liệu (Sếp có thể đổi thành ->paginate(12) nếu muốn phân trang)
        $products = $productsQuery->get();

        // Bước 4: Gắn giá Flash Sale
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
     * API TRANG CHỦ (Giữ nguyên hoặc cập nhật mới nhất)
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
                'mensFashion' => $this->getProductsWithPrices(DB::table('sanpham')->where('trang_thai', 1)->where('ma_dm', 'DM_NAM')->limit(12)),
                'womensFashion' => $this->getProductsWithPrices(DB::table('sanpham')->where('trang_thai', 1)->where('ma_dm', 'DM_NU')->limit(12)),
                'newArrivals' => $this->getProductsWithPrices(DB::table('sanpham')->where('trang_thai', 1)->limit(12))
            ], 200);
        } catch (\Exception $e) { return response()->json(['error' => $e->getMessage()], 500); }
    }

    /**
     * 🔍 API TỔNG CHO TRANG SHOP & TÌM KIẾM (MỚI)
     * Dùng cho đường dẫn /api/client/shop?search=...
     */
    public function getAllProducts(Request $request)
    {
        try {
            $query = DB::table('sanpham')->where('sanpham.trang_thai', 1);
            return $this->applyFiltersAndResponse($query, $request);
        } catch (\Exception $e) { return response()->json(['error' => $e->getMessage()], 500); }
    }

    /**
     * API DANH MỤC (NAM/NỮ)
     */
    public function getCategoryProducts(Request $request, $ma_dm)
    {
        try {
            $query = DB::table('sanpham')->where('sanpham.ma_dm', $ma_dm)->where('sanpham.trang_thai', 1);
            return $this->applyFiltersAndResponse($query, $request);
        } catch (\Exception $e) { return response()->json(['error' => $e->getMessage()], 500); }
    }

    /**
     * HÀM DÙNG CHUNG ĐỂ LỌC (Tránh viết đi viết lại)
     */
    private function applyFiltersAndResponse($query, $request)
    {
        // 1. Tìm kiếm theo tên (Dành cho thanh Search trên Header)
        if ($request->has('search')) {
            $query->where('ten_sp', 'LIKE', '%' . $request->search . '%');
        }

        // 2. Lọc theo Loại (Áo sơ mi, Quần Cargo...)
        if ($request->has('type')) {
            $query->where('ten_sp', 'LIKE', '%' . $request->type . '%');
        }

        // 3. Lọc Giá
        if ($request->has('price_max')) {
            $query->whereExists(function ($q) use ($request) {
                $q->select(DB::raw(1))->from('bienthe_sp')->whereRaw('bienthe_sp.ma_sp = sanpham.ma_sp')->where('gia_ban', '<=', $request->price_max);
            });
        }

        // 4. Lọc Size
        if ($request->has('size')) {
            $query->whereExists(function ($q) use ($request) {
                $q->select(DB::raw(1))->from('bienthe_sp')->whereRaw('bienthe_sp.ma_sp = sanpham.ma_sp')->where('kich_thuoc', $request->size);
            });
        }

        $products = $this->getProductsWithPrices($query, $request->sort);
        return response()->json($products, 200);
    }
}