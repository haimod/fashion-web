<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminCollectionController extends Controller
{
    // 1. Lấy danh sách Bộ sưu tập (kèm đếm số SP)
    public function index()
    {
        $collections = DB::table('bosuutap')
            ->leftJoin('chitiet_bst', 'bosuutap.ma_bst', '=', 'chitiet_bst.ma_bst')
            ->select('bosuutap.*', DB::raw('COUNT(chitiet_bst.ma_sp) as so_luong_sp'))
            ->groupBy('bosuutap.ma_bst', 'bosuutap.ten_bst', 'bosuutap.mo_ta', 'bosuutap.hinh_anh', 'bosuutap.thoi_gian_bd', 'bosuutap.thoi_gian_kt', 'bosuutap.trang_thai')
            ->orderBy('bosuutap.thoi_gian_bd', 'desc')
            ->get();
            
        return response()->json($collections, 200);
    }

    // 2. Thêm Bộ sưu tập mới (Có upload ảnh)
    public function store(Request $request)
    {
        $request->validate([
            'ten_bst' => 'required|string|max:200',
            'thoi_gian_bd' => 'required|date',
            'thoi_gian_kt' => 'required|date|after:thoi_gian_bd',
            'trang_thai' => 'required|boolean'
        ]);

        $ma_bst = 'BST_' . time();
        $hinh_anh = null;

        if ($request->hasFile('hinh_anh')) {
            $hinh_anh = $request->file('hinh_anh')->store('collections', 'public');
        }

        DB::table('bosuutap')->insert([
            'ma_bst' => $ma_bst,
            'ten_bst' => $request->ten_bst,
            'mo_ta' => $request->mo_ta,
            'hinh_anh' => $hinh_anh,
            'thoi_gian_bd' => $request->thoi_gian_bd,
            'thoi_gian_kt' => $request->thoi_gian_kt,
            'trang_thai' => $request->trang_thai
        ]);

        return response()->json(['message' => 'Tạo Bộ sưu tập thành công!'], 201);
    }

    // Cập nhật Bộ sưu tập
    public function update(Request $request, $id)
    {
        $request->validate([
            'ten_bst' => 'required|string|max:200',
            'thoi_gian_bd' => 'required|date',
            'thoi_gian_kt' => 'required|date|after:thoi_gian_bd',
            'trang_thai' => 'required|boolean'
        ]);

        $bst = DB::table('bosuutap')->where('ma_bst', $id)->first();
        if (!$bst) return response()->json(['message' => 'Không tìm thấy bộ sưu tập'], 404);

        $hinh_anh = $bst->hinh_anh;

        // Nếu có upload hình mới
        if ($request->hasFile('hinh_anh')) {
            if ($hinh_anh) Storage::disk('public')->delete($hinh_anh); // Xóa hình cũ
            $hinh_anh = $request->file('hinh_anh')->store('collections', 'public'); // Lưu hình mới
        }

        DB::table('bosuutap')->where('ma_bst', $id)->update([
            'ten_bst' => $request->ten_bst,
            'mo_ta' => $request->mo_ta,
            'hinh_anh' => $hinh_anh,
            'thoi_gian_bd' => $request->thoi_gian_bd,
            'thoi_gian_kt' => $request->thoi_gian_kt,
            'trang_thai' => $request->trang_thai
        ]);

        return response()->json(['message' => 'Cập nhật Bộ sưu tập thành công!'], 200);
    }
    // 3. Xóa Bộ sưu tập
    public function destroy($id)
    {
        $bst = DB::table('bosuutap')->where('ma_bst', $id)->first();
        if ($bst && $bst->hinh_anh) Storage::disk('public')->delete($bst->hinh_anh); // Xóa ảnh trong folder

        DB::table('chitiet_bst')->where('ma_bst', $id)->delete(); // Xóa sp bên trong
        DB::table('bosuutap')->where('ma_bst', $id)->delete(); // Xóa vỏ
        
        return response()->json(['message' => 'Đã xóa Bộ sưu tập!'], 200);
    }

    // =====================================
    // QUẢN LÝ SẢN PHẨM TRONG BỘ SƯU TẬP
    // =====================================

    // 4. Lấy danh sách SP đã có trong BST
    public function getItems($ma_bst)
    {
        $items = DB::table('chitiet_bst')
            ->join('sanpham', 'chitiet_bst.ma_sp', '=', 'sanpham.ma_sp')
            ->where('chitiet_bst.ma_bst', $ma_bst)
            ->select('sanpham.*')
            ->get();
        return response()->json($items);
    }

    // 5. Lấy danh sách SP chưa có trong BST này
    public function getAvailableProducts($ma_bst)
    {
        $existing = DB::table('chitiet_bst')->where('ma_bst', $ma_bst)->pluck('ma_sp');
        $products = DB::table('sanpham')->whereNotIn('ma_sp', $existing)->get();
        return response()->json($products);
    }

    // 6. Thêm SP vào BST
    public function addItem(Request $request, $ma_bst)
    {
        DB::table('chitiet_bst')->insert(['ma_bst' => $ma_bst, 'ma_sp' => $request->ma_sp]);
        return response()->json(['message' => 'Đã thêm sản phẩm!']);
    }

    // 7. Rút SP khỏi BST
    public function removeItem($ma_bst, $ma_sp)
    {
        DB::table('chitiet_bst')->where('ma_bst', $ma_bst)->where('ma_sp', $ma_sp)->delete();
        return response()->json(['message' => 'Đã gỡ sản phẩm!']);
    }



    
}