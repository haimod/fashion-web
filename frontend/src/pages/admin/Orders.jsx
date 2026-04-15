import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ cho_xac_nhan: 0, dang_giao: 0, da_giao: 0 });
    const [isLoading, setIsLoading] = useState(true);
    
    // Search, Filter & Pagination State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState(""); // Lọc trạng thái
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState('DETAIL');

    // Hàm gọi API
    // Thêm tham số per_page=5 vào URL
    const fetchOrders = async (page = 1, search = searchTerm, status = filterStatus) => {
        setIsLoading(true);
        const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
        try {
            // 🚨 ĐÃ FIX: per_page=5 ở đây sếp nhé
            const res = await fetch(`${API_BASE}/admin/orders?page=${page}&per_page=5&search=${search}&status=${status}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders.data); 
                setCurrentPage(data.orders.current_page);
                setTotalPages(data.orders.last_page);
                setTotalRecords(data.orders.total);
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        fetchOrders(1, "", ""); 
    }, []);

    // Bắt sự kiện khi gõ Enter
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchOrders(1, searchTerm, filterStatus);
        }
    };

    // Khi chọn trạng thái từ Dropdown
    const handleFilterChange = (e) => {
        const newStatus = e.target.value;
        setFilterStatus(newStatus);
        fetchOrders(1, searchTerm, newStatus);
    };

    // 🚨 HÀM XUẤT BÁO CÁO CSV 🚨
    const handleExportCSV = async () => {
        const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
        try {
            toast.info("Đang tạo file báo cáo...");
            // Gọi API lấy 1000 đơn hàng (Dựa trên bộ lọc hiện tại) để xuất
            const res = await fetch(`${API_BASE}/admin/orders?page=1&per_page=1000&search=${searchTerm}&status=${filterStatus}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                const exportData = data.orders.data;

                if (exportData.length === 0) {
                    toast.warning("Không có dữ liệu để xuất!");
                    return;
                }

                // Tiêu đề cột
                const headers = ['Mã ĐH', 'Khách hàng', 'SĐT', 'Ngày đặt', 'Tổng tiền (VNĐ)', 'Trạng thái'];
                
                // Xử lý dữ liệu từng dòng
                const csvRows = exportData.map(o => {
                    const statusText = getStatusStyle(o.trang_thai).text;
                    const dateText = formatDate(o.ngay_dat);
                    return [
                        o.ma_dh,
                        `"${o.tenkh}"`, // Bọc trong "" để tránh lỗi phẩy
                        `="${o.sodt}"`, // ="" để Excel không bị mất số 0 ở đầu SĐT
                        `"${dateText}"`,
                        o.tong_tien,
                        `"${statusText}"`
                    ].join(',');
                });

                // Gắn BOM (\uFEFF) để Excel đọc được Tiếng Việt có dấu
                const csvContent = "\uFEFF" + headers.join(',') + '\n' + csvRows.join('\n');
                
                // Tạo file và kích hoạt tải xuống
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `Vibe_BaoCao_DonHang_${new Date().toISOString().slice(0,10)}.csv`;
                link.click();
                
                toast.success("Đã xuất báo cáo thành công!");
            }
        } catch (error) {
            toast.error("Lỗi khi xuất file báo cáo!");
        }
    };

    const handleOpenModal = async (ma_dh, tab) => {
        const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/admin/orders/${ma_dh}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedOrder(data);
                setModalTab(tab);
                setIsModalOpen(true);
            }
        } catch (error) {
            toast.error("Lỗi tải chi tiết đơn hàng");
        }
    };

    const handleUpdateStatus = async (ma_dh, newStatus) => {
        const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/admin/orders/${ma_dh}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ trang_thai: newStatus })
            });

            if (res.ok) {
                toast.success("Cập nhật trạng thái thành công!");
                setIsModalOpen(false);
                fetchOrders(currentPage, searchTerm, filterStatus); // Tải lại trang
            } else {
                toast.error("Cập nhật thất bại");
            }
        } catch (error) {
            toast.error("Lỗi hệ thống");
        }
    };

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + 'đ';
    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'CHO_XAC_NHAN': return { text: 'Chờ xác nhận', color: 'bg-[#7c572d] text-white' };
            case 'DA_XAC_NHAN': return { text: 'Đã xác nhận', color: 'bg-[#C6A15B] text-white' };
            case 'DANG_GIAO': return { text: 'Đang giao', color: 'bg-[#586062] text-white' };
            case 'DA_GIAO': return { text: 'Đã giao', color: 'bg-[#1a1c1c] text-white' };
            case 'DA_HUY': return { text: 'Đã hủy', color: 'bg-[#ba1a1a] text-white' };
            default: return { text: status, color: 'bg-gray-200 text-gray-800' };
        }
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button 
                    key={i} 
                    onClick={() => fetchOrders(i, searchTerm, filterStatus)}
                    className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold border transition-colors cursor-pointer ${
                        currentPage === i ? 'bg-[#7c572d] text-white border-[#7c572d]' : 'border-[#d4c4b7]/50 hover:bg-[#f3f3f3]'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="p-8 space-y-12 bg-[#f9f9f9] min-h-screen text-[#1a1c1c] font-['Be_Vietnam_Pro']">
            
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 pb-6 border-b border-[#d4c4b7]/30">
                <h2 className="text-xl font-bold tracking-tight uppercase">Quản lý Đơn hàng</h2>
                
                {/* --- KHUNG LỌC & TÌM KIẾM --- */}
                <div className="flex gap-4 w-full md:w-auto">
                    {/* Filter Trạng Thái */}
                    <select 
                        className="bg-[#f3f3f3] border-none text-xs font-bold uppercase tracking-widest py-2 px-4 focus:ring-1 focus:ring-[#7c572d] outline-none cursor-pointer text-[#50453b]"
                        value={filterStatus}
                        onChange={handleFilterChange}
                    >
                        <option value="">TẤT CẢ TRẠNG THÁI</option>
                        <option value="CHO_XAC_NHAN">CHỜ XÁC NHẬN</option>
                        <option value="DA_XAC_NHAN">ĐÃ XÁC NHẬN</option>
                        <option value="DANG_GIAO">ĐANG GIAO</option>
                        <option value="DA_GIAO">ĐÃ GIAO</option>
                        <option value="DA_HUY">ĐÃ HỦY</option>
                    </select>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#50453b]/60 text-sm">search</span>
                        <input 
                            className="w-full bg-[#f3f3f3] border-none text-sm py-2 pl-10 pr-4 focus:ring-1 focus:ring-[#7c572d] outline-none" 
                            placeholder="Tìm mã ĐH, SĐT... (Enter)" 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 flex flex-col gap-4 border-l-4 border-[#7c572d] shadow-sm">
                    <span className="uppercase tracking-[0.15rem] text-[0.7rem] font-bold text-[#7c572d]">Chờ xác nhận</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black tracking-tighter">{stats.cho_xac_nhan}</span>
                        <span className="text-sm text-[#50453b] font-medium">đơn</span>
                    </div>
                </div>
                <div className="bg-white p-8 flex flex-col gap-4 border-l-4 border-[#586062] shadow-sm">
                    <span className="uppercase tracking-[0.15rem] text-[0.7rem] font-bold text-[#586062]">Đang giao</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black tracking-tighter">{stats.dang_giao}</span>
                        <span className="text-sm text-[#50453b] font-medium">đơn</span>
                    </div>
                </div>
                <div className="bg-white p-8 flex flex-col gap-4 border-l-4 border-[#1a1c1c] shadow-sm">
                    <span className="uppercase tracking-[0.15rem] text-[0.7rem] font-bold text-[#1a1c1c]">Đã giao</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black tracking-tighter">{stats.da_giao}</span>
                        <span className="text-sm text-[#50453b] font-medium">đơn</span>
                    </div>
                </div>
            </section>

            <section className="bg-white shadow-sm border border-[#d4c4b7]/30">
                <div className="px-8 py-6 flex justify-between items-center border-b border-[#d4c4b7]/30">
                    <h3 className="uppercase tracking-[0.15rem] text-[0.8rem] font-black">Danh sách đơn hàng</h3>
                    
                    {/* --- NÚT XUẤT BÁO CÁO --- */}
                    <button 
                        onClick={handleExportCSV}
                        className="px-4 py-2 bg-[#7c572d] text-white uppercase tracking-[0.1rem] text-[0.7rem] font-bold cursor-pointer hover:bg-[#1a1c1c] transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Xuất báo cáo
                    </button>
                </div>
                
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f3f3f3]">
                                <th className="px-8 py-5 uppercase tracking-[0.1rem] text-[0.65rem] font-bold text-[#50453b]">Mã ĐH</th>
                                <th className="px-8 py-5 uppercase tracking-[0.1rem] text-[0.65rem] font-bold text-[#50453b]">Khách hàng</th>
                                <th className="px-8 py-5 uppercase tracking-[0.1rem] text-[0.65rem] font-bold text-[#50453b]">Ngày đặt</th>
                                <th className="px-8 py-5 uppercase tracking-[0.1rem] text-[0.65rem] font-bold text-[#50453b] text-right">Tổng tiền</th>
                                <th className="px-8 py-5 uppercase tracking-[0.1rem] text-[0.65rem] font-bold text-[#50453b]">Trạng thái</th>
                                <th className="px-8 py-5 uppercase tracking-[0.1rem] text-[0.65rem] font-bold text-[#50453b] text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#d4c4b7]/30">
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-10 font-bold text-[#7c572d] animate-pulse">ĐANG TẢI DỮ LIỆU...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-10 text-[#50453b] uppercase text-sm">Không tìm thấy đơn hàng</td></tr>
                            ) : (
                                orders.map(order => {
                                    const statusObj = getStatusStyle(order.trang_thai);
                                    return (
                                        <tr key={order.ma_dh} className="hover:bg-[#f9f9f9] transition-colors">
                                            <td className="px-8 py-6 text-sm font-bold tracking-tight">{order.ma_dh}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-[#e8e8e8] flex items-center justify-center text-[10px] font-bold text-[#1a1c1c]">
                                                        {order.tenkh?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold uppercase">{order.tenkh}</p>
                                                        <p className="text-[10px] text-[#50453b] tracking-widest">{order.sodt}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-xs text-[#50453b] font-medium">{formatDate(order.ngay_dat)}</td>
                                            <td className="px-8 py-6 text-sm font-black text-right text-[#7c572d]">{formatPrice(order.tong_tien)}</td>
                                            <td className="px-8 py-6">
                                                <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 ${statusObj.color}`}>
                                                    {statusObj.text}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleOpenModal(order.ma_dh, 'DETAIL')} className="p-2 hover:bg-[#7c572d]/10 transition-colors cursor-pointer text-[#7c572d] rounded-full" title="Xem chi tiết">
                                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                                    </button>
                                                    <button onClick={() => handleOpenModal(order.ma_dh, 'EDIT')} className="p-2 hover:bg-[#586062]/10 transition-colors cursor-pointer text-[#586062] rounded-full" title="Cập nhật trạng thái">
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!isLoading && totalPages > 1 && (
                    <div className="px-8 py-6 flex justify-between items-center bg-[#f9f9f9] border-t border-[#d4c4b7]/30">
                        <p className="text-[10px] text-[#50453b] uppercase tracking-[0.15rem] font-medium">
                            Hiển thị {orders.length} trên tổng {totalRecords} đơn
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => fetchOrders(currentPage - 1, searchTerm, filterStatus)}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center border border-[#d4c4b7]/50 hover:bg-[#f3f3f3] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            
                            {renderPagination()}

                            <button 
                                onClick={() => fetchOrders(currentPage + 1, searchTerm, filterStatus)}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 flex items-center justify-center border border-[#d4c4b7]/50 hover:bg-[#f3f3f3] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* --- MODAL XEM CHI TIẾT & CẬP NHẬT TRẠNG THÁI --- */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-[#1a1c1c]/60 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-[#50453b] hover:text-[#ba1a1a] cursor-pointer z-10">
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                        
                        <div className="p-8 md:p-10">
                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">
                                ĐƠN HÀNG <span className="text-[#7c572d]">#{selectedOrder.order.ma_dh}</span>
                            </h2>

                            <div className="flex gap-8 border-b border-[#d4c4b7]/30 mb-6">
                                <button onClick={() => setModalTab('DETAIL')} className={`pb-3 text-xs font-bold uppercase tracking-widest cursor-pointer ${modalTab === 'DETAIL' ? 'border-b-2 border-[#7c572d] text-[#7c572d]' : 'text-[#50453b] hover:text-[#7c572d]'}`}>Xem sản phẩm</button>
                                <button onClick={() => setModalTab('EDIT')} className={`pb-3 text-xs font-bold uppercase tracking-widest cursor-pointer ${modalTab === 'EDIT' ? 'border-b-2 border-[#7c572d] text-[#7c572d]' : 'text-[#50453b] hover:text-[#7c572d]'}`}>Cập nhật trạng thái</button>
                            </div>
                            
                            {modalTab === 'DETAIL' && (
                                <div className="animate-fade-in">
                                    <div className="bg-[#f9f9f9] p-6 border border-[#d4c4b7]/30 mb-6">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#7c572d] mb-4">Thông tin giao hàng</h4>
                                        <p className="text-sm"><span className="font-bold text-[#50453b] w-24 inline-block">Người nhận:</span> {selectedOrder.order.ten_nguoi_nhan}</p>
                                        <p className="text-sm"><span className="font-bold text-[#50453b] w-24 inline-block">SĐT:</span> {selectedOrder.order.sdt_nguoi_nhan}</p>
                                        <p className="text-sm"><span className="font-bold text-[#50453b] w-24 inline-block">Địa chỉ:</span> {selectedOrder.order.dia_chi_ct}, {selectedOrder.order.quan_huyen}, {selectedOrder.order.thanh_pho}</p>
                                    </div>

                                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#7c572d] mb-4">Sản phẩm trong đơn</h4>
                                    <div className="space-y-4 mb-8">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 border-b border-[#d4c4b7]/30 pb-4">
                                                <img src={`${STORAGE_URL}/${item.hinh_anh}`} alt={item.ten_sp} className="w-16 h-20 object-cover bg-[#f3f3f3]" />
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm uppercase">{item.ten_sp}</p>
                                                    <p className="text-[10px] text-[#50453b] uppercase tracking-widest mt-1">Size: {item.kich_thuoc} - Màu: {item.mau_sac}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-sm">{formatPrice(item.don_gia)}</p>
                                                    <p className="text-[11px] text-[#50453b]">x {item.so_luong}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t-2 border-[#1a1c1c]">
                                        <span className="font-bold uppercase tracking-widest text-sm">TỔNG THANH TOÁN:</span>
                                        <span className="text-2xl font-black text-[#7c572d]">{formatPrice(selectedOrder.order.tong_tien)}</span>
                                    </div>
                                </div>
                            )}

                            {modalTab === 'EDIT' && (
                                <div className="bg-[#f9f9f9] p-8 border border-[#d4c4b7]/30 animate-fade-in text-center">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#7c572d] mb-2">Trạng thái hiện tại</h4>
                                    <p className="mb-8">
                                        <span className={`px-3 py-1.5 text-xs uppercase font-bold tracking-widest ${getStatusStyle(selectedOrder.order.trang_thai).color}`}>
                                            {getStatusStyle(selectedOrder.order.trang_thai).text}
                                        </span>
                                    </p>
                                    
                                    <div className="flex flex-col gap-3 max-w-sm mx-auto">
                                        {selectedOrder.order.trang_thai === 'CHO_XAC_NHAN' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(selectedOrder.order.ma_dh, 'DA_XAC_NHAN')} className="w-full py-3 bg-[#7c572d] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#1a1c1c] transition-colors cursor-pointer">
                                                    BƯỚC 1: XÁC NHẬN ĐƠN HÀNG
                                                </button>
                                                <button onClick={() => handleUpdateStatus(selectedOrder.order.ma_dh, 'DA_HUY')} className="w-full py-3 border border-[#ba1a1a] text-[#ba1a1a] text-xs font-bold uppercase tracking-widest hover:bg-[#ba1a1a]/10 transition-colors cursor-pointer mt-4">
                                                    Hủy đơn hàng này
                                                </button>
                                            </>
                                        )}

                                        {selectedOrder.order.trang_thai === 'DA_XAC_NHAN' && (
                                            <button onClick={() => handleUpdateStatus(selectedOrder.order.ma_dh, 'DANG_GIAO')} className="w-full py-3 bg-[#586062] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#1a1c1c] transition-colors cursor-pointer">
                                                BƯỚC 2: BẮT ĐẦU GIAO HÀNG
                                            </button>
                                        )}

                                        {selectedOrder.order.trang_thai === 'DANG_GIAO' && (
                                            <button onClick={() => handleUpdateStatus(selectedOrder.order.ma_dh, 'DA_GIAO')} className="w-full py-3 bg-[#1a1c1c] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#7c572d] transition-colors cursor-pointer">
                                                BƯỚC 3: XÁC NHẬN ĐÃ GIAO XONG
                                            </button>
                                        )}

                                        {selectedOrder.order.trang_thai === 'DA_GIAO' && (
                                            <p className="text-sm font-bold text-green-700 uppercase tracking-widest py-4 bg-green-50 border border-green-200">Đơn hàng đã hoàn tất giao dịch</p>
                                        )}
                                        {selectedOrder.order.trang_thai === 'DA_HUY' && (
                                            <p className="text-sm font-bold text-[#ba1a1a] uppercase tracking-widest py-4 bg-red-50 border border-red-200">Đơn hàng đã bị hủy bỏ</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}