<?php

namespace App\Http\Controllers\API\Admin;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB; // <--- BẠN THÊM DÒNG NÀY VÀO ĐÂY NHÉ
class AdminProductController extends Controller
{
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
                ->groupBy('sanpham.ma_sp', 'sanpham.ten_sp', 'danhmuc.ten_dm', 'sanpham.trang_thai')
                ->get();

            return response()->json($products, 200);

        } catch (\Exception $e) {
            // NẾU CÓ LỖI DB THÌ NÓ SẼ BÁO RÕ RÀNG RA TRÌNH DUYỆT CHỨ KO BỊ 500 MÙ MỜ NỮA
            return response()->json(['message' => 'Lỗi SQL: ' . $e->getMessage()], 500);
        }
    }
    public function store(Request $request)
    {
        // 1. Kiểm tra dữ liệu gửi lên
        $request->validate([
            'ma_sp' => 'required|unique:sanpham,ma_sp',
            'ten_sp' => 'required|string|max:200',
            'ma_dm' => 'required',
            'gia_ban' => 'required|numeric|min:0',
            'so_luong' => 'required|integer|min:0',
            'hinh_anh' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        try {
            DB::beginTransaction();
            // 2. Xử lý lưu file ảnh
            $hinhAnhPath = null;
            if ($request->hasFile('hinh_anh')) {
                // Lưu file vào thư mục: storage/app/public/products
                $hinhAnhPath = $request->file('hinh_anh')->store('products', 'public');
            }
            // 2. Lưu thông tin chung vào bảng SANPHAM
            DB::table('sanpham')->insert([
                'ma_sp' => $request->ma_sp,
                'ma_dm' => $request->ma_dm,
                'ten_sp' => $request->ten_sp,
                'hinh_anh' => $request->hinh_anh, // <--- THÊM DÒNG NÀY
                'mo_ta' => $request->mo_ta ?? '',
                'hinh_anh' => $hinhAnhPath, // Lưu đường dẫn (VD: products/xyz123.jpg)
                'trang_thai' => 1
            ]);

            // 3. Vì Database của bạn tách giá & số lượng ra bảng BIENTHE_SP, 
            // nên ta phải tạo 1 biến thể mặc định (Freesize/Mặc định) cho nó.
            DB::table('bienthe_sp')->insert([
                'ma_bien_the' => $request->ma_sp . '-DEF', // VD: VS-001-DEF
                'ma_sp' => $request->ma_sp,
                'kich_thuoc' => 'Freesize',
                'mau_sac' => 'Mặc định',
                'gia_ban' => $request->gia_ban,
                'so_luong_ton' => $request->so_luong
            ]);

            DB::commit();
            return response()->json(['message' => 'Thêm sản phẩm thành công!'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            // 1. Xóa các biến thể (khóa ngoại) trước
            DB::table('bienthe_sp')->where('ma_sp', $id)->delete();
            
            // 2. Xóa sản phẩm gốc
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
        $product = DB::table('sanpham')
            ->leftJoin('bienthe_sp', 'sanpham.ma_sp', '=', 'bienthe_sp.ma_sp')
            ->select(
                'sanpham.ma_sp', 'sanpham.ten_sp', 'sanpham.ma_dm', 
                'sanpham.mo_ta', 'sanpham.hinh_anh',
                'bienthe_sp.gia_ban', 'bienthe_sp.so_luong_ton as so_luong'
            )
            ->where('sanpham.ma_sp', $id)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }
        return response()->json($product, 200);
    }

    // ==========================================
    // 5. CẬP NHẬT SẢN PHẨM (POST)
    // ==========================================
    public function update(Request $request, $id)
    {
        $request->validate([
            'ten_sp' => 'required|string|max:200',
            'ma_dm' => 'required',
            'gia_ban' => 'required|numeric|min:0',
            'so_luong' => 'required|integer|min:0',
            'hinh_anh' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', 
        ]);

        try {
            DB::beginTransaction();

            // 1. Cập nhật dữ liệu bảng Sản phẩm
            $updateData = [
                'ten_sp' => $request->ten_sp,
                'ma_dm' => $request->ma_dm,
                'mo_ta' => $request->mo_ta ?? '',
            ];

            // Nếu người dùng có chọn ảnh mới thì lưu đè lên
            if ($request->hasFile('hinh_anh')) {
                $updateData['hinh_anh'] = $request->file('hinh_anh')->store('products', 'public');
            }

            DB::table('sanpham')->where('ma_sp', $id)->update($updateData);

            // 2. Cập nhật bảng Biến thể (Giá, Số lượng)
            DB::table('bienthe_sp')->where('ma_sp', $id)->update([
                'gia_ban' => $request->gia_ban,
                'so_luong_ton' => $request->so_luong
            ]);

            DB::commit();
            return response()->json(['message' => 'Cập nhật thành công!'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}

