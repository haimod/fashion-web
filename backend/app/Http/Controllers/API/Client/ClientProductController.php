<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClientProductController extends Controller
{
    public function getProductDetail($id)
    {
        try {
            // 1. THÔNG TIN CƠ BẢN CỦA SẢN PHẨM
            $product = DB::table('sanpham')
                ->leftJoin('danhmuc', 'sanpham.ma_dm', '=', 'danhmuc.ma_dm')
                ->where('sanpham.ma_sp', $id)
                ->where('sanpham.trang_thai', 1)
                ->select('sanpham.ma_sp', 'sanpham.ma_dm', 'sanpham.ten_sp', 'sanpham.hinh_anh', 'sanpham.mo_ta', 'danhmuc.ten_dm')
                ->first();

            if (!$product) {
                return response()->json(['error' => 'Sản phẩm không tồn tại'], 404);
            }

            // Khởi tạo các mảng rỗng để tránh lỗi Frontend
            $product->gia_ban_thap_nhat = 0;
            $product->colors = [];
            $product->sizes = [];
            $product->gallery = []; 
            $product->reviews = [];
            $product->review_count = 0;
            $product->rating = 0;
            $product->related_products = [];
            $product->debug_errors = [];

            // 2. LẤY BIẾN THỂ & GIÁ GỐC THẤP NHẤT
            try {
                $variants = DB::table('bienthe_sp')->where('ma_sp', $id)->get();
                $product->gia_ban_thap_nhat = $variants->min('gia_ban') ?? 0;
                $product->variants = $variants; 
            } catch (\Exception $e) { $product->debug_errors['gia'] = $e->getMessage(); }

            // 3. LẤY DANH SÁCH MÀU SẮC
            try {
                $product->colors = DB::table('bienthe_sp')
                    ->where('ma_sp', $id)
                    ->whereNotNull('mau_sac')
                    ->select('mau_sac as ten_mau')
                    ->distinct()
                    ->get();
            } catch (\Exception $e) { $product->debug_errors['mau_sac'] = $e->getMessage(); }

            // 4. LẤY DANH SÁCH KÍCH THƯỚC VÀ SỐ LƯỢNG TỒN
            try {
                $product->sizes = DB::table('bienthe_sp')
                    ->where('ma_sp', $id)
                    ->whereNotNull('kich_thuoc')
                    ->where('kich_thuoc', '!=', '')
                    ->select('kich_thuoc as ten_size', DB::raw('SUM(so_luong_ton) as so_luong_ton'))
                    ->groupBy('kich_thuoc')
                    ->get();
            } catch (\Exception $e) { 
                $product->debug_errors['kich_thuoc'] = $e->getMessage(); 
            }

            // 5. LẤY ẢNH GALLERY
            try {
                $product->gallery = DB::table('hinhanh_sp')->where('ma_sp', $id)->select('duong_dan')->get();
            } catch (\Exception $e) {}

            // 6. LẤY ĐÁNH GIÁ
            try {
                $reviews = DB::table('danhgia_sp')
                    ->leftJoin('users', 'danhgia_sp.ma_kh', '=', 'users.id') 
                    ->where('danhgia_sp.ma_sp', $id)
                    ->select('danhgia_sp.id', 'danhgia_sp.so_sao', 'danhgia_sp.noi_dung', 'danhgia_sp.created_at', DB::raw('IFNULL(users.name, "Khách hàng") as ten_khach_hang'))
                    ->orderBy('danhgia_sp.created_at', 'desc')
                    ->get();
                
                $product->reviews = $reviews;
                $product->review_count = $reviews->count();
                $product->rating = $reviews->count() > 0 ? round($reviews->avg('so_sao'), 1) : 0;
            } catch (\Exception $e) {
                try {
                    $reviews = DB::table('danhgia_sp')->where('ma_sp', $id)->get();
                    $product->reviews = $reviews;
                    $product->review_count = $reviews->count();
                    $product->rating = $reviews->count() > 0 ? round($reviews->avg('so_sao'), 1) : 0;
                } catch (\Exception $e2) {}
            }

            // 7. LẤY GIÁ FLASH SALE CHO SẢN PHẨM CHÍNH (ĐÃ XÓA TRẠNG THÁI)
            $now = Carbon::now('Asia/Ho_Chi_Minh');
            try {
                $flashSale = DB::table('chitiet_flashsale')
                    ->join('flash_sale', 'chitiet_flashsale.ma_fs', '=', 'flash_sale.ma_fs')
                    ->join('bienthe_sp', 'chitiet_flashsale.ma_bien_the', '=', 'bienthe_sp.ma_bien_the')
                    ->where('bienthe_sp.ma_sp', $id)
                    ->where('flash_sale.thoi_gian_bat_dau', '<=', $now)
                    ->where('flash_sale.thoi_gian_ket_thuc', '>=', $now)
                    // ĐÃ XÓA DÒNG GÂY LỖI: ->where('flash_sale.trang_thai', 1)
                    ->select('chitiet_flashsale.gia_flash', 'flash_sale.thoi_gian_ket_thuc as endTime')
                    ->orderBy('chitiet_flashsale.gia_flash', 'asc')
                    ->first();

                if ($flashSale) {
                    $product->gia_flash = $flashSale->gia_flash;
                    $product->gia_goc = $product->gia_ban_thap_nhat;
                    $product->flash_end_time = $flashSale->endTime;
                }
            } catch (\Exception $e) {}


            // 8. SẢN PHẨM CÙNG DANH MỤC & CHECK GIÁ SALE (ĐÃ XÓA TRẠNG THÁI)
            try {
                $related = DB::table('sanpham')
                    ->join('bienthe_sp', 'sanpham.ma_sp', '=', 'bienthe_sp.ma_sp')
                    ->where('sanpham.ma_dm', $product->ma_dm) 
                    ->where('sanpham.ma_sp', '!=', $id)       
                    ->where('sanpham.trang_thai', 1)
                    ->select('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh', DB::raw('MIN(bienthe_sp.gia_ban) as price'))
                    ->groupBy('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh')
                    ->limit(4)
                    ->get();
                
                if ($related->isEmpty()) {
                    $related = DB::table('sanpham')
                        ->join('bienthe_sp', 'sanpham.ma_sp', '=', 'bienthe_sp.ma_sp')
                        ->where('sanpham.ma_sp', '!=', $id)
                        ->where('sanpham.trang_thai', 1)
                        ->select('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh', DB::raw('MIN(bienthe_sp.gia_ban) as price'))
                        ->groupBy('sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.hinh_anh')
                        ->orderBy('sanpham.ma_sp', 'desc') 
                        ->limit(4)
                        ->get();
                }

                foreach ($related as $rel_prod) {
                    $flashSalePrice = DB::table('chitiet_flashsale')
                        ->join('flash_sale', 'chitiet_flashsale.ma_fs', '=', 'flash_sale.ma_fs')
                        ->join('bienthe_sp', 'chitiet_flashsale.ma_bien_the', '=', 'bienthe_sp.ma_bien_the')
                        ->where('bienthe_sp.ma_sp', $rel_prod->ma_sp)
                        ->where('flash_sale.thoi_gian_bat_dau', '<=', $now)
                        ->where('flash_sale.thoi_gian_ket_thuc', '>=', $now)
                        // ĐÃ XÓA DÒNG GÂY LỖI: ->where('flash_sale.trang_thai', 1)
                        ->min('chitiet_flashsale.gia_flash');

                    $rel_prod->gia_flash = $flashSalePrice ? $flashSalePrice : null;
                }
                
                $product->related_products = $related;
            } catch (\Exception $e) { $product->debug_errors['related'] = $e->getMessage(); }

            return response()->json($product, 200);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi Core: ' . $e->getMessage()], 500);
        }
    }
}