import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function Settings() {
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    // 1. TẢI DỮ LIỆU TỪ TRÌNH DUYỆT (LOCAL STORAGE)
    const savedStoreConfig = JSON.parse(localStorage.getItem('vibeStoreConfig')) || {
        storeName: 'Vibe Studio - Flagship Store',
        currency: 'VND (₫)',
        contact: '28 Thảo Điền, Quận 2, TP. Hồ Chí Minh'
    };
    const savedAvatar = localStorage.getItem('vibeAdminAvatar') || "https://lh3.googleusercontent.com/aida-public/AB6AXuB_LGrvaRgUlcfhT98O7cHpoCj_2qMnc0-mTO6U2mi7642NF7-xVpLOqBa3ZT7R2yrV0Tf5o0QkaWlCY6i1tLOkg_DXYwZUuyaiaX9WiskxdOGpTa2o3ZCCMnmoCSlICWmOdHZAmb6dbhHkl6c8GNa_ZmWdFzEtm5Qunp-AlYpS4E4PwDhtkbRYXjtMHFE65RFDsbu4ojq3SkKwzQRkHlbMdJ4bY8X2YOjVPVgiKdrhhESA3lC5jpen6Gwoc5ZXD9i9RoZ5xPD2Umw9";

    // --- CÁC STATE ---
    const [profile, setProfile] = useState({
        fullName: 'Đang tải...',
        email: 'Đang tải...',
        password: ''
    });

    const [avatar, setAvatar] = useState(savedAvatar);
    const [storeConfig, setStoreConfig] = useState(savedStoreConfig);
    const [isEditingStore, setIsEditingStore] = useState(false); // Nút khóa/mở cấu hình cửa hàng

    // --- LẤY THÔNG TIN ADMIN TỪ DATABASE ---
 // --- LẤY THÔNG TIN ADMIN TỪ DATABASE ---
    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                // Gọi API thật từ Laravel
                const res = await fetch('http://127.0.0.1:8000/api/admin/profile'); 
                
                if (res.ok) {
                    const data = await res.json();
                    setProfile({
                        fullName: data.fullName + ' (Quản trị viên)', // Cộng thêm chữ cho ngầu
                        email: data.email,
                        password: '' // Mật khẩu luôn để trống vì lý do bảo mật
                    });
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin Admin:", error);
            }
        };
        fetchAdminProfile();
    }, []);

    // --- HÀM XỬ LÝ ---
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
                localStorage.setItem('vibeAdminAvatar', reader.result);
                toast.success('Đã cập nhật ảnh đại diện mới!');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        setIsLoading(true);
        setTimeout(() => {
            localStorage.setItem('vibeStoreConfig', JSON.stringify(storeConfig));
            setIsEditingStore(false);
            setIsLoading(false);
            toast.success('Đã lưu cài đặt Hệ thống thành công!');
        }, 800);
    };

    return (
        <div className="pt-8 pb-20 px-8 max-w-7xl mx-auto w-full animate-fade-in-up">
            <div className="mb-16">
                <p className="font-['Be_Vietnam_Pro'] uppercase text-[0.75rem] tracking-[0.2rem] text-primary mb-2">Trung tâm Điều khiển</p>
                <h1 className="text-5xl font-black tracking-tighter text-on-surface leading-none">Cài đặt Hệ thống</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
                <section className="lg:col-span-8">
                    <div className="space-y-16">
                        
                        {/* 01: THÔNG TIN CÁ NHÂN (LẤY TỪ DB) */}
                        <div>
                            <div className="flex items-baseline gap-4 mb-8">
                                <span className="text-3xl font-bold tracking-tighter text-on-surface">01</span>
                                <h3 className="font-['Be_Vietnam_Pro'] uppercase text-[0.85rem] tracking-[0.15rem] font-bold text-on-surface">Thông tin Quản trị viên</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                <div className="md:col-span-1">
                                    <div className="relative group aspect-square bg-surface-container-low overflow-hidden vibe-shadow">
                                        <img alt="Admin Avatar" className="w-full h-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" src={avatar} />
                                        <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => fileInputRef.current.click()} className="text-surface font-['Be_Vietnam_Pro'] uppercase text-[0.65rem] tracking-[0.1rem] border border-surface/30 px-4 py-2 hover:bg-surface/20 transition-colors">Thay đổi ảnh</button>
                                            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-8">
                                    <div className="relative">
                                        <label className="block font-['Be_Vietnam_Pro'] uppercase text-[0.65rem] tracking-[0.15rem] text-secondary mb-1">Họ và tên (Từ Database)</label>
                                        <input value={profile.fullName} readOnly className="w-full bg-transparent border-b border-outline-variant/30 py-2 outline-none font-black text-lg text-on-surface cursor-not-allowed uppercase tracking-widest" type="text" />
                                    </div>
                                    <div className="relative">
                                        <label className="block font-['Be_Vietnam_Pro'] uppercase text-[0.65rem] tracking-[0.15rem] text-secondary mb-1">Tài khoản Đăng nhập</label>
                                        <input value={profile.email} readOnly className="w-full bg-transparent border-b border-outline-variant/30 py-2 outline-none font-medium text-sm text-on-surface-variant cursor-not-allowed" type="email" />
                                    </div>
                                    <div className="relative">
                                        <label className="block font-['Be_Vietnam_Pro'] uppercase text-[0.65rem] tracking-[0.15rem] text-secondary mb-1">Cập nhật Mật khẩu (Trống nếu không đổi)</label>
                                        <input value={profile.password} onChange={(e) => setProfile({...profile, password: e.target.value})} placeholder="••••••••••••" className="w-full bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary focus:ring-0 outline-none transition-colors font-medium text-sm" type="password" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 02: CẤU HÌNH CỬA HÀNG (CÓ NÚT KHÓA/MỞ) */}
                        <div className="pt-12 bg-surface-container-lowest -mx-8 px-8 py-12 vibe-shadow border-t-4 border-primary">
                            <div className="flex justify-between items-baseline mb-8">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-3xl font-bold tracking-tighter text-on-surface">02</span>
                                    <h3 className="font-['Be_Vietnam_Pro'] uppercase text-[0.85rem] tracking-[0.15rem] font-bold text-on-surface">Thông tin Cửa hàng</h3>
                                </div>
                                <button 
                                    onClick={() => setIsEditingStore(!isEditingStore)} 
                                    className={`px-4 py-2 font-['Be_Vietnam_Pro'] uppercase text-[0.65rem] tracking-[0.15rem] font-bold transition-all ${isEditingStore ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-surface-container text-on-surface hover:bg-outline-variant/30'}`}
                                >
                                    {isEditingStore ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="relative">
                                    <label className="block font-['Be_Vietnam_Pro'] uppercase text-[0.65rem] tracking-[0.15rem] text-secondary mb-1">Tên cửa hàng</label>
                                    <input 
                                        disabled={!isEditingStore}
                                        value={storeConfig.storeName} onChange={(e) => setStoreConfig({...storeConfig, storeName: e.target.value})}
                                        className={`w-full py-2 font-medium text-sm transition-colors outline-none border-b ${!isEditingStore ? 'bg-transparent text-on-surface-variant/60 border-outline-variant/20 cursor-not-allowed' : 'bg-transparent text-on-surface border-primary'}`} type="text" 
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block font-['Be_Vietnam_Pro'] uppercase text-[0.65rem] tracking-[0.15rem] text-secondary mb-1">Đơn vị Tiền tệ</label>
                                    <select 
                                        disabled={!isEditingStore}
                                        value={storeConfig.currency} onChange={(e) => setStoreConfig({...storeConfig, currency: e.target.value})}
                                        className={`w-full py-2 font-medium text-sm transition-colors outline-none border-b ${!isEditingStore ? 'bg-transparent text-on-surface-variant/60 border-outline-variant/20 cursor-not-allowed appearance-none' : 'bg-transparent text-on-surface border-primary cursor-pointer'}`}
                                    >
                                        <option value="VND (₫)">VND (₫)</option>
                                        <option value="USD ($)">USD ($)</option>
                                    </select>
                                </div>
                                <div className="relative md:col-span-2">
                                    <label className="block font-['Be_Vietnam_Pro'] uppercase text-[0.65rem] tracking-[0.15rem] text-secondary mb-1">Địa chỉ Flagship Store</label>
                                    <input 
                                        disabled={!isEditingStore}
                                        value={storeConfig.contact} onChange={(e) => setStoreConfig({...storeConfig, contact: e.target.value})}
                                        className={`w-full py-2 font-medium text-sm transition-colors outline-none border-b ${!isEditingStore ? 'bg-transparent text-on-surface-variant/60 border-outline-variant/20 cursor-not-allowed' : 'bg-transparent text-on-surface border-primary'}`} type="text" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 03: CREATIVE DIRECTION (LẤP CHỖ TRỐNG CỰC NGHỆ) */}
                        <div className="pt-8">
                            <div className="flex items-baseline gap-4 mb-8">
                                <span className="text-3xl font-bold tracking-tighter text-on-surface">03</span>
                                <h3 className="font-['Be_Vietnam_Pro'] uppercase text-[0.85rem] tracking-[0.15rem] font-bold text-on-surface">Định hướng Sáng tạo</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-surface-container-low p-8 vibe-shadow">
                                <div className="space-y-4">
                                    <span className="material-symbols-outlined text-4xl text-primary opacity-50">format_quote</span>
                                    <h4 className="text-2xl font-black uppercase tracking-tighter leading-tight text-on-surface">
                                        "Thời trang không chỉ là áo quần, nó là cách bạn kiến tạo không gian sống của chính mình."
                                    </h4>
                                    <p className="text-[0.7rem] uppercase tracking-widest text-outline font-bold pt-4 border-t border-outline-variant/30">
                                        — Vibe Studio Core Value
                                    </p>
                                </div>
                                <div className="aspect-video bg-surface-container-high overflow-hidden">
                                    <img 
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_c8JB0-WDCzjiNRAP6f1YCjFLGVnUxNAJAG9yUSE3k0tdN98eqKu-4D-s2PDcTRJw1C9MNBvw6pMiQMSyqGb6MKXBijeA9nIzuutYVoKQx97LTuAbgn0xVE4aqaLMTvxWCEEUz-6zei1P6QAjRX9GQyZtgHjYEgesuV3ZgZcwaZKTcQpN5zKLqOIQrBdS8JSdzKQJIYyeXqLncFxtRQ0hQ-v3Tvv2mC1doZItGhSLK1ZyfMz18I98ypiJlHIndTzXXb_ra0ox7Jkr" 
                                        alt="Creative Moodboard" 
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* CỘT PHẢI: STICKY SIDEBAR & ẢNH BANNER */}
                <aside className="lg:col-span-4">
                    <div className="sticky top-28 space-y-8">
                        {/* Box Lưu */}
                        <div className="p-8 bg-on-surface text-surface vibe-shadow">
                            <h4 className="font-['Be_Vietnam_Pro'] uppercase text-[0.75rem] tracking-[0.2rem] mb-4 opacity-70">Tình trạng lưu trữ</h4>
                            <p className="text-xl font-bold mb-8 leading-tight">Bạn có thể cấu hình Hệ thống tại đây.</p>
                            <div className="space-y-4">
                                <button 
                                    onClick={handleSaveChanges} 
                                    disabled={isLoading || !isEditingStore} 
                                    className="w-full bg-primary py-4 font-['Be_Vietnam_Pro'] uppercase text-[0.75rem] tracking-[0.15rem] font-black hover:bg-primary-container hover:text-on-primary-container transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                                </button>
                            </div>
                        </div>

                        {/* ẢNH BANNER ĐÃ ĐƯỢC MANG TRỞ LẠI */}
                        <div className="aspect-[4/5] relative overflow-hidden group vibe-shadow">
                            <img 
                                alt="Collection Banner" 
                                className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-110" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdtO2VFa_Vum2RdxomzM1b6nAtJrpAbkbbRjsPwHMaj9bBIUP5xkmTTNGKQCtnPOr2_js1OngnGRs11MmRlw5zksqeO_Pn1IoRnpa5QlT6F55Z70nT6VgOdmVgbYsBxpgWuSEyFUQrWHuYrdwJziTtsxbzhjH1Q41t0V3Oq5Cxda_TM8W8N4k5sLI4RjyNr7mskn0xXAVhccplv08XLKaZn9DR5jhevpG39b2j6MP-B6P0LYO1Vmy4qp0Ou0MtsZGaB8dIO3Da6dXe"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/20 to-transparent p-6 flex flex-col justify-end">
                                <p className="text-surface font-['Be_Vietnam_Pro'] uppercase text-[0.6rem] tracking-[0.2rem]">Hệ thống Quản trị</p>
                                <p className="text-surface text-2xl font-black tracking-tighter uppercase mt-1">Vibe Studio 2026</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}