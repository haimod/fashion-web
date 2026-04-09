<?php

namespace App\Http\Controllers\API\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class AdminProductController extends Controller
{
    // ==========================================
    // 1. LẤY DANH SÁCH SẢN PHẨM (KÈM GIÁ MIN VÀ TỔNG KHO)
    // ==========================================
    public function index()
    {
        try {
            $products = DB::table('sanpham')
                ->join('danhmuc', 'sanpham.ma_dm', '=', 'danhmuc.ma_dm')
                ->leftJoin('bienthe_sp', 'sanpham.ma_sp', '=', 'bienthe_sp.ma_sp')
                ->select(
                    'sanpham.ma_sp as id',
                    'sanpham.ten_sp as name',
                    'danhmuc.ten_dm as category',
                    'sanpham.hinh_anh as image',
                    // Lấy giá thấp nhất nếu có nhiều size
                    DB::raw('MIN(bienthe_sp.gia_ban) as price'),
                    // Cộng dồn tổng tồn kho
                    DB::raw('SUM(bienthe_sp.so_luong_ton) as stock'),
                    'sanpham.trang_thai as status'
                )
                // Đã bổ sung hinh_anh vào groupBy để tránh lỗi SQL Strict Mode
                ->groupBy('sanpham.ma_sp', 'sanpham.ten_sp', 'danhmuc.ten_dm', 'sanpham.hinh_anh', 'sanpham.trang_thai')
                ->orderBy('sanpham.ma_sp', 'desc') // Sắp xếp theo mã SP mới nhất
                ->get();

            return response()->json($products, 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi SQL: ' . $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 2. THÊM SẢN PHẨM MỚI (CÙNG NHIỀU BIẾN THỂ)
    // ==========================================
    public function store(Request $request)
    {
        $request->validate([
            'ten_sp' => 'required|string|max:200',
            'ma_dm' => 'required',
            'variants' => 'required|string', // Chuỗi JSON chứa mảng Size/Màu/Giá
            'hinh_anh' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        try {
            DB::beginTransaction();

            $ma_sp = 'SP_' . time(); // Tự động sinh mã SP
            $hinhAnhPath = null;

            // Xử lý lưu file ảnh
            if ($request->hasFile('hinh_anh')) {
                $hinhAnhPath = $request->file('hinh_anh')->store('products', 'public');
            }

            // Lưu phần VỎ (sanpham)
            DB::table('sanpham')->insert([
                'ma_sp' => $ma_sp,
                'ma_dm' => $request->ma_dm,
                'ten_sp' => $request->ten_sp,
                'hinh_anh' => $hinhAnhPath, 
                'mo_ta' => $request->mo_ta ?? '',
                'trang_thai' => 1
            ]);

            // Giải mã chuỗi JSON từ Frontend gửi lên thành Mảng
            $variants = json_decode($request->variants, true); 
            
            // Chạy vòng lặp để lưu phần RUỘT (từng dòng size/màu)
            foreach ($variants as $index => $v) {
                DB::table('bienthe_sp')->insert([
                    'ma_bien_the' => $ma_sp . '_BT' . $index, // Mã biến thể VD: SP_123456_BT0
                    'ma_sp' => $ma_sp,
                    'kich_thuoc' => $v['kich_thuoc'],
                    'mau_sac' => $v['mau_sac'],
                    'gia_ban' => $v['gia_ban'],
                    'so_luong_ton' => $v['so_luong_ton']
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Lên kệ sản phẩm thành công!'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 3. XÓA SẢN PHẨM
    // ==========================================
    public function destroy($id)
    {
        try {
            DB::beginTransaction();
            // Xóa các biến thể (khóa ngoại) trước
            DB::table('bienthe_sp')->where('ma_sp', $id)->delete();
            // Xóa sản phẩm gốc
            DB::table('sanpham')->where('ma_sp', $id)->delete();

            DB::commit();
            return response()->json(['message' => 'Xóa sản phẩm thành công!'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi: Không thể xóa sản phẩm đang có trong Đơn hàng/BST!'], 500);
        }
    }

    // ==========================================
    // 4. LẤY THÔNG TIN 1 SẢN PHẨM ĐỂ SỬA (GET)
    // ==========================================
    public function show($id)
    {
        $product = DB::table('sanpham')->where('ma_sp', $id)->first();

        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        // ĐÃ SỬA: Lấy TOÀN BỘ biến thể của sản phẩm này nhét vào một mảng
        $variants = DB::table('bienthe_sp')->where('ma_sp', $id)->get();
        $product->variants = $variants;

        return response()->json($product, 200);
    }

    // ==========================================
    // 5. CẬP NHẬT SẢN PHẨM VÀ BIẾN THỂ (POST)
    public function update(Request $request, $id)
    {
        $request->validate([
            'ten_sp' => 'required|string|max:200',
            'ma_dm' => 'required',
            'variants' => 'required|string', 
            'hinh_anh' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', 
        ]);

        try {
            DB::beginTransaction();

            // 1. Cập nhật VỎ (Sản phẩm)
            $updateData = [
                'ten_sp' => $request->ten_sp,
                'ma_dm' => $request->ma_dm,
                'mo_ta' => $request->mo_ta ?? '',
            ];

            if ($request->hasFile('hinh_anh')) {
                $updateData['hinh_anh'] = $request->file('hinh_anh')->store('products', 'public');
            }

            DB::table('sanpham')->where('ma_sp', $id)->update($updateData);

            // 2. Cập nhật RUỘT (Biến thể)
            $variants = json_decode($request->variants, true);
            
            // Quét xem những biến thể nào được GIỮ LẠI (Có mã cũ)
            $incomingVariantIds = [];
            foreach ($variants as $v) {
                if (!empty($v['ma_bien_the'])) {
                    $incomingVariantIds[] = $v['ma_bien_the'];
                }
            }
            
            // Xóa sạch những biến thể bị Admin bấm thùng rác xóa đi
            if (count($incomingVariantIds) > 0) {
                DB::table('bienthe_sp')
                    ->where('ma_sp', $id)
                    ->whereNotIn('ma_bien_the', $incomingVariantIds)
                    ->delete();
            } else {
                // Nếu xóa hết sạch cái cũ, chỉ để lại cái mới
                DB::table('bienthe_sp')->where('ma_sp', $id)->delete();
            }

            // Cập nhật dòng cũ / Thêm dòng mới
            foreach ($variants as $index => $v) {
                if (!empty($v['ma_bien_the'])) {
                    DB::table('bienthe_sp')->where('ma_bien_the', $v['ma_bien_the'])->update([
                        'kich_thuoc' => $v['kich_thuoc'],
                        'mau_sac' => $v['mau_sac'],
                        'gia_ban' => $v['gia_ban'],
                        'so_luong_ton' => $v['so_luong_ton']
                    ]);
                } else {
                    // TẠO MÃ CỰC NGẮN (Ví dụ: BT_4582_1) để không bị lỗi văng Database do dài quá 20 ký tự
                    $short_id = 'BT_' . rand(1000, 9999) . '_' . $index;
                    
                    DB::table('bienthe_sp')->insert([
                        'ma_bien_the' => $short_id,
                        'ma_sp' => $id,
                        'kich_thuoc' => $v['kich_thuoc'],
                        'mau_sac' => $v['mau_sac'],
                        'gia_ban' => $v['gia_ban'],
                        'so_luong_ton' => $v['so_luong_ton']
                    ]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Cập nhật thành công!'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            // Lỗi sẽ được gửi thẳng ra màn hình cho bạn xem
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}