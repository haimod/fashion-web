<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ClientProfileController extends Controller
{
    /**
     * Lấy thông tin cá nhân của khách hàng đang đăng nhập
     */
    public function getProfile(Request $request)
    {
        // $request->user() sẽ tự động lấy ra dòng dữ liệu trong bảng khachhang
        // tương ứng với cái token mà React gửi lên
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Không tìm thấy người dùng'], 404);
        }

        return response()->json($user, 200);
    }

    /**
     * Lấy danh sách địa chỉ của khách hàng
     */
    public function getAddresses(Request $request)
    {
        try {
            $user = $request->user();
            $addresses = DB::table('diachi_kh')
                ->where('ma_kh', $user->ma_kh)
                ->orderBy('mac_dinh', 'desc') // Cho địa chỉ mặc định lên đầu
                ->get();
                
            return response()->json($addresses, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Thêm địa chỉ mới
     */
    public function addAddress(Request $request)
    {
        try {
            $user = $request->user();
            
            // Kiểm tra xem khách đã có địa chỉ nào chưa
            $count = DB::table('diachi_kh')->where('ma_kh', $user->ma_kh)->count();
            
            // Nếu là địa chỉ đầu tiên, hoặc khách tick chọn "Mặc định", thì set nó là 1
            $is_default = ($count === 0 || $request->mac_dinh) ? 1 : 0;

            // Nếu set địa chỉ này là mặc định, phải gỡ mặc định của các địa chỉ cũ
            if ($is_default === 1) {
                DB::table('diachi_kh')->where('ma_kh', $user->ma_kh)->update(['mac_dinh' => 0]);
            }

            DB::table('diachi_kh')->insert([
                'ma_dc' => 'DC_' . time(), // Tự render mã địa chỉ
                'ma_kh' => $user->ma_kh,
                'ten_nguoi_nhan' => $request->ten_nguoi_nhan,
                'sdt_nguoi_nhan' => $request->sdt_nguoi_nhan,
                'dia_chi_ct' => $request->dia_chi_ct,
                'thanh_pho' => $request->thanh_pho,
                'quan_huyen' => $request->quan_huyen,
                'mac_dinh' => $is_default
            ]);

            return response()->json(['message' => 'Thêm địa chỉ thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    /**
     * Cập nhật thông tin cá nhân
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            $updateData = [
                'tenkh' => $request->tenkh,
                'sodt' => $request->sodt,
            ];

            // Nếu người dùng có nhập mật khẩu mới thì cập nhật luôn
            if ($request->filled('matkhau')) {
                $updateData['matkhau'] = bcrypt($request->matkhau);
            }

            DB::table('khachhang')->where('ma_kh', $user->ma_kh)->update($updateData);

            return response()->json(['message' => 'Cập nhật hồ sơ thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Cập nhật địa chỉ
     */
    public function updateAddress(Request $request, $id)
    {
        try {
            $user = $request->user();
            $is_default = $request->mac_dinh ? 1 : 0;

            if ($is_default === 1) {
                DB::table('diachi_kh')->where('ma_kh', $user->ma_kh)->update(['mac_dinh' => 0]);
            }

            DB::table('diachi_kh')->where('ma_dc', $id)->where('ma_kh', $user->ma_kh)->update([
                'ten_nguoi_nhan' => $request->ten_nguoi_nhan,
                'sdt_nguoi_nhan' => $request->sdt_nguoi_nhan,
                'dia_chi_ct' => $request->dia_chi_ct,
                'thanh_pho' => $request->thanh_pho,
                'quan_huyen' => $request->quan_huyen,
                'mac_dinh' => $is_default
            ]);

            return response()->json(['message' => 'Cập nhật địa chỉ thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Xóa địa chỉ
     */
    public function deleteAddress(Request $request, $id)
    {
        try {
            $user = $request->user();
            DB::table('diachi_kh')->where('ma_dc', $id)->where('ma_kh', $user->ma_kh)->delete();
            return response()->json(['message' => 'Đã xóa địa chỉ'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}