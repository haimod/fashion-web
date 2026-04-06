<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Khách hàng
        Schema::create('KHACHHANG', function (Blueprint $table) {
            $table->string('ma_kh', 20)->primary();
            $table->string('tenkh', 100);
            $table->string('email', 100)->unique();
            $table->string('sodt', 15)->unique();
            $table->string('matkhau', 255);
            $table->dateTime('created_at')->useCurrent();
            $table->boolean('trang_thai')->default(true);
        });

        // 2. Địa chỉ khách hàng
        Schema::create('DIACHI_KH', function (Blueprint $table) {
            $table->string('ma_dc', 20)->primary();
            $table->string('ma_kh', 20);
            $table->string('ten_nguoi_nhan', 100);
            $table->string('sdt_nguoi_nhan', 15);
            $table->string('dia_chi_ct', 255);
            $table->string('thanh_pho', 100);
            $table->string('quan_huyen', 100);
            $table->boolean('mac_dinh')->default(false);

            $table->foreign('ma_kh')->references('ma_kh')->on('KHACHHANG');
        });

        // 3. Danh mục
        Schema::create('DANHMUC', function (Blueprint $table) {
            $table->string('ma_dm', 20)->primary();
            $table->string('ten_dm', 100);
        });

        // 4. Sản phẩm
        Schema::create('SANPHAM', function (Blueprint $table) {
            $table->string('ma_sp', 20)->primary();
            $table->string('ma_dm', 20);
            $table->string('ten_sp', 200);
            $table->text('mo_ta')->nullable();
            $table->boolean('trang_thai')->default(true);

            $table->foreign('ma_dm')->references('ma_dm')->on('DANHMUC');
        });

        // 5. Biến thể sản phẩm
        Schema::create('BIENTHE_SP', function (Blueprint $table) {
            $table->string('ma_bien_the', 20)->primary();
            $table->string('ma_sp', 20);
            $table->string('kich_thuoc', 10);
            $table->string('mau_sac', 50);
            $table->decimal('gia_ban', 15, 2);
            $table->integer('so_luong_ton')->default(0);

            $table->foreign('ma_sp')->references('ma_sp')->on('SANPHAM');
        });

        // 6. Bộ sưu tập
        Schema::create('BOSUUTAP', function (Blueprint $table) {
            $table->string('ma_bst', 20)->primary();
            $table->string('ten_bst', 200);
            $table->text('mo_ta')->nullable();
            $table->string('hinh_anh', 500)->nullable();
            $table->dateTime('thoi_gian_bd');
            $table->dateTime('thoi_gian_kt');
            $table->boolean('trang_thai')->default(true);
        });

        // 7. Chi tiết bộ sưu tập
        Schema::create('CHITIET_BST', function (Blueprint $table) {
            $table->string('ma_bst', 20);
            $table->string('ma_sp', 20);
            $table->primary(['ma_bst', 'ma_sp']);

            $table->foreign('ma_bst')->references('ma_bst')->on('BOSUUTAP');
            $table->foreign('ma_sp')->references('ma_sp')->on('SANPHAM');
        });

        // 8. Voucher
        Schema::create('VOUCHER', function (Blueprint $table) {
            $table->string('ma_voucher', 20)->primary();
            $table->string('ma_code', 50)->unique();
            $table->string('loai_giam', 10);
            $table->decimal('gia_tri_giam', 15, 2);
            $table->decimal('don_toi_thieu', 15, 2)->default(0);
            $table->integer('so_lan_su_dung_toi_da')->default(1);
            $table->integer('so_lan_da_dung')->default(0);
            $table->dateTime('ngay_bat_dau');
            $table->dateTime('ngay_het_han');
        });

        // 9. Flash Sale
        Schema::create('FLASH_SALE', function (Blueprint $table) {
            $table->string('ma_fs', 20)->primary();
            $table->string('ten_chuong_trinh', 200);
            $table->dateTime('thoi_gian_bat_dau');
            $table->dateTime('thoi_gian_ket_thuc');
        });

        // 10. Chi tiết Flash Sale
        Schema::create('CHITIET_FLASHSALE', function (Blueprint $table) {
            $table->string('ma_fs', 20);
            $table->string('ma_bien_the', 20);
            $table->decimal('gia_flash', 15, 2);
            $table->primary(['ma_fs', 'ma_bien_the']);

            $table->foreign('ma_fs')->references('ma_fs')->on('FLASH_SALE');
            $table->foreign('ma_bien_the')->references('ma_bien_the')->on('BIENTHE_SP');
        });

        // 11. Giỏ hàng
        Schema::create('GIOHANG', function (Blueprint $table) {
            $table->string('ma_gh', 20)->primary();
            $table->string('ma_kh', 20)->unique();
            $table->dateTime('updated_at')->useCurrent();

            $table->foreign('ma_kh')->references('ma_kh')->on('KHACHHANG');
        });

        // 12. Chi tiết giỏ hàng
        Schema::create('CHITIET_GIOHANG', function (Blueprint $table) {
            $table->string('ma_gh', 20);
            $table->string('ma_bien_the', 20);
            $table->integer('so_luong');
            $table->primary(['ma_gh', 'ma_bien_the']);

            $table->foreign('ma_gh')->references('ma_gh')->on('GIOHANG');
            $table->foreign('ma_bien_the')->references('ma_bien_the')->on('BIENTHE_SP');
        });

        // 13. Đơn hàng
        Schema::create('DONHANG', function (Blueprint $table) {
            $table->string('ma_dh', 20)->primary();
            $table->string('ma_kh', 20);
            $table->string('ma_dc', 20);
            $table->string('ma_voucher', 20)->nullable();
            $table->decimal('tong_tien', 15, 2);
            $table->dateTime('ngay_dat')->useCurrent();
            $table->string('trang_thai', 30)->default('CHO_XAC_NHAN');

            $table->foreign('ma_kh')->references('ma_kh')->on('KHACHHANG');
            $table->foreign('ma_dc')->references('ma_dc')->on('DIACHI_KH');
            $table->foreign('ma_voucher')->references('ma_voucher')->on('VOUCHER');
        });

        // 14. Chi tiết đơn hàng
        Schema::create('CHITIET_DH', function (Blueprint $table) {
            $table->string('ma_dh', 20);
            $table->string('ma_bien_the', 20);
            $table->integer('so_luong');
            $table->decimal('don_gia', 15, 2);
            $table->primary(['ma_dh', 'ma_bien_the']);

            $table->foreign('ma_dh')->references('ma_dh')->on('DONHANG');
            $table->foreign('ma_bien_the')->references('ma_bien_the')->on('BIENTHE_SP');
        });

        // 15. Lịch sử đơn hàng
        Schema::create('LICHSU_DONHANG', function (Blueprint $table) {
            $table->id();
            $table->string('ma_dh', 20);
            $table->string('trang_thai', 30);
            $table->dateTime('thoi_gian')->useCurrent();

            $table->foreign('ma_dh')->references('ma_dh')->on('DONHANG');
        });

        // 16. Đánh giá sản phẩm
        Schema::create('DANHGIA_SP', function (Blueprint $table) {
            $table->string('ma_danh_gia', 20)->primary();
            $table->string('ma_kh', 20);
            $table->string('ma_sp', 20);
            $table->string('ma_dh', 20);
            $table->integer('so_sao');
            $table->text('noi_dung')->nullable();
            $table->dateTime('created_at')->useCurrent();

            $table->foreign('ma_kh')->references('ma_kh')->on('KHACHHANG');
            $table->foreign('ma_sp')->references('ma_sp')->on('SANPHAM');
            $table->foreign('ma_dh')->references('ma_dh')->on('DONHANG');
        });
    }

    public function down(): void
    {
        // Drop theo thứ tự ngược lại (bảng con trước, bảng cha sau)
        Schema::dropIfExists('DANHGIA_SP');
        Schema::dropIfExists('LICHSU_DONHANG');
        Schema::dropIfExists('CHITIET_DH');
        Schema::dropIfExists('DONHANG');
        Schema::dropIfExists('CHITIET_GIOHANG');
        Schema::dropIfExists('GIOHANG');
        Schema::dropIfExists('CHITIET_FLASHSALE');
        Schema::dropIfExists('FLASH_SALE');
        Schema::dropIfExists('VOUCHER');
        Schema::dropIfExists('CHITIET_BST');
        Schema::dropIfExists('BOSUUTAP');
        Schema::dropIfExists('BIENTHE_SP');
        Schema::dropIfExists('SANPHAM');
        Schema::dropIfExists('DANHMUC');
        Schema::dropIfExists('DIACHI_KH');
        Schema::dropIfExists('KHACHHANG');
    }
};
