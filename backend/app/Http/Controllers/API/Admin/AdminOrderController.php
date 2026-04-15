<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    /**
     * Lấy danh sách đơn hàng (Có phân trang & Tìm kiếm)
     */
   /**
     * Lấy danh sách đơn hàng (Có phân trang, Tìm kiếm & Lọc trạng thái)
     */
    public function getOrders(Request $request)
    {
        try {
            // Cho phép lấy nhiều đơn hàng hơn nếu client yêu cầu (Dùng cho xuất báo cáo)
            $perPage = $request->input('per_page', 10); 
            $search = $request->input('search', '');
            $status = $request->input('status', ''); // Thêm biến lấy trạng thái

            $query = DB::table('donhang')
                ->join('khachhang', 'donhang.ma_kh', '=', 'khachhang.ma_kh')
                ->join('diachi_kh', 'donhang.ma_dc', '=', 'diachi_kh.ma_dc')
                ->select(
                    'donhang.ma_dh',
                    'donhang.ngay_dat',
                    'donhang.tong_tien',
                    'donhang.trang_thai',
                    'khachhang.tenkh',
                    'khachhang.email',
                    'diachi_kh.sdt_nguoi_nhan as sodt'
                );

            // Lọc theo Tìm kiếm
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('donhang.ma_dh', 'LIKE', "%{$search}%")
                      ->orWhere('khachhang.tenkh', 'LIKE', "%{$search}%")
                      ->orWhere('diachi_kh.sdt_nguoi_nhan', 'LIKE', "%{$search}%");
                });
            }

            // Lọc theo Trạng thái (Nếu có)
            if (!empty($status)) {
                $query->where('donhang.trang_thai', $status);
            }

            $orders = $query->orderBy('donhang.ngay_dat', 'desc')->paginate($perPage);

            // Thống kê nhanh
            $stats = [
                'cho_xac_nhan' => DB::table('donhang')->where('trang_thai', 'CHO_XAC_NHAN')->count(),
                'dang_giao' => DB::table('donhang')->where('trang_thai', 'DANG_GIAO')->count(),
                'da_giao' => DB::table('donhang')->where('trang_thai', 'DA_GIAO')->count(),
            ];

            return response()->json([
                'orders' => $orders,
                'stats' => $stats
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

  /**
     * Lấy chi tiết 1 đơn hàng (Dùng để Xem chi tiết / In hóa đơn)
     */
    public function getOrderDetail($ma_dh)
    {
        try {
            $order = DB::table('donhang')
                ->leftJoin('khachhang', 'donhang.ma_kh', '=', 'khachhang.ma_kh')
                ->leftJoin('diachi_kh', 'donhang.ma_dc', '=', 'diachi_kh.ma_dc')
                ->where('donhang.ma_dh', $ma_dh)
                ->select(
                    'donhang.*',
                    'khachhang.tenkh',
                    'khachhang.email',
                    'diachi_kh.ten_nguoi_nhan',
                    'diachi_kh.sdt_nguoi_nhan',
                    'diachi_kh.dia_chi_ct',
                    // BỎ CỘT phuong_xa Ở ĐÂY RỒI NHÉ SẾP
                    'diachi_kh.quan_huyen',
                    'diachi_kh.thanh_pho'
                )
                ->first();

            if (!$order) {
                return response()->json(['error' => 'Không tìm thấy đơn hàng'], 404);
            }

            $items = DB::table('chitiet_dh')
                ->join('bienthe_sp', 'chitiet_dh.ma_bien_the', '=', 'bienthe_sp.ma_bien_the')
                ->join('sanpham', 'bienthe_sp.ma_sp', '=', 'sanpham.ma_sp')
                ->where('chitiet_dh.ma_dh', $ma_dh)
                ->select(
                    'sanpham.ten_sp',
                    'sanpham.hinh_anh',
                    'bienthe_sp.kich_thuoc',
                    'bienthe_sp.mau_sac',
                    'chitiet_dh.so_luong',
                    'chitiet_dh.don_gia'
                )
                ->get();

            return response()->json([
                'order' => $order,
                'items' => $items
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

   /**
     * Cập nhật trạng thái đơn hàng (Theo luồng 4 bước + Hủy)
     */
    public function updateOrderStatus(Request $request, $ma_dh)
    {
        try {
            $status = $request->trang_thai;
            $validStatuses = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_GIAO', 'DA_GIAO', 'DA_HUY'];
            
            if (!in_array($status, $validStatuses)) {
                return response()->json(['error' => 'Trạng thái không hợp lệ!'], 400);
            }

            $order = DB::table('donhang')->where('ma_dh', $ma_dh)->first();
            if (!$order) return response()->json(['error' => 'Không tìm thấy đơn hàng!'], 404);

            // Bắt đầu cập nhật trạng thái đơn hàng
            DB::table('donhang')->where('ma_dh', $ma_dh)->update(['trang_thai' => $status]);

            // 🚨 NẾU HỦY ĐƠN: Hoàn lại tồn kho cho sản phẩm
            if ($status === 'DA_HUY') {
                $items = DB::table('chitiet_dh')->where('ma_dh', $ma_dh)->get();
                foreach ($items as $item) {
                    DB::table('bienthe_sp')->where('ma_bien_the', $item->ma_bien_the)->increment('so_luong_ton', $item->so_luong);
                }
            }

            // Ghi lịch sử (Tôi đã gọt bỏ cột mo_ta gây lỗi đi rồi)
            DB::table('lichsu_donhang')->insert([
                'ma_dh' => $ma_dh,
                'trang_thai' => $status
            ]);

            return response()->json(['message' => 'Cập nhật trạng thái thành công'], 200);

        } catch (\Exception $e) {
            // Lỗi 500 sẽ văng ra kèm câu chửi chi tiết của MySQL để dễ debug
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Sửa thông tin địa chỉ đơn hàng (Phòng khi khách nhập sai)
     */
    public function updateOrderAddress(Request $request, $ma_dh)
    {
        try {
            $order = DB::table('donhang')->where('ma_dh', $ma_dh)->first();
            if (!$order) return response()->json(['error' => 'Không tìm thấy đơn hàng'], 404);

            // Cập nhật bảng diachi_kh
            DB::table('diachi_kh')
                ->where('ma_dc', $order->ma_dc)
                ->update([
                    'ten_nguoi_nhan' => $request->ten_nguoi_nhan,
                    'sdt_nguoi_nhan' => $request->sdt_nguoi_nhan,
                    'dia_chi_ct' => $request->dia_chi_ct,
                    'thanh_pho' => $request->thanh_pho,
                    'quan_huyen' => $request->quan_huyen
                ]);

            return response()->json(['message' => 'Cập nhật thông tin giao hàng thành công!'], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Xóa hoàn toàn đơn hàng khỏi hệ thống
     */
    public function deleteOrder($ma_dh)
    {
        DB::beginTransaction();
        try {
            $order = DB::table('donhang')->where('ma_dh', $ma_dh)->first();
            if (!$order) return response()->json(['error' => 'Không tìm thấy đơn hàng'], 404);

            // Hoàn lại tồn kho
            $items = DB::table('chitiet_dh')->where('ma_dh', $ma_dh)->get();
            foreach ($items as $item) {
                DB::table('bienthe_sp')->where('ma_bien_the', $item->ma_bien_the)->increment('so_luong_ton', $item->so_luong);
            }

            // Xóa chi tiết đơn hàng
            DB::table('chitiet_dh')->where('ma_dh', $ma_dh)->delete();
            // Xóa lịch sử đơn hàng
            DB::table('lichsu_donhang')->where('ma_dh', $ma_dh)->delete();
            // Xóa địa chỉ gắn với đơn hàng này
            DB::table('diachi_kh')->where('ma_dc', $order->ma_dc)->delete();
            // Xóa đơn hàng
            DB::table('donhang')->where('ma_dh', $ma_dh)->delete();

            DB::commit();
            return response()->json(['message' => 'Đã xóa đơn hàng thành công'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}