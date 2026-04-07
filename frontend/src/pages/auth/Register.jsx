import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Register() {
  // Quản lý state cho form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate cơ bản ở Frontend
    if (!agreed) {
      toast.warning("Bạn cần đồng ý với Điều khoản & Điều kiện.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Tạm thời log ra để kiểm tra
    const registerData = {
      tenkh: name, // Đặt tên key giống DB để sau này gửi API cho tiện
      email,
      sodt: phone,
      matkhau: password
    };
    
    console.log("Dữ liệu đăng ký:", registerData);
    toast.info("Đang xử lý đăng ký...");

    // Gọi API ở đây (chúng ta sẽ làm ở bước sau)
    // Nếu thành công -> chuyển hướng về Login
    // navigate('/login');
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      
      {/* Brand Visual Side (Editorial Focus) */}
      <section className="hidden md:flex md:w-5/12 lg:w-1/2 h-full fixed left-0 top-0 bottom-0 bg-surface-container-low flex-col justify-between p-12 overflow-hidden">
        <div className="z-10">
          <h1 className="text-3xl font-black tracking-tighter text-on-background">VIBE STUDIO</h1>
        </div>
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover grayscale opacity-90 contrast-125 transition-transform duration-1000 hover:scale-105" 
            alt="High-fashion editorial portrait" 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
        </div>
        <div className="z-10">
          <p className="text-[0.65rem] tracking-[0.15rem] uppercase text-on-surface font-bold">THE URBAN CURATOR SERIES / 024</p>
        </div>
      </section>

      {/* Form Side */}
      <section className="flex-1 md:ml-[41.666667%] lg:ml-[50%] min-h-screen bg-surface flex flex-col justify-center items-center px-6 py-20">
        <div className="w-full max-w-md space-y-12">
          
          {/* Header */}
          <div className="space-y-4">
            <div className="md:hidden">
              <h1 className="text-2xl font-black tracking-tighter text-on-background mb-8">VIBE STUDIO</h1>
            </div>
            <h2 className="text-4xl font-bold tracking-[-2%] text-on-background">THAM GIA CÙNG CHÚNG TÔI</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
              Tạo tài khoản để trải nghiệm không gian thời trang giám tuyển và nhận các đặc quyền riêng biệt.
            </p>
          </div>

          {/* Registration Form */}
          <form className="space-y-8" onSubmit={handleRegister}>
            {/* Input Group */}
            <div className="space-y-6">
              
              <div className="group relative">
                <label className="block text-[0.65rem] tracking-[0.15rem] uppercase font-bold text-on-surface-variant group-focus-within:text-primary transition-colors">
                  HỌ VÀ TÊN
                </label>
                <input 
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-3 px-0 focus:ring-0 focus:border-primary text-on-surface placeholder:text-outline-variant/50 transition-all outline-none" 
                  placeholder="NGUYỄN VĂN A" 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="group relative">
                <label className="block text-[0.65rem] tracking-[0.15rem] uppercase font-bold text-on-surface-variant group-focus-within:text-primary transition-colors">
                  EMAIL
                </label>
                <input 
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-3 px-0 focus:ring-0 focus:border-primary text-on-surface placeholder:text-outline-variant/50 transition-all outline-none" 
                  placeholder="NAME@EXAMPLE.COM" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="group relative">
                <label className="block text-[0.65rem] tracking-[0.15rem] uppercase font-bold text-on-surface-variant group-focus-within:text-primary transition-colors">
                  SỐ ĐIỆN THOẠI
                </label>
                <input 
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-3 px-0 focus:ring-0 focus:border-primary text-on-surface placeholder:text-outline-variant/50 transition-all outline-none" 
                  placeholder="09xx xxx xxx" 
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative">
                  <label className="block text-[0.65rem] tracking-[0.15rem] uppercase font-bold text-on-surface-variant group-focus-within:text-primary transition-colors">
                    MẬT KHẨU
                  </label>
                  <input 
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-3 px-0 focus:ring-0 focus:border-primary text-on-surface placeholder:text-outline-variant/50 transition-all outline-none" 
                    placeholder="••••••••" 
                    type="password"
                    required
                    minLength="6"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="group relative">
                  <label className="block text-[0.65rem] tracking-[0.15rem] uppercase font-bold text-on-surface-variant group-focus-within:text-primary transition-colors">
                    XÁC NHẬN MẬT KHẨU
                  </label>
                  <input 
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-3 px-0 focus:ring-0 focus:border-primary text-on-surface placeholder:text-outline-variant/50 transition-all outline-none" 
                    placeholder="••••••••" 
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 group cursor-pointer" onClick={() => setAgreed(!agreed)}>
              <div className="relative flex items-center h-5">
                <input 
                  className="h-4 w-4 border-outline-variant text-primary focus:ring-0 rounded-none bg-transparent cursor-pointer" 
                  type="checkbox"
                  checked={agreed}
                  readOnly
                />
              </div>
              <label className="text-[0.65rem] tracking-[0.05rem] uppercase text-on-surface-variant leading-tight cursor-pointer">
                TÔI ĐỒNG Ý VỚI <Link to="#" className="text-on-surface font-bold hover:text-primary transition-colors underline underline-offset-4">ĐIỀU KHOẢN & ĐIỀU KIỆN</Link> CỦA VIBE STUDIO.
              </label>
            </div>

            {/* Actions */}
            <div className="space-y-6 pt-4">
              <button 
                className="w-full bg-primary hover:bg-surface-tint text-on-primary py-5 text-[0.75rem] tracking-[0.2rem] font-bold uppercase transition-all duration-300 active:scale-[0.98] shadow-[0px_10px_30px_rgba(124,87,45,0.15)]" 
                type="submit"
              >
                TẠO TÀI KHOẢN
              </button>

              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                <p className="text-[0.65rem] tracking-[0.1rem] uppercase text-on-surface-variant">BẠN ĐÃ CÓ TÀI KHOẢN?</p>
                <Link to="/login" className="text-[0.65rem] tracking-[0.15rem] font-black uppercase text-on-surface hover:text-primary transition-colors underline underline-offset-8">
                  ĐĂNG NHẬP
                </Link>
              </div>
            </div>
          </form>

          {/* Metadata/Footer Info */}
          <div className="pt-12 flex flex-col gap-4">
            <div className="flex gap-4">
              <Link to="#" className="text-[0.6rem] tracking-[0.2rem] text-outline-variant hover:text-primary transition-colors font-bold uppercase">INSTAGRAM</Link>
              <Link to="#" className="text-[0.6rem] tracking-[0.2rem] text-outline-variant hover:text-primary transition-colors font-bold uppercase">ARCHIVE</Link>
            </div>
          </div>
        </div>

        {/* Footer - Simplified for focus */}
        <footer className="w-full bg-surface pt-8 mt-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[0.55rem] tracking-[0.15rem] uppercase text-outline-variant">© 2024 VIBE STUDIO. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <span className="text-[0.55rem] tracking-[0.15rem] uppercase text-outline-variant cursor-pointer hover:text-primary">QUYỀN RIÊNG TƯ</span>
            <span className="text-[0.55rem] tracking-[0.15rem] uppercase text-outline-variant cursor-pointer hover:text-primary">ĐIỀU KHOẢN</span>
          </div>
        </footer>
      </section>

    </main>
  );
}