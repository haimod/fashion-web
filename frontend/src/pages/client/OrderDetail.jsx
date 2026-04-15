import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchOrderDetail = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login'); return;
            }

            try {
                const res = await fetch(`${API_BASE}/client/orders/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrderData(data);
                } else {
                    toast.error("Không tìm thấy đơn hàng!");
                    navigate('/orders');
                }
            } catch (error) {
                toast.error("Lỗi kết nối server!");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderDetail();
    }, [id, navigate]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#7c572d] border-t-transparent rounded-full animate-spin"></div></div>;
    if (!orderData) return null;

    const { order, address, voucher, items } = orderData;

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + ' VNĐ';
    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return `Ngày ${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
    };

    // Logic tính trạng thái Stepper
    const statuses = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_GIAO', 'DA_GIAO'];
    const currentStep = statuses.indexOf(order.trang_thai) >= 0 ? statuses.indexOf(order.trang_thai) : 0;
    
    // Tính tổng tiền sản phẩm (chưa trừ voucher)
    const subTotal = items.reduce((sum, item) => sum + (item.don_gia * item.so_luong), 0);
    const discount = subTotal - order.tong_tien; // Số tiền đã giảm

    return (
        <div className="bg-[#f4fafd] text-[#161d1f] font-['Be_Vietnam_Pro'] antialiased min-h-screen pt-32 pb-20">
            <main className="max-w-[1200px] mx-auto px-6 md:px-12">
                
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-[0.75rem] font-medium text-[#586062] uppercase tracking-[0.2em] mb-4 print:hidden">
                        <Link to="/orders" className="hover:text-[#7c572d] transition-colors cursor-pointer">Lịch sử đơn hàng</Link> 
                        <span>/</span> 
                        <span className="text-[#7c572d]">Chi tiết</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#161d1f] mb-2">#{order.ma_dh}</h1>
                            <p className="text-[#50453b] font-medium">Đặt {formatDate(order.ngay_dat || order.created_at)}</p>
                        </div>
                        {/* NÚT IN HÓA ĐƠN */}
                        <button 
                            onClick={() => window.print()}
                            className="bg-[#7c572d] text-white px-8 py-3 rounded-md text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer shadow-md print:hidden"
                        >
                            In hóa đơn
                        </button>
                    </div>
                </div>

                {/* Shipping Status Stepper */}
                <section className="bg-white border border-[#d4c4b7]/30 shadow-sm rounded-xl p-8 mb-12 relative overflow-hidden print:hidden">
                    <div className="relative z-10">
                        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#7c572d] mb-10">Trạng thái giao hàng</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                            {/* Progress Line */}
                            <div className="hidden md:block absolute top-4 left-0 w-full h-[2px] bg-[#d4c4b7]/30 z-0">
                                <div className="h-full bg-[#7c572d] transition-all duration-500" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
                            </div>
                            
                            {/* Steps */}
                            {['Đã đặt hàng', 'Đã xác nhận', 'Đang giao', 'Đã giao'].map((stepName, idx) => {
                                const isActive = idx === currentStep;
                                const isCompleted = idx < currentStep;
                                const isPending = idx > currentStep;
                                
                                return (
                                    <div key={idx} className={`flex md:flex-col items-center gap-4 relative z-10 ${isPending ? 'opacity-40' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                                            ${isCompleted ? 'bg-[#7c572d] border-[#7c572d] text-white' : isActive ? 'bg-white border-[#7c572d] text-[#7c572d]' : 'bg-[#eef5f7] border-[#d4c4b7] text-[#586062]'}`}>
                                            {isCompleted ? <span className="material-symbols-outlined text-sm">check</span> : 
                                             isActive && idx === 2 ? <span className="material-symbols-outlined text-sm animate-pulse">local_shipping</span> :
                                             <span className="text-xs font-bold">{idx + 1}</span>}
                                        </div>
                                        <div className="text-left md:text-center">
                                            <p className={`text-xs font-bold uppercase tracking-wider ${isActive || isCompleted ? 'text-[#161d1f]' : 'text-[#586062]'}`}>{stepName}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">
                    
                    {/* CỘT TRÁI: Sản phẩm */}
                    <div className="xl:col-span-2 space-y-6">
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#161d1f] border-b border-[#d4c4b7]/30 pb-4">Sản phẩm đã chọn</h2>
                        
                        <div className="space-y-4">
                            {items.map((item, idx) => (
                                <div key={idx} className="group flex gap-6 bg-white border border-[#d4c4b7]/20 p-6 rounded-xl transition-all duration-300 hover:shadow-lg">
                                    <div className="w-24 md:w-32 h-32 md:h-40 bg-[#f3f3f3] overflow-hidden rounded-md flex-shrink-0 cursor-pointer" onClick={() => navigate(`/product/${item.ma_sp}`)}>
                                        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={`${STORAGE_URL}/${item.hinh_anh}`} alt={item.ten_sp} />
                                    </div>
                                    <div className="flex flex-col justify-between flex-1 py-1">
                                        <div>
                                            <h3 className="text-base md:text-lg font-bold tracking-tight text-[#161d1f] mb-1 cursor-pointer hover:text-[#7c572d]" onClick={() => navigate(`/product/${item.ma_sp}`)}>{item.ten_sp}</h3>
                                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[0.65rem] uppercase tracking-widest text-[#586062] font-bold">Size:</span>
                                                    <span className="text-sm font-medium">{item.kich_thuoc}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[0.65rem] uppercase tracking-widest text-[#586062] font-bold">Màu:</span>
                                                    <span className="text-sm font-medium">{item.mau_sac}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[0.65rem] uppercase tracking-widest text-[#586062] font-bold">SL:</span>
                                                    <span className="text-sm font-medium">{item.so_luong}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className="text-base md:text-lg font-extrabold text-[#7c572d]">{formatPrice(item.don_gia)}</p>
                                            <button className="text-[0.7rem] uppercase font-bold tracking-widest text-[#586062] hover:text-[#7c572d] transition-colors cursor-pointer print:hidden">Đánh giá</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 flex items-center justify-between print:hidden">
                            {/* NÚT QUAY LẠI TRANG CHỦ */}
                            <Link to="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7c572d] group cursor-pointer hover:opacity-80">
                                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Quay lại trang chủ
                            </Link>
                            
                            {/* NÚT HỖ TRỢ */}
                            <a 
                                href="mailto:support@vibestudio.vn" 
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#586062] hover:text-[#7c572d] cursor-pointer underline underline-offset-4 decoration-[#d4c4b7] transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">help_outline</span> Cần hỗ trợ?
                            </a>
                        </div>
                    </div>

                    {/* CỘT PHẢI: Summary & Shipping */}
                    <div className="space-y-8">
                        
                        {/* Info Card */}
                        <div className="bg-white border border-[#d4c4b7]/30 p-8 rounded-xl shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#161d1f] mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">location_on</span> Thông tin giao hàng
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[0.65rem] uppercase tracking-widest text-[#586062] font-bold mb-1">Người nhận</p>
                                    <p className="text-sm font-bold text-[#161d1f]">{address?.ten_nguoi_nhan}</p>
                                </div>
                                <div>
                                    <p className="text-[0.65rem] uppercase tracking-widest text-[#586062] font-bold mb-1">Số điện thoại</p>
                                    <p className="text-sm text-[#161d1f] font-medium">{address?.sdt_nguoi_nhan}</p>
                                </div>
                                <div>
                                    <p className="text-[0.65rem] uppercase tracking-widest text-[#586062] font-bold mb-1">Địa chỉ</p>
                                    <p className="text-sm text-[#161d1f] leading-relaxed">
                                        {address?.dia_chi_ct}, {address?.quan_huyen}, {address?.thanh_pho}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Card */}
                        <div className="bg-white border border-[#d4c4b7]/30 p-8 rounded-xl shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#161d1f] mb-6 border-b border-[#d4c4b7]/30 pb-4">Tóm tắt thanh toán</h3>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#50453b]">Tạm tính</span>
                                    <span className="font-medium text-[#161d1f]">{formatPrice(subTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#50453b]">Phí vận chuyển</span>
                                    <span className="font-medium text-[#161d1f]">Miễn phí</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[#50453b]">Giảm giá ({voucher?.ma_code})</span>
                                        <span className="text-[#ba1a1a] font-medium">- {formatPrice(discount)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t border-[#d4c4b7]/30">
                                <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#161d1f]">Tổng thanh toán</span>
                                <span className="text-2xl font-extrabold text-[#7c572d] tracking-tighter">{formatPrice(order.tong_tien)}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}