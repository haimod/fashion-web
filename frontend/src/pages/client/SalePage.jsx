import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Đã thêm import toast

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function SalePage() {
    const [vouchers, setVouchers] = useState([]);
    const [flashSales, setFlashSales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch dữ liệu Voucher và Flash Sale cùng lúc
        Promise.all([
            fetch(`${API_BASE}/client/vouchers`).then(res => res.json()),
            fetch(`${API_BASE}/client/home-data`).then(res => res.json())
        ])
        .then(([vouchersData, homeData]) => {
            if (Array.isArray(vouchersData)) setVouchers(vouchersData);
            if (homeData && homeData.flashSales) setFlashSales(homeData.flashSales);
            setIsLoading(false);
        })
        .catch(err => {
            console.error("Lỗi tải trang Sale:", err);
            setIsLoading(false);
        });
    }, []);

    // Format tiền Việt Nam
    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + 'đ';

    // Logic Copy mã Voucher đã được nâng cấp lên Toast
    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success(`Đã sao chép mã: ${code}`, {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: true,
            theme: "light",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9]">
                <div className="w-12 h-12 border-4 border-[#7c572d] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Lấy Flash Sale đầu tiên đang chạy (nếu có)
    const currentFlashSale = flashSales.length > 0 ? flashSales[0] : null;

    return (
        <div className="bg-[#f4fafd] font-['Be_Vietnam_Pro'] text-[#161d1f] antialiased animate-fade-in">
            <main className="pt-24">
                
                {/* --- HERO SECTION --- */}
                <section className="relative h-[60vh] md:h-[800px] flex items-center overflow-hidden bg-[#e8eff1]">
                    <div className="absolute inset-0 z-0">
                        <img 
                            className="w-full h-full object-cover opacity-90" 
                            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070" 
                            alt="Editorial Campaign"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#e8eff1]/60 to-transparent"></div>
                    </div>
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 w-full">
                        <div className="max-w-2xl">
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#7c572d] font-bold mb-4 block">Seasonal Edition</span>
                            <h1 className="text-5xl md:text-[5rem] font-black leading-[0.9] tracking-tighter text-[#161d1f] mb-6 md:mb-8 uppercase">
                                Ưu Đãi<br/>Đặc Quyền
                            </h1>
                            <p className="text-sm md:text-lg text-[#586062] max-w-md leading-relaxed mb-8 md:mb-10 font-medium">
                                Khám phá không gian mua sắm tinh tế với những đặc quyền giới hạn dành riêng cho tâm hồn mộ điệu. Quiet luxury, curated for you.
                            </p>
                            <a href="#vouchers" className="inline-flex bg-[#7c572d] text-white px-8 md:px-10 py-3 md:py-4 text-xs md:text-sm font-bold tracking-widest transition-all duration-300 hover:bg-[#161d1f] items-center gap-3">
                                LẤY MÃ NGAY
                                <span className="material-symbols-outlined text-sm">arrow_downward</span>
                            </a>
                        </div>
                    </div>
                    <div className="absolute bottom-12 right-12 text-right hidden lg:block">
                        <p className="text-[#7c572d] text-8xl font-black opacity-10 leading-none" style={{ WebkitTextStroke: '1px rgba(22, 29, 31, 0.2)', color: 'transparent' }}>
                            PROMOTIONS
                        </p>
                    </div>
                </section>

                {/* --- VOUCHERS SECTION (DYNAMIC) --- */}
                <section id="vouchers" className="py-24 md:py-32 bg-[#eef5f7]">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                        <div className="text-center mb-16 md:mb-20">
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#7c572d] font-bold mb-4 block">Members Only</span>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#161d1f] uppercase">Đặc Quyền Thành Viên</h2>
                            <p className="text-[#586062] mt-4 max-w-xl mx-auto text-sm md:text-base font-medium">Sở hữu những tấm thẻ quà tặng tinh tế, được thiết kế riêng cho những trải nghiệm mua sắm không giới hạn.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {vouchers.length > 0 ? vouchers.map((vc, index) => {
                                // Logic chia màu xen kẽ: Chẵn màu sáng (Silver), Lẻ màu đen (Gold/Dark)
                                const isDark = index % 2 !== 0;
                                
                                return (
                                    <div key={vc.ma_voucher} className={`p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group shadow-lg transition-all duration-500 hover:-translate-y-2 ${isDark ? 'bg-[#161d1f] text-white' : 'bg-white text-[#161d1f]'}`}>
                                        <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl transition-colors ${isDark ? 'bg-[#7c572d]/30' : 'bg-[#7c572d]/10 group-hover:bg-[#7c572d]/20'}`}></div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-10 md:mb-12">
                                                <div className={`text-2xl md:text-3xl font-black tracking-tighter ${isDark ? 'text-[#fecb97]' : 'text-[#7c572d]'}`}>
                                                    VIBE<br/>{vc.loai_giam === 'percent' ? 'COUPON' : 'TICKET'}
                                                </div>
                                                <span className={`material-symbols-outlined text-4xl ${isDark ? 'text-[#7c572d]' : 'text-[#827569]'}`}>
                                                    {vc.loai_giam === 'percent' ? 'local_activity' : 'workspace_premium'}
                                                </span>
                                            </div>
                                            <h3 className="text-3xl md:text-4xl font-black mb-2 uppercase">
                                                GIẢM {vc.loai_giam === 'percent' ? `${Number(vc.gia_tri_giam)}%` : formatPrice(vc.gia_tri_giam)}
                                            </h3>
                                            <p className={`text-xs md:text-sm uppercase tracking-widest font-bold ${isDark ? 'text-[#fecb97]/80' : 'text-[#586062]'}`}>
                                                Đơn tối thiểu {formatPrice(vc.don_toi_thieu)}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center mt-12 md:mt-16 relative z-10">
                                            <div className={`border px-4 py-2 text-xs font-mono tracking-widest font-bold ${isDark ? 'border-[#7c572d]/50 text-white/80' : 'border-[#827569]/30 text-[#586062]'}`}>
                                                {vc.ma_code}
                                            </div>
                                            <button 
                                                onClick={() => handleCopyCode(vc.ma_code)}
                                                className={`text-[10px] md:text-xs font-black tracking-[0.2em] uppercase flex items-center gap-2 group/btn ${isDark ? 'text-[#fecb97] hover:text-white' : 'text-[#7c572d] hover:text-[#161d1f]'}`}
                                            >
                                                SAO CHÉP
                                                <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">content_copy</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="col-span-2 text-center py-10 border-2 border-dashed border-[#827569]/30 text-[#586062] font-bold uppercase tracking-widest text-sm">
                                    Hiện chưa có chương trình khuyến mãi nào.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* --- FLASH SALE SECTION (DYNAMIC) --- */}
                {currentFlashSale && (
                    <section className="py-24 md:py-32 bg-[#f4fafd]">
                        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-8">
                                <div>
                                    <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#586062] font-bold mb-2 block">Flash Selection</span>
                                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#161d1f] uppercase">{currentFlashSale.ten_chuong_trinh}</h2>
                                </div>
                                <div className="flex items-center gap-4 border border-[#161d1f] p-3 md:p-4">
                                    <span className="text-[10px] uppercase tracking-widest text-[#161d1f] font-black">Kết thúc:</span>
                                    <span className="text-sm md:text-base font-black text-[#B71C1C] tracking-widest">
                                        {new Date(currentFlashSale.endTime).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                                {currentFlashSale.items.slice(0, 4).map(item => (
                                    <Link to={`/product/${item.ma_sp}`} key={item.ma_sp} className="group cursor-pointer">
                                        <div className="aspect-[3/4] overflow-hidden mb-4 md:mb-6 bg-[#F5F5F5] relative">
                                            <img 
                                                className="w-full h-full object-cover mix-blend-multiply transition-transform duration-1000 group-hover:scale-105" 
                                                src={`${STORAGE_URL}/${item.hinh_anh}`} 
                                                alt={item.ten_sp} 
                                            />
                                            <div className="absolute top-3 left-3 bg-[#161d1f] text-white px-3 py-1 text-[10px] font-black tracking-widest uppercase shadow-lg">
                                                -{item.phan_tram_giam}%
                                            </div>
                                        </div>
                                        <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#161d1f] mb-2 truncate">{item.ten_sp}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[#7c572d] font-black text-sm md:text-base">{formatPrice(item.gia_giam)}</span>
                                            <span className="text-[10px] md:text-xs text-[#586062] font-bold line-through opacity-50">{formatPrice(item.gia_goc)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
                
            </main>
        </div>
    );
}