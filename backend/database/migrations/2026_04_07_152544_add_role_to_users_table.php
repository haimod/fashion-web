<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('KHACHHANG', function (Blueprint $table) {
            // Thêm cột role, mặc định ai đăng ký cũng là 'customer'
            // Đặt nó đứng ngay sau cột 'password' cho gọn gàng
            $table->string('role')->default('customer')->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('KHACHHANG', function (Blueprint $table) {
            // Lệnh này dùng để xóa cột nếu bạn muốn rollback (quay xe)
            $table->dropColumn('role');
            
            if (Schema::hasColumn('KHACHHANG', 'role')) {
            Schema::table('KHACHHANG', function (Blueprint $table) {
                $table->dropColumn('role');
            });
        }
        });
    }
};