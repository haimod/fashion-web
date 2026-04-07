<?php

namespace App\Models;

// Bắt buộc đổi từ Model thường sang Authenticatable để dùng được Auth/Sanctum
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Thêm dòng này để tạo token API

class Customer extends Authenticatable
{
    use HasApiTokens, Notifiable;

    // Khai báo tên bảng theo đúng file SQL của bạn
    protected $table = 'KHACHHANG';
    
    // Khai báo khóa chính
    protected $primaryKey = 'ma_kh';
    
    // Khóa chính là chuỗi (VARCHAR) nên keyType là string
    protected $keyType = 'string';
    
    // Tắt tự động tăng (auto-increment) vì mã khách hàng là chuỗi (ví dụ: KH001)
    public $incrementing = false;

    // Tắt timestamps mặc định của Laravel (created_at, updated_at)
    // Vì trong database bạn chỉ dùng created_at (DEFAULT GETDATE()) và không có updated_at
    public $timestamps = false;

    // Các trường được phép thêm/sửa hàng loạt (Mass Assignment)
    protected $fillable = [
        'ma_kh',
        'tenkh',
        'email',
        'sodt',
        'matkhau',
        'trang_thai',
        'role',
    ];

    // Các trường cần giấu đi khi trả dữ liệu ra API (Bảo mật)
    protected $hidden = [
        'matkhau',
    ];

    /**
     * Ghi đè phương thức lấy mật khẩu của Laravel.
     * Mặc định Laravel tìm cột 'password', nhưng database của bạn tên là 'matkhau'
     */
    public function getAuthPassword()
    {
        return $this->matkhau;
    }
}