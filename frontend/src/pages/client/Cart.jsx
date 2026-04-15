import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- STATE VOUCHER ---
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null); // Lưu thông tin voucher đang dùng
    const [isApplying, setIsApplying] = useState(false);

    const navigate = useNavigate();

    const fetchCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.info("Vui lòng đăng nhập để xem giỏ hàng");
            navigate('/login');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/client/cart`, {
                headers: { 
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });
            if (res.ok) {
                setCartItems(await res.json());
            } else if (res.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCart(); }, []);

    const handleUpdateQuantity = async (ma_bien_the, currentQty, change) => {
        const newQty = currentQty + change;
        if (newQty < 1) return; 

        setCartItems(prev => prev.map(item => item.ma_bien_the === ma_bien_the ? { ...item, so_luong: newQty } : item));

        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_BASE}/client/cart/${ma_bien_the}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ so_luong: newQty })
            });
        } catch (error) {
            toast.error("Lỗi cập nhật số lượng");
            fetchCart(); 
        }
    };

    const handleRemoveItem = async (ma_bien_the) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/client/cart/${ma_bien_the}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Đã xóa khỏi giỏ hàng", { autoClose: 1500, hideProgressBar: true });
                setCartItems(prev => prev.filter(item => item.ma_bien_the !== ma_bien_the));
            }
        } catch (error) {
            toast.error("Lỗi kết nối");
        }
    };

    // --- HÀM XỬ LÝ ÁP MÃ VOUCHER ---
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) {
            toast.warning("Vui lòng nhập mã khuyến mãi!");
            return;
        }

        setIsApplying(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_BASE}/client/voucher/apply`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    ma_code: voucherCode.toUpperCase(),
                    tong_tien: subTotal // Gửi tổng tiền để check điều kiện tối thiểu
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Đã áp dụng mã giảm giá!");
                setAppliedVoucher(data); // data chứa {giam_gia, ma_voucher, ma_code}
            } else {
                toast.error(`Lỗi: ${data.error}`);
                setAppliedVoucher(null); // Reset nếu lỗi
            }
        } catch (error) {
            toast.error("Lỗi kết nối máy chủ");
        } finally {
            setIsApplying(false);
        }
    };

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + '₫';
    
    // Tính toán tiền nong
    const subTotal = cartItems.reduce((sum, item) => sum + (item.gia_ban * item.so_luong), 0);
    const discountAmount = appliedVoucher ? appliedVoucher.giam_gia : 0;
    const total = subTotal - discountAmount;

    // Đẩy dữ liệu qua trang Checkout
    const proceedToCheckout = () => {
        navigate('/checkout', { state: { appliedVoucher } });
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#7c572d] border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="bg-[#f9f9f9] text-[#1a1c1c] font-['Be_Vietnam_Pro'] antialiased animate-fade-in min-h-screen">
            <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
                <header className="mb-16">
                    <h1 className="text-4xl font-bold tracking-tight uppercase mb-2">Giỏ hàng của bạn</h1>
                    <p className="text-[#7c572d] uppercase tracking-[0.15rem] text-[12px] font-bold">
                        {cartItems.length} Sản phẩm trong túi
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-8 space-y-12">
                        {cartItems.length > 0 ? cartItems.map((item) => (
                            <div key={item.ma_bien_the} className="flex flex-col md:flex-row gap-8 items-start md:items-center group border-b border-[#d4c4b7]/30 pb-8 last:border-0">
                                <div className="w-full md:w-32 lg:w-40 aspect-[3/4] bg-[#f3f3f3] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${item.ma_bien_the.split('_')[0]}`)}>
                                    <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={`${STORAGE_URL}/${item.hinh_anh}`} alt={item.ten_sp} />
                                </div>
                                <div className="flex-grow space-y-2 w-full">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold uppercase tracking-tight pr-4">
                                            <Link to={`/product/${item.ma_bien_the.split('_')[0]}`} className="hover:text-[#7c572d] transition-colors cursor-pointer">{item.ten_sp}</Link>
                                        </h3>
                                        <button onClick={() => handleRemoveItem(item.ma_bien_the)} className="cursor-pointer text-[#5f5e5e] hover:text-[#ba1a1a] transition-colors p-1">
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                    <p className="text-[#50453b] uppercase tracking-[0.15rem] text-[11px] font-bold">
                                        Size: {item.kich_thuoc} / Màu: {item.mau_sac}
                                    </p>
                                    <div className="flex justify-between items-end mt-4 pt-4">
                                        <div className="flex items-center border border-[#d4c4b7]/50">
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.ma_bien_the, item.so_luong, -1)} 
                                                disabled={item.so_luong <= 1}
                                                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 hover:bg-[#e8e8e8] transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">remove</span>
                                            </button>
                                            <span className="px-4 text-sm font-bold w-12 text-center">{item.so_luong}</span>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.ma_bien_the, item.so_luong, 1)} 
                                                className="cursor-pointer px-4 py-2 hover:bg-[#e8e8e8] transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                        <span className="text-xl font-bold">{formatPrice(item.gia_ban)}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center bg-white border border-[#d4c4b7]/30">
                                <span className="material-symbols-outlined text-6xl text-[#d4c4b7] mb-4">local_mall</span>
                                <h2 className="text-xl font-bold uppercase tracking-tight text-[#1a1c1c] mb-2">Giỏ hàng trống</h2>
                                <p className="text-[#50453b] mb-8 text-sm">Chưa có sản phẩm nào trong túi đồ của bạn.</p>
                                <Link to="/shop" className="cursor-pointer bg-[#1a1c1c] text-white px-8 py-4 uppercase tracking-[0.15rem] font-bold text-xs hover:bg-[#7c572d] transition-colors inline-block">
                                    TIẾP TỤC MUA SẮM
                                </Link>
                            </div>
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <div className="lg:col-span-4">
                            <div className="bg-white border border-[#d4c4b7]/30 p-8 md:p-10 lg:sticky lg:top-32 shadow-sm">
                                <h2 className="text-xl font-bold uppercase tracking-tight mb-8">Tổng đơn hàng</h2>
                                <div className="space-y-6 mb-10">
                                    <div className="flex justify-between text-[#50453b] uppercase tracking-[0.1rem] text-[12px] font-bold">
                                        <span>Tạm tính</span>
                                        <span className="text-[#1a1c1c]">{formatPrice(subTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-[#50453b] uppercase tracking-[0.1rem] text-[12px] font-bold">
                                        <span>Giảm giá</span>
                                        <span className="text-[#7c572d]">- {formatPrice(discountAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-[#50453b] uppercase tracking-[0.1rem] text-[12px] font-bold">
                                        <span>Phí vận chuyển</span>
                                        <span className="text-[#1a1c1c]">Tính lúc thanh toán</span>
                                    </div>
                                    <div className="h-px bg-[#d4c4b7]/50 my-4"></div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold uppercase tracking-widest text-sm">Tổng cộng</span>
                                        <span className="text-2xl md:text-3xl font-black tracking-tighter text-[#7c572d]">{formatPrice(Math.max(total, 0))}</span>
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2rem] mb-2 text-[#7c572d]">Mã ưu đãi</label>
                                    <div className="relative group flex">
                                        <input 
                                            className="w-full bg-[#f9f9f9] border border-[#d4c4b7]/50 focus:border-[#7c572d] focus:ring-0 outline-none px-4 py-3 text-sm uppercase tracking-widest font-bold placeholder:text-[#d4c4b7] transition-colors" 
                                            type="text" 
                                            placeholder="NHẬP MÃ TẠI ĐÂY"
                                            value={voucherCode}
                                            onChange={(e) => setVoucherCode(e.target.value)}
                                            disabled={appliedVoucher !== null} // Khóa nếu đã áp mã
                                        />
                                        {!appliedVoucher ? (
                                            <button 
                                                onClick={handleApplyVoucher} 
                                                disabled={isApplying}
                                                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 bg-[#1a1c1c] text-white px-6 uppercase text-xs font-bold tracking-widest hover:bg-[#7c572d] transition-colors"
                                            >
                                                {isApplying ? '...' : 'ÁP DỤNG'}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => { setAppliedVoucher(null); setVoucherCode(''); }} 
                                                className="cursor-pointer bg-[#ba1a1a] text-white px-6 uppercase text-xs font-bold tracking-widest hover:bg-[#93000a] transition-colors"
                                            >
                                                HỦY MÃ
                                            </button>
                                        )}
                                    </div>
                                    {appliedVoucher && (
                                        <p className="text-[#7c572d] text-[10px] font-bold mt-2 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Đã áp dụng thành công!
                                        </p>
                                    )}
                                </div>

                                <button onClick={proceedToCheckout} className="cursor-pointer w-full bg-[#7c572d] text-white py-5 md:py-6 uppercase tracking-[0.15rem] font-bold text-xs hover:bg-[#1a1c1c] transition-all duration-300">
                                    Tiến hành thanh toán
                                </button>
                                
                                <div className="mt-8 flex flex-col items-center gap-4">
                                    <p className="text-[11px] text-[#5f5e5e] text-center leading-relaxed">
                                        Bằng cách đặt hàng, bạn đồng ý với các <Link to="#" className="cursor-pointer underline hover:text-[#1a1c1c]">Chính sách & Quy định</Link> của Vibe Studio.
                                    </p>
                                    <div className="flex gap-4 opacity-40 text-[#1a1c1c]">
                                        <span className="material-symbols-outlined">credit_card</span>
                                        <span className="material-symbols-outlined">account_balance</span>
                                        <span className="material-symbols-outlined">local_shipping</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}