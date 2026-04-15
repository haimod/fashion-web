<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientCartController extends Controller
{
    /**
     * Lấy danh sách sản phẩm trong giỏ hàng
     */
    public function getCart(Request $request)
    {
        try {
            $user = $request->user();
            $cart = DB::table('giohang')->where('ma_kh', $user->ma_kh)->first();
            
            if (!$cart) {
                return response()->json([], 200); 
            }

            // Đã đổi chitiet_gh thành chitiet_giohang
            $items = DB::table('chitiet_giohang')
                ->join('bienthe_sp', 'chitiet_giohang.ma_bien_the', '=', 'bienthe_sp.ma_bien_the')
                ->join('sanpham', 'bienthe_sp.ma_sp', '=', 'sanpham.ma_sp')
                ->where('chitiet_giohang.ma_gh', $cart->ma_gh)
                ->select(
                    'chitiet_giohang.ma_bien_the', 
                    'chitiet_giohang.so_luong', 
                    'bienthe_sp.gia_ban', 
                    'bienthe_sp.kich_thuoc', 
                    'bienthe_sp.mau_sac', 
                    'sanpham.ten_sp', 
                    'sanpham.hinh_anh'
                )
                ->get();

            return response()->json($items, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    public function addToCart(Request $request)
    {
        try {
            $user = $request->user();
            $ma_bien_the = $request->ma_bien_the;
            $so_luong = $request->so_luong ?? 1;

            $cart = DB::table('giohang')->where('ma_kh', $user->ma_kh)->first();
            
            if (!$cart) {
                $ma_gh = 'GH_' . time(); 
                DB::table('giohang')->insert([
                    'ma_gh' => $ma_gh,
                    'ma_kh' => $user->ma_kh
                ]);
                $cart = (object)['ma_gh' => $ma_gh];
            }

            // Đã đổi chitiet_gh thành chitiet_giohang
            $item = DB::table('chitiet_giohang')
                ->where('ma_gh', $cart->ma_gh)
                ->where('ma_bien_the', $ma_bien_the)
                ->first();

            if ($item) {
                DB::table('chitiet_giohang')
                    ->where('ma_gh', $cart->ma_gh)
                    ->where('ma_bien_the', $ma_bien_the)
                    ->update(['so_luong' => $item->so_luong + $so_luong]);
            } else {
                DB::table('chitiet_giohang')->insert([
                    'ma_gh' => $cart->ma_gh,
                    'ma_bien_the' => $ma_bien_the,
                    'so_luong' => $so_luong
                ]);
            }

            return response()->json(['message' => 'Đã thêm vào giỏ hàng thành công'], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Cập nhật số lượng 1 sản phẩm trong giỏ
     */
    public function updateQuantity(Request $request, $ma_bien_the)
    {
        try {
            $user = $request->user();
            $cart = DB::table('giohang')->where('ma_kh', $user->ma_kh)->first();

            if (!$cart) return response()->json(['error' => 'Không tìm thấy giỏ hàng'], 404);

            $so_luong_moi = $request->so_luong;

            if ($so_luong_moi <= 0) {
                DB::table('chitiet_giohang')->where('ma_gh', $cart->ma_gh)->where('ma_bien_the', $ma_bien_the)->delete();
            } else {
                $kho = DB::table('bienthe_sp')->where('ma_bien_the', $ma_bien_the)->value('so_luong_ton');
                if ($so_luong_moi > $kho) {
                    return response()->json(['error' => 'Số lượng vượt quá tồn kho'], 400);
                }
                DB::table('chitiet_giohang')->where('ma_gh', $cart->ma_gh)->where('ma_bien_the', $ma_bien_the)->update(['so_luong' => $so_luong_moi]);
            }

            return response()->json(['message' => 'Cập nhật thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Xóa 1 sản phẩm khỏi giỏ
     */
    public function removeItem(Request $request, $ma_bien_the)
    {
        try {
            $user = $request->user();
            $cart = DB::table('giohang')->where('ma_kh', $user->ma_kh)->first();

            if ($cart) {
                DB::table('chitiet_giohang')->where('ma_gh', $cart->ma_gh)->where('ma_bien_the', $ma_bien_the)->delete();
            }

            return response()->json(['message' => 'Đã xóa sản phẩm'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Áp dụng mã khuyến mãi
     */
    public function applyVoucher(Request $request)
    {
        try {
            $user = $request->user();
            $code = $request->ma_code;
            $tong_tien = $request->tong_tien;

            // 1. Tìm mã voucher
            $voucher = DB::table('voucher')->where('ma_code', $code)->first();
            if (!$voucher) {
                return response()->json(['error' => 'Mã khuyến mãi không tồn tại'], 404);
            }

            // 2. Kiểm tra hạn sử dụng
            $now = now();
            if ($now < $voucher->ngay_bat_dau || $now > $voucher->ngay_het_han) {
                return response()->json(['error' => 'Mã khuyến mãi đã hết hạn hoặc chưa bắt đầu'], 400);
            }

            // 3. Kiểm tra số lượt sử dụng
            if ($voucher->so_lan_da_dung >= $voucher->so_lan_su_dung_toi_da) {
                return response()->json(['error' => 'Mã khuyến mãi đã hết lượt sử dụng'], 400);
            }

            // 4. Kiểm tra giá trị đơn hàng tối thiểu
            if ($tong_tien < $voucher->don_toi_thieu) {
                return response()->json(['error' => 'Đơn hàng chưa đạt tối thiểu ' . number_format($voucher->don_toi_thieu) . 'đ để áp dụng'], 400);
            }

            // 5. Kiểm tra xem Khách hàng này ĐÃ TỪNG XÀI mã này chưa (Tìm trong bảng donhang)
            $da_dung = DB::table('donhang')
                ->where('ma_kh', $user->ma_kh)
                ->where('ma_voucher', $voucher->ma_voucher)
                ->exists();

            if ($da_dung) {
                return response()->json(['error' => 'Bạn đã sử dụng mã khuyến mãi này rồi'], 400);
            }

            // 6. Tính toán số tiền được giảm
            $giam_gia = 0;
            if ($voucher->loai_giam === 'percent') {
                $giam_gia = ($tong_tien * $voucher->gia_tri_giam) / 100;
            } else {
                $giam_gia = $voucher->gia_tri_giam;
            }

            // Đảm bảo giảm giá không vượt quá tổng tiền đơn hàng
            if ($giam_gia > $tong_tien) {
                $giam_gia = $tong_tien;
            }

            return response()->json([
                'message' => 'Áp dụng mã thành công!',
                'ma_voucher' => $voucher->ma_voucher,
                'ma_code' => $voucher->ma_code,
                'giam_gia' => $giam_gia
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}