import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // State Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // State Modal Xác nhận Hủy
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [isCanceling, setIsCanceling] = useState(false);

    const fetchOrders = async (page = 1) => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/client/orders?page=${page}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setOrders(data.data);
                setCurrentPage(data.current_page);
                setTotalPages(data.last_page);
            } else if (res.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
            toast.error("Lỗi kết nối máy chủ!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(1);
        window.scrollTo(0, 0);
    }, [navigate]);

    // Hàm THỰC THI Hủy đơn hàng (Sau khi khách đã confirm trên Modal)
    const executeCancelOrder = async () => {
        if (!orderToCancel) return;
        setIsCanceling(true);
        const token = localStorage.getItem('token');
        
        try {
            const res = await fetch(`${API_BASE}/client/orders/${orderToCancel}/cancel`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                toast.success("Đã hủy đơn hàng thành công!");
                setOrderToCancel(null); // Đóng modal
                fetchOrders(currentPage); // Tải lại danh sách
            } else {
                const errData = await res.json();
                toast.error(`Lỗi: ${errData.error || 'Không thể hủy đơn'}`);
            }
        } catch (error) {
            toast.error("Lỗi kết nối đến Server!");
        } finally {
            setIsCanceling(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + '₫';
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'CHO_XAC_NHAN': 
                return { text: 'Chờ xác nhận', bg: 'bg-[#e8e8e8]', textCol: 'text-[#50453b]' };
            case 'DA_XAC_NHAN': 
                return { text: 'Đã xác nhận', bg: 'bg-[#7c572d]/10', textCol: 'text-[#7c572d]' };
            case 'DANG_GIAO': 
                return { text: 'Đang giao hàng', bg: 'bg-[#586062]/10', textCol: 'text-[#586062]' };
            case 'DA_GIAO': 
                return { text: 'Đã giao thành công', bg: 'bg-green-100', textCol: 'text-green-800' };
            case 'DA_HUY': 
                return { text: 'Đã hủy', bg: 'bg-[#ba1a1a]/10', textCol: 'text-[#ba1a1a]' };
            default: 
                return { text: status, bg: 'bg-[#e8e8e8]', textCol: 'text-[#50453b]' };
        }
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button 
                    key={i} 
                    onClick={() => fetchOrders(i)}
                    className={`w-10 h-10 flex items-center justify-center text-xs font-bold border transition-colors cursor-pointer ${
                        currentPage === i ? 'bg-[#161d1f] text-white border-[#161d1f]' : 'border-[#d4c4b7]/50 hover:bg-[#f3f3f3] text-[#586062]'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="bg-[#f4fafd] text-[#161d1f] font-['Be_Vietnam_Pro'] antialiased animate-fade-in min-h-screen relative">
            <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto">
                
                <header className="mb-20">
                    <p className="text-[0.75rem] uppercase tracking-[0.2em] text-[#7c572d] mb-4 font-medium">Tài khoản thành viên</p>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#161d1f] leading-none">
                        Lịch sử đơn hàng<span className="text-[#7c572d]">.</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-32">
                        <div className="space-y-4">
                            <h3 className="text-[0.75rem] uppercase tracking-[0.15em] text-[#827569] font-bold">Quản lý</h3>
                            <nav className="flex flex-col space-y-2">
                                <Link to="/profile" className="text-[#586062] hover:text-[#161d1f] transition-colors flex items-center gap-3 py-2 pl-4">Hồ sơ cá nhân</Link>
                                <Link to="/orders" className="text-[#161d1f] font-semibold flex items-center gap-3 py-2 border-l-2 border-[#7c572d] pl-4">Lịch sử đơn hàng</Link>
                                <Link to="/sale" className="text-[#586062] hover:text-[#161d1f] transition-colors flex items-center gap-3 py-2 pl-4">Mã giảm giá</Link>
                            </nav>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[0.75rem] uppercase tracking-[0.15em] text-[#827569] font-bold">Thiết lập</h3>
                            <nav className="flex flex-col space-y-2">
                                <button onClick={handleLogout} className="cursor-pointer text-[#ba1a1a] font-medium hover:opacity-70 transition-all flex items-center gap-3 py-2 pl-4 text-left w-full">Đăng xuất</button>
                            </nav>
                        </div>
                    </aside>

                    <div className="lg:col-span-9 space-y-8">
                        {isLoading ? (
                            <div className="text-center py-20 font-bold text-[#7c572d] animate-pulse uppercase tracking-widest">Đang tải dữ liệu...</div>
                        ) : orders.length > 0 ? (
                            <>
                                {orders.map((order) => {
                                    const statusInfo = getStatusStyle(order.trang_thai);
                                    return (
                                        <div key={order.ma_dh} className="bg-white p-8 md:p-10 shadow-sm border border-[#d4c4b7]/30 hover:border-[#7c572d]/50 transition-colors">
                                            
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#d4c4b7]/30 pb-6 mb-6 gap-4">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-[#827569] font-bold mb-1">Mã đơn hàng</p>
                                                    <h3 className="text-lg font-black uppercase tracking-tight text-[#161d1f]">{order.ma_dh}</h3>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-left md:text-right">
                                                        <p className="text-[10px] uppercase tracking-widest text-[#827569] font-bold mb-1">Ngày đặt</p>
                                                        <p className="text-sm font-medium text-[#161d1f]">{formatDate(order.ngay_dat)}</p>
                                                    </div>
                                                    <div className={`px-4 py-2 ${statusInfo.bg} ${statusInfo.textCol} text-[10px] font-black uppercase tracking-widest`}>
                                                        {statusInfo.text}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {order.items && order.items.map((item, idx) => (
                                                    <div key={idx} className="flex gap-6 items-center">
                                                        <div className="w-20 h-28 bg-[#f3f3f3] flex-shrink-0">
                                                            <img className="w-full h-full object-cover" src={`${STORAGE_URL}/${item.hinh_anh}`} alt={item.ten_sp} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-sm uppercase tracking-tight mb-1 truncate">{item.ten_sp}</h4>
                                                            <p className="text-[11px] text-[#50453b] uppercase tracking-[0.1rem] mb-3">
                                                                Size: {item.kich_thuoc} / Màu: {item.mau_sac}
                                                            </p>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs font-medium text-[#827569]">Số lượng: {item.so_luong}</span>
                                                                <span className="font-black text-sm">{formatPrice(item.don_gia)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-[#d4c4b7]/30 flex flex-col md:flex-row justify-between items-center gap-4">
                                                <div>
                                                    <span className="font-bold text-sm uppercase tracking-widest mr-4">Tổng cộng:</span>
                                                    <span className="text-2xl font-black text-[#7c572d] tracking-tighter">{formatPrice(order.tong_tien)}</span>
                                                </div>
                                                
                                                <div className="flex gap-3 w-full md:w-auto">
                                                    {/* KÍCH HOẠT MODAL HỦY ĐƠN */}
                                                    {order.trang_thai === 'CHO_XAC_NHAN' && (
                                                        <button 
                                                            onClick={() => setOrderToCancel(order.ma_dh)}
                                                            className="flex-1 md:flex-none cursor-pointer border border-[#ba1a1a] text-[#ba1a1a] px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#ba1a1a]/10 transition-colors"
                                                        >
                                                            HỦY ĐƠN
                                                        </button>
                                                    )}
                                                    
                                                    <Link 
                                                        to={`/orders/${order.ma_dh}`} 
                                                        className="flex-1 md:flex-none text-center cursor-pointer bg-[#161d1f] border border-[#161d1f] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#7c572d] hover:border-[#7c572d] transition-colors"
                                                    >
                                                        XEM CHI TIẾT
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 pt-8">
                                        <button 
                                            onClick={() => fetchOrders(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="w-10 h-10 flex items-center justify-center border border-[#d4c4b7]/50 hover:bg-[#f3f3f3] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                                        </button>
                                        
                                        {renderPagination()}

                                        <button 
                                            onClick={() => fetchOrders(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="w-10 h-10 flex items-center justify-center border border-[#d4c4b7]/50 hover:bg-[#f3f3f3] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white border border-[#d4c4b7]/30">
                                <span className="material-symbols-outlined text-6xl text-[#d4c4b7] mb-4">receipt_long</span>
                                <h2 className="text-xl font-bold uppercase tracking-tight text-[#161d1f] mb-2">Chưa có đơn hàng nào</h2>
                                <p className="text-[#586062] mb-8 text-sm">Bạn chưa thực hiện giao dịch nào tại Vibe Studio.</p>
                                <Link to="/shop" className="cursor-pointer bg-[#161d1f] text-white px-8 py-4 uppercase tracking-[0.15rem] font-bold text-xs hover:bg-[#7c572d] transition-colors inline-block">
                                    MUA SẮM NGAY
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- CUSTOM MODAL XÁC NHẬN HỦY ĐƠN ĐẬM CHẤT QUIET LUXURY --- */}
            {orderToCancel && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1a1c1c]/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white p-8 md:p-10 max-w-md w-full text-center shadow-2xl relative">
                        {/* Dấu X Tắt Modal */}
                        <button onClick={() => setOrderToCancel(null)} className="absolute top-4 right-4 text-[#50453b] hover:text-[#ba1a1a] transition-colors cursor-pointer">
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className="w-16 h-16 bg-[#ba1a1a]/10 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-3xl">warning</span>
                        </div>
                        
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-[#161d1f]">Xác nhận hủy đơn</h3>
                        <p className="text-sm text-[#50453b] mb-8 leading-relaxed">
                            Bạn có chắc chắn muốn hủy đơn hàng <span className="font-bold text-[#161d1f]">#{orderToCancel}</span> này không? Thao tác này không thể hoàn tác.
                        </p>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setOrderToCancel(null)} 
                                className="flex-1 py-3.5 border border-[#d4c4b7] text-[#586062] text-xs font-bold uppercase tracking-widest hover:bg-[#f3f3f3] hover:text-[#161d1f] transition-colors cursor-pointer"
                            >
                                Bỏ qua
                            </button>
                            <button 
                                onClick={executeCancelOrder} 
                                disabled={isCanceling}
                                className="flex-1 py-3.5 bg-[#ba1a1a] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#93000a] transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isCanceling ? 'Đang xử lý...' : 'Chắc chắn hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}