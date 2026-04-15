import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function OrderDetail() {
    const { id: ma_dh } = useParams();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- State cho Modal Đánh Giá ---
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [productToReview, setProductToReview] = useState(null);
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewContent, setReviewContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchOrderDetail = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/client/orders/${ma_dh}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrderData(data);
            } else {
                toast.error("Không thể tải chi tiết đơn hàng");
                navigate('/orders');
            }
        } catch (error) {
            toast.error("Lỗi kết nối máy chủ");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetail();
        window.scrollTo(0, 0);
    }, [ma_dh]);

    // --- Hàm Submit Đánh Giá ---
    const handleSubmitReview = async () => {
        if (!reviewContent.trim()) {
            toast.warning("Vui lòng nhập nội dung đánh giá!");
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/client/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ma_dh: ma_dh,
                    ma_sp: productToReview.ma_sp,
                    so_sao: rating,
                    noi_dung: reviewContent
                })
            });

            if (res.ok) {
                toast.success("Đánh giá sản phẩm thành công!");
                setIsReviewModalOpen(false);
                setReviewContent('');
                setRating(5);
                fetchOrderDetail(); // Tải lại để cập nhật trạng thái "Đã đánh giá"
            } else {
                const err = await res.json();
                toast.error(err.error || "Lỗi khi gửi đánh giá");
            }
        } catch (error) {
            toast.error("Lỗi kết nối máy chủ!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + '₫';

    const getStatusStyle = (status) => {
        switch(status) {
            case 'CHO_XAC_NHAN': return { text: 'Chờ xác nhận', bg: 'bg-[#e8e8e8]', textCol: 'text-[#50453b]' };
            case 'DA_XAC_NHAN': return { text: 'Đã xác nhận', bg: 'bg-[#7c572d]/10', textCol: 'text-[#7c572d]' };
            case 'DANG_GIAO': return { text: 'Đang giao', bg: 'bg-[#586062]/10', textCol: 'text-[#586062]' };
            case 'DA_GIAO': return { text: 'Đã giao thành công', bg: 'bg-green-100', textCol: 'text-green-800' };
            case 'DA_HUY': return { text: 'Đã hủy', bg: 'bg-[#ba1a1a]/10', textCol: 'text-[#ba1a1a]' };
            default: return { text: status, bg: 'bg-[#e8e8e8]', textCol: 'text-[#50453b]' };
        }
    };

    if (isLoading) return <div className="min-h-screen pt-32 flex justify-center text-[#7c572d] font-bold uppercase tracking-widest animate-pulse">Đang tải dữ liệu...</div>;
    if (!orderData) return null;

    const { order, items } = orderData;
    const statusInfo = getStatusStyle(order.trang_thai);

    return (
        <div className="bg-[#f4fafd] text-[#161d1f] font-['Be_Vietnam_Pro'] antialiased animate-fade-in min-h-screen relative">
            <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[1200px] mx-auto">
                
                {/* Nút Quay Lại */}
                <Link to="/orders" className="inline-flex items-center gap-2 text-[#586062] hover:text-[#7c572d] transition-colors mb-10 text-xs font-bold uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Quay lại lịch sử
                </Link>

                <header className="mb-12 border-b border-[#d4c4b7]/30 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <p className="text-[0.75rem] uppercase tracking-[0.2em] text-[#7c572d] mb-2 font-medium">Chi tiết đơn hàng</p>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#161d1f] uppercase">#{order.ma_dh}</h1>
                    </div>
                    <div className={`px-6 py-2.5 ${statusInfo.bg} ${statusInfo.textCol} text-[11px] font-black uppercase tracking-[0.15rem]`}>
                        {statusInfo.text}
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    
                    {/* CỘT THÔNG TIN NHẬN HÀNG */}
                    <div className="md:col-span-1 space-y-8">
                        <div className="bg-white p-8 border border-[#d4c4b7]/30 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2rem] text-[#7c572d] mb-6 border-b border-[#d4c4b7]/30 pb-4">Thông tin nhận hàng</h3>
                            <div className="space-y-4 text-sm">
                                <p><span className="block text-[10px] font-bold text-[#827569] uppercase tracking-widest mb-1">Người nhận:</span> <span className="font-bold">{order.ten_nguoi_nhan}</span></p>
                                <p><span className="block text-[10px] font-bold text-[#827569] uppercase tracking-widest mb-1">Số điện thoại:</span> {order.sdt_nguoi_nhan}</p>
                                <p><span className="block text-[10px] font-bold text-[#827569] uppercase tracking-widest mb-1">Địa chỉ giao:</span> {order.dia_chi_ct}, {order.quan_huyen}, {order.thanh_pho}</p>
                            </div>
                        </div>

                        <div className="bg-[#161d1f] text-white p-8 border border-[#161d1f] shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2rem] text-[#d4c4b7] mb-6 border-b border-white/10 pb-4">Tóm tắt thanh toán</h3>
                            <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/10">
                                <span className="font-bold uppercase tracking-widest text-xs">Tổng cộng:</span>
                                <span className="text-2xl font-black text-[#d4a574]">{formatPrice(order.tong_tien)}</span>
                            </div>
                        </div>
                    </div>

                    {/* CỘT DANH SÁCH SẢN PHẨM */}
                    <div className="md:col-span-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2rem] text-[#7c572d] mb-6">Sản phẩm đã đặt</h3>
                        <div className="space-y-6">
                            {items.map((item, idx) => (
                                <div key={idx} className="bg-white p-6 border border-[#d4c4b7]/30 flex flex-col sm:flex-row gap-6 items-start sm:items-center transition-colors hover:border-[#7c572d]/50">
                                    <div className="w-24 h-32 bg-[#f3f3f3] flex-shrink-0">
                                        <img className="w-full h-full object-cover" src={`${STORAGE_URL}/${item.hinh_anh}`} alt={item.ten_sp} />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <h4 className="font-bold text-sm uppercase tracking-tight mb-1">{item.ten_sp}</h4>
                                        <p className="text-[11px] text-[#50453b] uppercase tracking-[0.1rem] mb-4">
                                            Size: {item.kich_thuoc} / Màu: {item.mau_sac}
                                        </p>
                                        <div className="flex justify-between items-center border-t border-[#d4c4b7]/20 pt-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-[#827569] mb-1">Đơn giá</span>
                                                <span className="font-black text-sm">{formatPrice(item.don_gia)} <span className="text-xs font-medium text-[#827569] ml-1">x {item.so_luong}</span></span>
                                            </div>
                                            
                                            {/* 🚨 NÚT ĐÁNH GIÁ (CHỈ HIỆN KHI ĐÃ GIAO) 🚨 */}
                                            {order.trang_thai === 'DA_GIAO' && (
                                                item.is_reviewed ? (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-50 px-4 py-2 border border-green-200">
                                                        <span className="material-symbols-outlined text-[12px] align-middle mr-1">check_circle</span>
                                                        Đã đánh giá
                                                    </span>
                                                ) : (
                                                    <button 
                                                        onClick={() => {
                                                            setProductToReview(item);
                                                            setIsReviewModalOpen(true);
                                                        }}
                                                        className="cursor-pointer bg-[#7c572d] text-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#161d1f] transition-colors"
                                                    >
                                                        Đánh giá
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* =========================================================================
                MODAL ĐÁNH GIÁ 5 SAO 
            ========================================================================= */}
            {isReviewModalOpen && productToReview && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1a1c1c]/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white p-8 md:p-10 max-w-lg w-full shadow-2xl relative">
                        {/* Dấu tắt */}
                        <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-6 right-6 text-[#50453b] hover:text-[#ba1a1a] transition-colors cursor-pointer">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-[#161d1f]">Đánh giá sản phẩm</h3>
                        <p className="text-[11px] text-[#50453b] mb-8 uppercase tracking-widest border-b border-[#d4c4b7]/30 pb-6">
                            Chia sẻ trải nghiệm của bạn về sản phẩm này
                        </p>

                        <div className="flex gap-4 items-center mb-8">
                            <img src={`${STORAGE_URL}/${productToReview.hinh_anh}`} alt="" className="w-16 h-20 object-cover bg-[#f3f3f3]" />
                            <div>
                                <p className="font-bold text-sm uppercase leading-tight line-clamp-2">{productToReview.ten_sp}</p>
                                <p className="text-[10px] text-[#827569] uppercase tracking-widest mt-1">Phân loại: {productToReview.mau_sac}, {productToReview.kich_thuoc}</p>
                            </div>
                        </div>
                        
                        <div className="mb-6 flex flex-col items-center border-y border-[#d4c4b7]/30 py-6 bg-[#f9f9f9]">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#50453b] mb-3">Chất lượng sản phẩm</p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="cursor-pointer transition-transform hover:scale-110"
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <span className={`material-symbols-outlined text-4xl ${
                                            star <= (hoveredRating || rating) 
                                            ? 'text-[#f5a623]' // Màu vàng cam 
                                            : 'text-[#d4c4b7]' // Màu xám nhạt
                                        }`}
                                        style={{ fontVariationSettings: star <= (hoveredRating || rating) ? "'FILL' 1" : "'FILL' 0" }}
                                        >
                                            star
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.15rem] text-[#50453b] mb-2">Nội dung đánh giá</label>
                            <textarea 
                                rows="4" 
                                placeholder="Sản phẩm mặc có vừa vặn không? Chất liệu thế nào? Hãy chia sẻ nhé..."
                                className="w-full bg-[#f3f3f3] border border-transparent p-4 text-sm focus:border-[#7c572d] focus:bg-white outline-none transition-all resize-none"
                                value={reviewContent}
                                onChange={(e) => setReviewContent(e.target.value)}
                            ></textarea>
                        </div>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setIsReviewModalOpen(false)} 
                                className="flex-1 py-3.5 border border-[#d4c4b7] text-[#586062] text-xs font-bold uppercase tracking-widest hover:bg-[#f3f3f3] hover:text-[#161d1f] transition-colors cursor-pointer"
                            >
                                Trở lại
                            </button>
                            <button 
                                onClick={handleSubmitReview}
                                disabled={isSubmitting}
                                className="flex-1 py-3.5 bg-[#161d1f] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#7c572d] transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}