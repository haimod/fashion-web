<?php

namespace App\Http\Controllers\API\Admin;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class AdminVoucherController extends Controller
{
    // Lấy danh sách Voucher từ DB
    public function index()
    {
        $vouchers = DB::table('voucher')
            ->orderBy('ngay_bat_dau', 'desc')
            ->get();
            
        return response()->json($vouchers, 200);
    }

    // 2. Thêm Voucher mới
    public function store(Request $request)
    {
        $request->validate([
            'ma_code' => 'required|string|max:50|unique:voucher,ma_code',
            'loai_giam' => 'required|string|max:10',
            'gia_tri_giam' => 'required|numeric|min:0',
            'don_toi_thieu' => 'nullable|numeric|min:0',
            'so_lan_su_dung_toi_da' => 'required|integer|min:1',
            'ngay_bat_dau' => 'required|date',
            'ngay_het_han' => 'required|date|after:ngay_bat_dau',
        ]);

        // Tạo mã ID nội bộ (VD: VC_1712345678)
        $ma_voucher = 'VC_' . time(); 

        DB::table('voucher')->insert([
            'ma_voucher' => $ma_voucher,
            'ma_code' => strtoupper($request->ma_code),
            'loai_giam' => $request->loai_giam,
            'gia_tri_giam' => $request->gia_tri_giam,
            'don_toi_thieu' => $request->don_toi_thieu ?? 0,
            'so_lan_su_dung_toi_da' => $request->so_lan_su_dung_toi_da,
            'so_lan_da_dung' => 0,
            'ngay_bat_dau' => $request->ngay_bat_dau,
            'ngay_het_han' => $request->ngay_het_han
        ]);

        return response()->json(['message' => 'Tạo mã khuyến mãi thành công!'], 201);
    }

    // 3. Cập nhật Voucher
    public function update(Request $request, $id)
    {
        $request->validate([
            'loai_giam' => 'required|string|max:10',
            'gia_tri_giam' => 'required|numeric|min:0',
            'don_toi_thieu' => 'nullable|numeric|min:0',
            'so_lan_su_dung_toi_da' => 'required|integer|min:1',
            'ngay_bat_dau' => 'required|date',
            'ngay_het_han' => 'required|date|after:ngay_bat_dau',
        ]);

        DB::table('voucher')->where('ma_voucher', $id)->update([
            // Không cho sửa ma_code để tránh lỗi logic khách hàng đang dùng
            'loai_giam' => $request->loai_giam,
            'gia_tri_giam' => $request->gia_tri_giam,
            'don_toi_thieu' => $request->don_toi_thieu ?? 0,
            'so_lan_su_dung_toi_da' => $request->so_lan_su_dung_toi_da,
            'ngay_bat_dau' => $request->ngay_bat_dau,
            'ngay_het_han' => $request->ngay_het_han
        ]);

        return response()->json(['message' => 'Cập nhật Voucher thành công!'], 200);
    }

    // 4. Xóa Voucher
    public function destroy($id)
    {
        DB::table('voucher')->where('ma_voucher', $id)->delete();
        return response()->json(['message' => 'Đã xóa Voucher thành công!'], 200);
    }
}