import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function AdminRoute() {
  const { user, token } = useSelector(state => state.auth);

  // 1. Nếu không có token (chưa đăng nhập) -> Đá văng ra trang Login
  if (!token) {
      toast.warning("Vui lòng đăng nhập để vào trang quản trị!");
      return <Navigate to='/login' replace />;
  }

  // 2. Nếu đăng nhập rồi nhưng không phải Admin -> Đá văng ra Trang chủ
  if (user?.role !== 'admin') {
      toast.error("Khu vực tuyệt mật! Khách hàng không có quyền truy cập.");
      return <Navigate to='/' replace />;
  }

  // 3. Đúng chuẩn Admin -> Mở cửa cho hiển thị các Route con bên trong
  return <Outlet />;
}