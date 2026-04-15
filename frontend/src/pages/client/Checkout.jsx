import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Nhận dữ liệu truyền sang
    const directItem = location.state?.directItem; 
    
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- STATE ĐỊA CHỈ ---
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ ho_ten: '', so_dien_thoai: '', dia_chi: '', thanh_pho: 'Hồ Chí Minh', quan_huyen: '' });
    const [paymentMethod, setPaymentMethod] = useState('COD');

    // --- STATE VOUCHER ---
    const [voucherCode, setVoucherCode] = useState('');
    // Nhận voucher nếu khách đã áp dụng ở Giỏ hàng, hoặc null nếu khách "Mua Ngay"
    const [appliedVoucher, setAppliedVoucher] = useState(location.state?.appliedVoucher || null);
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

    useEffect(() => {
        const fetchCheckoutData = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }

            try {
                const [addressRes, profileRes] = await Promise.all([
                    fetch(`${API_BASE}/client/addresses`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE}/client/profile`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (addressRes.ok && profileRes.ok) {
                    const addressData = await addressRes.json();
                    const profileData = await profileRes.json();
                    setAddresses(addressData);

                    if (addressData.length > 0) {
                        const defaultAddr = addressData.find(a => a.mac_dinh === 1) || addressData[0];
                        setSelectedAddressId(defaultAddr.ma_dc);
                    } else {
                        setIsAddingNewAddress(true);
                        setNewAddress(prev => ({ ...prev, ho_ten: profileData.tenkh, so_dien_thoai: profileData.sodt }));
                    }

                    if (directItem) {
                        setCartItems([directItem]);
                    } else {
                        const cartRes = await fetch(`${API_BASE}/client/cart`, { headers: { 'Authorization': `Bearer ${token}` } });
                        if (cartRes.ok) setCartItems(await cartRes.json());
                    }
                }
            } catch (error) { console.error(error); } finally { setIsLoading(false); }
        };
        fetchCheckoutData();
    }, [navigate, directItem]);

    // Tính toán Tạm tính để check Voucher
    const subTotal = cartItems.reduce((sum, item) => sum + (item.gia_ban * item.so_luong), 0);

    // --- HÀM ÁP DỤNG VOUCHER NGAY TẠI CHECKOUT ---
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) { toast.warning("Vui lòng nhập mã khuyến mãi!"); return; }

        setIsApplyingVoucher(true);
        try {
            const res = await fetch(`${API_BASE}/client/voucher/apply`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ ma_code: voucherCode.toUpperCase(), tong_tien: subTotal })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Đã áp dụng mã giảm giá!");
                setAppliedVoucher(data);
            } else {
                toast.error(`Lỗi: ${data.error}`);
                setAppliedVoucher(null);
            }
        } catch (error) {
            toast.error("Lỗi kết nối máy chủ");
        } finally {
            setIsApplyingVoucher(false);
        }
    };

    const handlePlaceOrder = async () => {
        let payload = { 
            phuong_thuc_tt: paymentMethod,
            ma_voucher: appliedVoucher?.ma_voucher // Gửi mã voucher đi
        };

        if (isAddingNewAddress) {
            if (!newAddress.ho_ten || !newAddress.so_dien_thoai || !newAddress.dia_chi) {
                toast.warning("Vui lòng điền đủ thông tin địa chỉ!"); return;
            }
            payload = { ...payload, ...newAddress };
        } else {
            if (!selectedAddressId) { toast.warning("Vui lòng chọn địa chỉ!"); return; }
            payload.ma_dc = selectedAddressId;
        }

        if (directItem) {
            payload.direct_buy = true;
            payload.ma_bien_the = directItem.ma_bien_the;
            payload.so_luong = directItem.so_luong;
            payload.gia_ban = directItem.gia_ban;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/client/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success("Đặt hàng thành công!"); navigate('/orders');
            } else {
                const data = await res.json(); toast.error(data.error);
            }
        } catch (e) { toast.error("Lỗi kết nối!"); } finally { setIsSubmitting(false); }
    };

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + '₫';
    
    // Tính tổng tiền cuối cùng
    const discount = appliedVoucher ? appliedVoucher.giam_gia : 0;
    const finalTotal = Math.max(subTotal - discount, 0);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#7c572d] border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="bg-[#f9f9f9] text-[#1a1c1c] font-['Be_Vietnam_Pro'] antialiased min-h-screen">
            <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                <header className="mb-16">
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-8">Thanh toán</h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-7 space-y-12">
                        {/* --- CHỌN ĐỊA CHỈ --- */}
                        <section>
                            <h2 className="font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2"><span className="material-symbols-outlined">local_shipping</span> Thông tin giao hàng</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map(addr => (
                                    <div key={addr.ma_dc} onClick={() => { setSelectedAddressId(addr.ma_dc); setIsAddingNewAddress(false); }} className={`cursor-pointer border p-5 transition-all ${selectedAddressId === addr.ma_dc && !isAddingNewAddress ? 'border-[#7c572d] bg-white shadow-sm' : 'border-gray-200 bg-gray-50 hover:border-[#7c572d]'}`}>
                                        <p className="font-bold text-sm uppercase flex justify-between">{addr.ten_nguoi_nhan} {addr.mac_dinh === 1 && <span className="bg-[#7c572d] text-white text-[9px] px-2 py-0.5 tracking-widest">MẶC ĐỊNH</span>}</p>
                                        <p className="text-xs opacity-70 mt-1">{addr.dia_chi_ct}, {addr.quan_huyen}, {addr.thanh_pho}</p>
                                        <p className="text-xs opacity-70 font-medium">{addr.sdt_nguoi_nhan}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setIsAddingNewAddress(!isAddingNewAddress)} className="mt-4 text-xs font-bold text-[#7c572d] underline cursor-pointer hover:opacity-70">
                                {isAddingNewAddress ? "Hủy nhập" : "+ Thêm địa chỉ mới"}
                            </button>
                            {isAddingNewAddress && (
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white border border-gray-200 shadow-sm">
                                    <input placeholder="Họ tên" className="border-b p-2 outline-none focus:border-[#7c572d] bg-transparent" onChange={e => setNewAddress({...newAddress, ho_ten: e.target.value})} />
                                    <input placeholder="SĐT" className="border-b p-2 outline-none focus:border-[#7c572d] bg-transparent" onChange={e => setNewAddress({...newAddress, so_dien_thoai: e.target.value})} />
                                    <input placeholder="Địa chỉ cụ thể" className="md:col-span-2 border-b p-2 outline-none focus:border-[#7c572d] bg-transparent" onChange={e => setNewAddress({...newAddress, dia_chi: e.target.value})} />
                                </div>
                            )}
                        </section>

                        {/* --- CHỌN PHƯƠNG THỨC THANH TOÁN --- */}
                        <section>
                            <h2 className="font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2"><span className="material-symbols-outlined">payments</span> Phương thức thanh toán</h2>
                            <div className="flex flex-col gap-4">
                                <label className={`border p-4 flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#7c572d] bg-white' : 'bg-gray-50'}`}>
                                    <input type="radio" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="accent-[#7c572d] w-4 h-4" />
                                    <span className="text-sm font-bold uppercase">Thanh toán khi nhận hàng (COD)</span>
                                </label>
                                <label className={`border p-4 flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'ATM' ? 'border-[#7c572d] bg-white' : 'bg-gray-50'}`}>
                                    <input type="radio" checked={paymentMethod === 'ATM'} onChange={() => setPaymentMethod('ATM')} className="accent-[#7c572d] w-4 h-4" />
                                    <span className="text-sm font-bold uppercase">Chuyển khoản ngân hàng</span>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* --- CỘT TÓM TẮT ĐƠN HÀNG --- */}
                    <div className="lg:col-span-5">
                        <div className="bg-white border p-8 md:p-10 sticky top-28 shadow-sm">
                            <h2 className="font-black uppercase tracking-widest border-b pb-4 mb-6">Tóm tắt đơn hàng</h2>
                            <div className="space-y-4 mb-8 max-h-[30vh] overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={item.ma_bien_the} className="flex items-center gap-4 text-sm">
                                        <img src={`${STORAGE_URL}/${item.hinh_anh}`} alt={item.ten_sp} className="w-16 h-20 object-cover bg-gray-100" />
                                        <div className="flex-1">
                                            <p className="font-bold uppercase truncate">{item.ten_sp}</p>
                                            <p className="text-[10px] opacity-60 uppercase">{item.kich_thuoc} / {item.mau_sac} (x{item.so_luong})</p>
                                        </div>
                                        <span className="font-bold">{formatPrice(item.gia_ban * item.so_luong)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Ô Nhập Voucher */}
                            <div className="mb-8 border-t border-b py-6">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2rem] mb-2 text-[#7c572d]">Mã ưu đãi</label>
                                <div className="flex">
                                    <input 
                                        className="w-full border border-r-0 border-[#d4c4b7] outline-none px-4 py-3 text-sm uppercase font-bold placeholder:opacity-50" 
                                        placeholder="NHẬP MÃ"
                                        value={voucherCode}
                                        onChange={(e) => setVoucherCode(e.target.value)}
                                        disabled={appliedVoucher !== null}
                                    />
                                    {!appliedVoucher ? (
                                        <button 
                                            onClick={handleApplyVoucher} 
                                            disabled={isApplyingVoucher}
                                            className="cursor-pointer bg-[#1a1c1c] text-white px-4 text-xs font-bold uppercase tracking-widest hover:bg-[#7c572d]"
                                        >
                                            {isApplyingVoucher ? '...' : 'ÁP DỤNG'}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => { setAppliedVoucher(null); setVoucherCode(''); }} 
                                            className="cursor-pointer bg-[#ba1a1a] text-white px-4 text-xs font-bold uppercase tracking-widest hover:bg-red-800"
                                        >
                                            HỦY MÃ
                                        </button>
                                    )}
                                </div>
                                {appliedVoucher && <p className="text-[#7c572d] text-[10px] font-bold mt-2">✓ Đã áp dụng mã {appliedVoucher.ma_code}</p>}
                            </div>

                            {/* Tính tiền */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs uppercase opacity-70 font-bold"><span>Tạm tính</span><span>{formatPrice(subTotal)}</span></div>
                                <div className="flex justify-between text-xs uppercase opacity-70 font-bold"><span>Vận chuyển</span><span>Miễn phí</span></div>
                                {discount > 0 && <div className="flex justify-between text-xs uppercase text-[#7c572d] font-bold"><span>Giảm giá</span><span>- {formatPrice(discount)}</span></div>}
                                <div className="flex justify-between items-center text-xl font-black pt-4 border-t border-[#d4c4b7]/50 mt-4">
                                    <span className="uppercase tracking-widest text-sm">Tổng cộng</span>
                                    <span className="text-[#7c572d] text-2xl">{formatPrice(finalTotal)}</span>
                                </div>
                            </div>
                            <button onClick={handlePlaceOrder} disabled={isSubmitting} className="w-full mt-8 py-5 bg-[#7c572d] text-white font-black uppercase text-xs tracking-[0.2rem] hover:bg-[#1a1c1c] transition-all cursor-pointer disabled:opacity-50">
                                {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}