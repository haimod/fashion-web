<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientOrderController extends Controller
{
  public function placeOrder(Request $request)
    {
        DB::beginTransaction(); 
        try {
            $user = $request->user();
            $cartItems = collect([]);
            $isDirectBuy = $request->has('direct_buy') && $request->direct_buy == true;

            // 1. LẤY DANH SÁCH SẢN PHẨM CẦN THANH TOÁN (Giữ nguyên như cũ)
            if ($isDirectBuy) {
                $variant = DB::table('bienthe_sp')->where('ma_bien_the', $request->ma_bien_the)->first();
                if (!$variant) return response()->json(['error' => 'Sản phẩm không tồn tại'], 400);
                if ($variant->so_luong_ton < $request->so_luong) return response()->json(['error' => 'Số lượng vượt quá tồn kho'], 400);
                $cartItems->push((object)['ma_bien_the' => $variant->ma_bien_the, 'so_luong' => $request->so_luong, 'gia_ban' => $request->gia_ban ?? $variant->gia_ban]);
            } else {
                $cart = DB::table('giohang')->where('ma_kh', $user->ma_kh)->first();
                if (!$cart) return response()->json(['error' => 'Giỏ hàng trống'], 400);
                $cartItems = DB::table('chitiet_giohang')
                    ->join('bienthe_sp', 'chitiet_giohang.ma_bien_the', '=', 'bienthe_sp.ma_bien_the')
                    ->where('chitiet_giohang.ma_gh', $cart->ma_gh)
                    ->select('chitiet_giohang.*', 'bienthe_sp.gia_ban')
                    ->get();
                if ($cartItems->isEmpty()) return response()->json(['error' => 'Không có sản phẩm để thanh toán'], 400);
            }

            // 2. TÍNH TỔNG TIỀN BAN ĐẦU
            $tong_tien = 0;
            foreach ($cartItems as $item) { $tong_tien += $item->gia_ban * $item->so_luong; }

            // 🚨 3. XỬ LÝ VOUCHER & TÍNH TIỀN CUỐI CÙNG 🚨
          // 🚨 3. XỬ LÝ VOUCHER & CHẶN DÙNG LẠI 🚨
            $ma_voucher = $request->ma_voucher;
            $giam_gia = 0;

            if ($ma_voucher) {
                $voucher = DB::table('voucher')->where('ma_voucher', $ma_voucher)->first();
                
                if ($voucher) {
                    // CHECK CHỐT CHẶN: Nếu khách đã dùng rồi thì đá văng luôn!
                    $da_dung = DB::table('donhang')->where('ma_kh', $user->ma_kh)->where('ma_voucher', $ma_voucher)->exists();
                    if ($da_dung) {
                        DB::rollBack();
                        return response()->json(['error' => 'Bạn đã sử dụng mã khuyến mãi này rồi, không thể dùng lại!'], 400);
                    }

                    // Tính tiền giảm
                    if ($voucher->loai_giam === 'percent') {
                        $giam_gia = ($tong_tien * $voucher->gia_tri_giam) / 100;
                    } else {
                        $giam_gia = $voucher->gia_tri_giam;
                    }
                    if ($giam_gia > $tong_tien) $giam_gia = $tong_tien;

                    // Tăng số lần đã xài của mã này lên 1
                    DB::table('voucher')->where('ma_voucher', $ma_voucher)->increment('so_lan_da_dung');
                } else {
                    $ma_voucher = null;
                }
            }

            $tong_tien_cuoi = $tong_tien - $giam_gia;

            // 4. XỬ LÝ ĐỊA CHỈ GIAO HÀNG (Giữ nguyên)
            $ma_dc = $request->ma_dc;
            if (!$ma_dc) {
                $ma_dc = 'DC_' . time();
                DB::table('diachi_kh')->insert([
                    'ma_dc' => $ma_dc, 'ma_kh' => $user->ma_kh, 'ten_nguoi_nhan' => $request->ho_ten, 'sdt_nguoi_nhan' => $request->so_dien_thoai,
                    'dia_chi_ct' => $request->dia_chi, 'thanh_pho' => $request->thanh_pho, 'quan_huyen' => $request->quan_huyen, 'mac_dinh' => 0
                ]);
            }

            // 5. TẠO ĐƠN HÀNG MỚI (Lưu tổng tiền cuối đã trừ Voucher)
            $ma_dh = 'DH_' . time() . rand(10, 99);
            DB::table('donhang')->insert([
                'ma_dh' => $ma_dh,
                'ma_kh' => $user->ma_kh,
                'ma_dc' => $ma_dc,
                'ma_voucher' => $ma_voucher, // Lưu mã Voucher vào đơn
                'tong_tien' => $tong_tien_cuoi, 
                'trang_thai' => 'CHO_XAC_NHAN'
            ]);

            // 6. THÊM CHI TIẾT & TRỪ TỒN KHO
            foreach ($cartItems as $item) {
                DB::table('chitiet_dh')->insert(['ma_dh' => $ma_dh, 'ma_bien_the' => $item->ma_bien_the, 'so_luong' => $item->so_luong, 'don_gia' => $item->gia_ban]);
                DB::table('bienthe_sp')->where('ma_bien_the', $item->ma_bien_the)->decrement('so_luong_ton', $item->so_luong);
            }

            DB::table('lichsu_donhang')->insert(['ma_dh' => $ma_dh, 'trang_thai' => 'CHO_XAC_NHAN']);

            if (!$isDirectBuy && isset($cart)) {
                DB::table('chitiet_giohang')->where('ma_gh', $cart->ma_gh)->delete();
            }

            DB::commit();
            return response()->json(['message' => 'Đặt hàng thành công', 'ma_dh' => $ma_dh], 200);

        } catch (\Exception $e) {
            DB::rollBack(); 
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Lấy danh sách lịch sử đơn hàng của khách
     */
   /**
     * 1. Lấy danh sách đơn hàng của khách (CÓ PHÂN TRANG)
     */
    public function getOrders(Request $request)
    {
        try {
            $user = $request->user();
            $perPage = $request->input('per_page', 5); // Khách hàng thì hiển thị 5 đơn 1 trang cho đẹp

            // Lấy đơn hàng có phân trang
            $orders = DB::table('donhang')
                ->where('ma_kh', $user->ma_kh)
                ->orderBy('ngay_dat', 'desc')
                ->paginate($perPage);

            // Chạy vòng lặp để lấy chi tiết sản phẩm cho từng đơn
            foreach ($orders as $order) {
                $order->items = DB::table('chitiet_dh')
                    ->join('bienthe_sp', 'chitiet_dh.ma_bien_the', '=', 'bienthe_sp.ma_bien_the')
                    ->join('sanpham', 'bienthe_sp.ma_sp', '=', 'sanpham.ma_sp')
                    ->where('chitiet_dh.ma_dh', $order->ma_dh)
                    ->select(
                        'sanpham.ten_sp', 
                        'sanpham.hinh_anh', 
                        'bienthe_sp.kich_thuoc', 
                        'bienthe_sp.mau_sac', 
                        'chitiet_dh.so_luong', 
                        'chitiet_dh.don_gia'
                    )
                    ->get();
            }

            return response()->json($orders, 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * 2. Khách hàng tự hủy đơn (Chỉ được hủy khi đang CHO_XAC_NHAN)
     */
    public function cancelOrder(Request $request, $ma_dh)
    {
        try {
            $user = $request->user();

            // Kiểm tra đơn hàng có phải của khách này không
            $order = DB::table('donhang')
                ->where('ma_dh', $ma_dh)
                ->where('ma_kh', $user->ma_kh)
                ->first();

            if (!$order) {
                return response()->json(['error' => 'Không tìm thấy đơn hàng!'], 404);
            }

            // Chốt chặn: Chỉ cho hủy khi đang Chờ xác nhận
            if ($order->trang_thai !== 'CHO_XAC_NHAN') {
                return response()->json(['error' => 'Không thể hủy! Đơn hàng đã được xử lý.'], 400);
            }

            // Đổi trạng thái thành DA_HUY
            DB::table('donhang')->where('ma_dh', $ma_dh)->update(['trang_thai' => 'DA_HUY']);

            // 🚨 QUAN TRỌNG: Hoàn lại số lượng tồn kho cho Shop
            $items = DB::table('chitiet_dh')->where('ma_dh', $ma_dh)->get();
            foreach ($items as $item) {
                DB::table('bienthe_sp')
                    ->where('ma_bien_the', $item->ma_bien_the)
                    ->increment('so_luong_ton', $item->so_luong);
            }

            // Ghi lịch sử
            DB::table('lichsu_donhang')->insert([
                'ma_dh' => $ma_dh,
                'trang_thai' => 'DA_HUY'
            ]);

            return response()->json(['message' => 'Đã hủy đơn hàng thành công!'], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    /**
     * Lấy thông tin chi tiết 1 đơn hàng cụ thể
     */
    public function getOrderDetail(Request $request, $ma_dh)
    {
        try {
            $user = $request->user();
            
            // Lấy thông tin chung của đơn hàng
            $order = DB::table('donhang')
                ->where('ma_dh', $ma_dh)
                ->where('ma_kh', $user->ma_kh)
                ->first();
                
            if (!$order) {
                return response()->json(['error' => 'Không tìm thấy đơn hàng'], 404);
            }

            // Lấy thông tin địa chỉ giao hàng
            $address = DB::table('diachi_kh')->where('ma_dc', $order->ma_dc)->first();

            // Lấy thông tin voucher (nếu có áp dụng)
            $voucher = null;
            if ($order->ma_voucher) {
                $voucher = DB::table('voucher')->where('ma_voucher', $order->ma_voucher)->first();
            }

            // Lấy danh sách sản phẩm trong đơn
            $items = DB::table('chitiet_dh')
                ->join('bienthe_sp', 'chitiet_dh.ma_bien_the', '=', 'bienthe_sp.ma_bien_the')
                ->join('sanpham', 'bienthe_sp.ma_sp', '=', 'sanpham.ma_sp')
                ->where('chitiet_dh.ma_dh', $ma_dh)
                ->select(
                    'sanpham.ten_sp', 
                    'sanpham.hinh_anh', 
                    'sanpham.ma_sp',
                    'bienthe_sp.kich_thuoc', 
                    'bienthe_sp.mau_sac', 
                    'chitiet_dh.so_luong', 
                    'chitiet_dh.don_gia'
                )
                ->get();

            return response()->json([
                'order' => $order,
                'address' => $address,
                'voucher' => $voucher,
                'items' => $items
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}