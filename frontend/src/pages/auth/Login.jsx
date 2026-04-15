import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import authService from '../../services/authService';
import { setCredentials } from '../../store/slices/authSlice';

export default function Login() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      toast.info("Đang xử lý đăng nhập...");
      const data = await authService.login({
        identity: identity,
        password: password
      });

      if (data.success) {
        toast.success(data.message);
        
        // Lưu vào Redux store
        dispatch(setCredentials({ user: data.data.user, token: data.data.token }));
        
        // Kiểm tra role để chuyển hướng cho đúng
        const userRole = data.data.user.role;
        
        if (userRole === 'admin') {
            localStorage.setItem('admin_token', data.data.token);
            localStorage.setItem('role', 'admin');
            navigate('/admin');
        } else {
            localStorage.setItem('role', 'customer');
            navigate('/');
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Đăng nhập thất bại!";
      toast.error(errorMsg);
    }
  };

  return (
    <main className="relative h-screen w-full flex items-center justify-center p-4 md:p-0 bg-surface text-on-surface overflow-hidden">
      
      {/* 🚨 NÚT QUAY LẠI TRANG CHỦ (FLOATING TOP-LEFT) 🚨 */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 md:top-10 md:left-12 z-50 flex items-center gap-3 text-white/80 hover:text-white transition-all duration-300 group"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-sm group-hover:bg-black/40 transition-colors">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
            west
          </span>
        </div>
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.2rem] hidden md:block drop-shadow-md">
          Trang chủ
        </span>
      </Link>

      {/* Background Editorial Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          alt="Editorial Background" 
          className="w-full h-full object-cover object-center grayscale-[20%] opacity-90" 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-on-background/20 to-transparent"></div>
      </div>

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-[480px] glass-panel p-8 md:p-12 shadow-[0px_10px_30px_rgba(26,28,28,0.06)] border border-outline-variant/10 bg-white/95 backdrop-blur-md">
        
        {/* Brand Anchor */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-black tracking-tighter text-on-background mb-2">VIBE STUDIO</h1>
          <p className="font-['Be_Vietnam_Pro'] text-[0.65rem] tracking-[0.15rem] uppercase text-on-surface-variant">
            Thế giới của sự thanh lịch
          </p>
        </div>

        {/* Header */}
        <div className="mb-10 text-left">
          <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.15rem] text-primary mb-1">ĐĂNG NHẬP</h2>
          <p className="text-sm text-on-surface-variant">Chào mừng bạn quay lại không gian của chúng tôi.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-8">
          {/* Email/Phone Input */}
          <div className="relative">
            <label className="block text-[0.65rem] font-bold uppercase tracking-[0.15rem] text-on-surface-variant mb-2" htmlFor="identity">
              Email hoặc Số điện thoại
            </label>
            <input 
              className="w-full bg-transparent border-0 border-b border-outline-variant/40 py-3 px-0 focus:ring-0 focus:border-primary text-on-surface placeholder:text-on-surface-variant/40 transition-colors outline-none" 
              id="identity" 
              name="identity" 
              placeholder="vibestudio@vibe.vn" 
              required 
              type="text"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="flex justify-between items-end mb-2">
              <label className="block text-[0.65rem] font-bold uppercase tracking-[0.15rem] text-on-surface-variant" htmlFor="password">
                Mật khẩu
              </label>
              <Link to="/forgot-password" className="text-[0.65rem] font-bold uppercase tracking-[0.1rem] text-primary hover:text-primary/80 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input 
                className="w-full bg-transparent border-0 border-b border-outline-variant/40 py-3 px-0 focus:ring-0 focus:border-primary text-on-surface placeholder:text-on-surface-variant/40 transition-colors outline-none" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface cursor-pointer" 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Primary CTA */}
          <button 
            className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-white py-4 text-[0.75rem] font-bold uppercase tracking-[0.2rem] transition-all duration-300 shadow-[0px_4px_15px_rgba(124,87,45,0.2)]" 
            type="submit"
          >
            Đăng Nhập
          </button>
        </form>

        {/* Social Logins */}
        <div className="mt-12">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/20"></div>
            </div>
            <span className="relative px-4 bg-white text-[0.6rem] font-bold uppercase tracking-[0.15rem] text-on-surface-variant">
              Hoặc tiếp tục với
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="cursor-pointer flex items-center justify-center py-4 border border-outline-variant/40 hover:bg-surface-container-low transition-colors duration-300 group">
              <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="currentColor"></path>
              </svg>
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.1rem]">Google</span>
            </button>
            <button className="cursor-pointer flex items-center justify-center py-4 border border-outline-variant/40 hover:bg-surface-container-low transition-colors duration-300 group">
              <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
              </svg>
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.1rem]">Facebook</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center">
          <p className="text-[0.65rem] tracking-[0.1rem] uppercase text-on-surface-variant">
            Chưa có tài khoản? 
            <Link to="/register" className="font-bold text-primary hover:underline ml-2">Đăng ký ngay</Link>
          </p>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="hidden lg:block absolute bottom-12 right-12 text-right z-10">
        <span className="text-[5rem] font-black leading-none text-white/10 select-none pointer-events-none">CURATED</span>
        <div className="mt-2 text-[0.6rem] font-bold uppercase tracking-[0.4rem] text-white/50">
          VIBE STUDIO EDITORIAL ©2026
        </div>
      </div>

      {/* Bottom Action Message */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 z-20">
        <div className="flex items-center space-x-4 bg-black/80 backdrop-blur-sm text-white px-6 py-3 shadow-xl">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.1rem]">Kết nối bảo mật 256-bit</span>
        </div>
      </div>
    </main>
  );
}