<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use Illuminate\Support\Facades\Hash;

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
}