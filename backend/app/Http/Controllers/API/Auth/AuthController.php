<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
class AuthController extends Controller
{
    /**
     * Xử lý Đăng nhập cho Khách hàng
     */
    public function login(Request $request)
    {
        // 1. Kiểm tra (Validate) dữ liệu người dùng gửi lên
        $request->validate([
            'identity' => 'required|string', // identity có thể là email hoặc số điện thoại
            'password' => 'required|string',
        ]);

        // 2. Tìm khách hàng trong Database
        // Tìm dòng nào có email = identity HOẶC sodt = identity
        $customer = Customer::where('email', $request->identity)
                            ->orWhere('sodt', $request->identity)
                            ->first();

        // 3. Kiểm tra tồn tại và so sánh mật khẩu
        // Hash::check sẽ lấy mật khẩu người dùng nhập, mã hóa nó và so sánh với chuỗi đã mã hóa trong CSDL
        if (!$customer || !Hash::check($request->password, $customer->matkhau)) {
            return response()->json([
                'success' => false,
                'message' => 'Email/Số điện thoại hoặc mật khẩu không chính xác.',
            ], 401); // 401 là mã lỗi "Unauthorized" (Không có quyền truy cập)
        }

        // 4. Kiểm tra trạng thái tài khoản
        // Đảm bảo khách hàng không bị Admin khóa tài khoản (trang_thai = 1)
        if ($customer->trang_thai == 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH.',
            ], 403); // 403 là mã lỗi "Forbidden" (Bị cấm)
        }

        // 5. Tạo Access Token bằng Sanctum
        $token = $customer->createToken('CustomerAccessToken')->plainTextToken;

        // 6. Trả về kết quả thành công cho Frontend
        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công!',
            'data' => [
                'user' => $customer,
                'token' => $token // Frontend sẽ lưu token này lại
            ]
        ], 200); // 200 là mã "OK"
    }

    public function register(Request $request)
    {
        // 1. Kiểm tra (Validate) dữ liệu
        $request->validate([
            'tenkh' => 'required|string|max:100',
            // unique:KHACHHANG,email nghĩa là email không được trùng trong bảng KHACHHANG
            'email' => 'required|email|unique:KHACHHANG,email|max:100',
            'sodt'  => 'required|string|unique:KHACHHANG,sodt|max:10',
            'matkhau' => 'required|string|min:6',
        ], [
            // Tùy chỉnh câu thông báo lỗi cho thân thiện
            'email.unique' => 'Email này đã được sử dụng.',
            'sodt.unique' => 'Số điện thoại này đã được sử dụng.',
            'matkhau.min' => 'Mật khẩu phải có ít nhất 6 ký tự.'
        ]);

        // 2. Tạo Mã Khách Hàng (ma_kh) tự động
        // Vì cột ma_kh của bạn là VARCHAR(20) và không tự tăng, ta cần tự sinh mã.
        // Ví dụ: KH + timestamp (vd: KH1712456789)
        $maKh = 'KH' . time() . rand(10, 99); 

        // 3. Tạo record mới trong Database
        $customer = Customer::create([
            'ma_kh' => $maKh,
            'tenkh' => $request->tenkh,
            'email' => $request->email,
            'sodt'  => $request->sodt,
            // BẮT BUỘC phải băm (hash) mật khẩu trước khi lưu
            'matkhau' => Hash::make($request->matkhau), 
            'trang_thai' => 1, // 1 là tài khoản đang hoạt động
        ]);

        // 4. (Tùy chọn) Đăng nhập luôn cho user sau khi đăng ký thành công
        $token = $customer->createToken('CustomerAccessToken')->plainTextToken;

        // 5. Trả về kết quả
        return response()->json([
            'success' => true,
            'message' => 'Đăng ký tài khoản thành công!',
            'data' => [
                'user' => $customer,
                'token' => $token
            ]
        ], 201); // 201 là HTTP status "Created" (Đã tạo thành công)
    }
}