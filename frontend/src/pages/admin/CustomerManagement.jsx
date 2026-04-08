import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- BỘ LỌC & TÌM KIẾM ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // --- PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const customersPerPage = 5;

    // --- MODAL THÊM/SỬA ---
    const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'add', data: null });
    const [formData, setFormData] = useState({
        ma_kh: '', tenkh: '', email: '', sodt: '', matkhau: '', role: 'customer'
    });

    // --- MODAL KHÓA/MỞ KHÓA TÀI KHOẢN ---
    const [toggleModal, setToggleModal] = useState({ isOpen: false, id: null, currentStatus: null });

    const fetchCustomers = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/customers');
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            toast.error('Lỗi tải dữ liệu khách hàng!');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, []);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

    // ==========================================
    // LOGIC LỌC & PHÂN TRANG
    // ==========================================
    const filteredCustomers = customers.filter(cus => {
        const matchSearch = cus.tenkh.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            cus.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cus.sodt.includes(searchTerm);
        
        let matchStatus = true;
        if (filterStatus === 'active') matchStatus = cus.trang_thai === 1;
        if (filterStatus === 'banned') matchStatus = cus.trang_thai === 0;

        return matchSearch && matchStatus;
    });

    const indexOfLastCus = currentPage * customersPerPage;
    const indexOfFirstCus = indexOfLastCus - customersPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstCus, indexOfLastCus);
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const prevPage = () => setCurrentPage(prev => prev > 1 ? prev - 1 : 1);
    const nextPage = () => setCurrentPage(prev => prev < totalPages ? prev + 1 : totalPages);

    // ==========================================
    // XỬ LÝ FORM THÊM / SỬA
    // ==========================================
    const openModal = (mode, customer = null) => {
        setModalConfig({ isOpen: true, mode, data: customer });
        if (mode === 'edit') {
            // Khi sửa, chỉ lấy những thông tin cần thiết
            setFormData({
                ma_kh: customer.ma_kh, tenkh: customer.tenkh, email: customer.email, sodt: customer.sodt, matkhau: '', role: customer.role
            });
        } else {
            setFormData({ ma_kh: '', tenkh: '', email: '', sodt: '', matkhau: '', role: 'customer' });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const url = modalConfig.mode === 'add' 
            ? 'http://127.0.0.1:8000/api/admin/customers' 
            : `http://127.0.0.1:8000/api/admin/customers/${formData.ma_kh}`;
            
        const method = modalConfig.mode === 'add' ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success(modalConfig.mode === 'add' ? 'Thêm khách hàng thành công!' : 'Cập nhật thành công!');
                setModalConfig({ isOpen: false, mode: 'add', data: null });
                fetchCustomers(); 
            } else {
                const err = await response.json();
                toast.error(err.message || 'Có lỗi xảy ra, kiểm tra lại dữ liệu!');
            }
        } catch (error) {
            toast.error('Lỗi kết nối Server');
        }
    };

    // ==========================================
    // XỬ LÝ KHÓA / MỞ KHÓA TÀI KHOẢN
    // ==========================================
    const executeToggleStatus = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/customers/${toggleModal.id}/toggle-status`, { 
                method: 'PATCH',
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                toast.success('Cập nhật trạng thái tài khoản thành công!');
                fetchCustomers(); // Load lại data để thấy màu đổi
            } else {
                toast.error('Không thể cập nhật trạng thái!');
            }
        } catch (error) {
            toast.error('Lỗi kết nối server!');
        } finally {
            setToggleModal({ isOpen: false, id: null, currentStatus: null });
        }
    };

    return (
        <>
            <div className="flex justify-between items-end mb-10 border-b-0">
                <div className="max-w-2xl">
                    <h2 className="text-5xl font-bold tracking-tight text-on-background mb-4 uppercase">QUẢN LÝ KHÁCH HÀNG</h2>
                    <p className="text-on-surface-variant font-light text-lg">Quản lý tài khoản, thông tin liên hệ và trạng thái của người dùng.</p>
                </div>
                <button 
                    onClick={() => openModal('add')} 
                    className="px-10 py-4 bg-gradient-to-tr from-primary to-primary-container text-on-primary font-bold uppercase tracking-[0.15rem] text-[0.7rem] vibe-shadow hover:opacity-90 transition-all whitespace-nowrap"
                >
                    THÊM KHÁCH HÀNG MỚI
                </button>
            </div>

            {/* THANH BỘ LỌC */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-surface-container-lowest p-6 vibe-shadow items-end">
                <div className="col-span-1 md:col-span-2 flex flex-col gap-2 relative">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Tìm kiếm</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
                        <input 
                            type="text" 
                            placeholder="Nhập tên, email hoặc SĐT..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-b border-outline-variant/50 py-2 pl-8 focus:border-primary outline-none font-medium text-sm transition-colors"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Lọc trạng thái</label>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none font-medium text-sm text-on-surface cursor-pointer"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="banned">Bị khóa (Banned)</option>
                    </select>
                </div>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-surface-container-lowest vibe-shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low border-b-0">
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Khách Hàng</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Liên Hệ</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Trạng Thái</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-0">
                        {isLoading ? (
                            <tr><td colSpan="4" className="text-center py-10 text-outline">Đang tải...</td></tr>
                        ) : filteredCustomers.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-10 text-outline">Không tìm thấy khách hàng nào.</td></tr>
                        ) : currentCustomers.map((cus) => (
                            <tr key={cus.ma_kh} className={`transition-all border-b border-outline-variant/10 ${cus.trang_thai === 0 ? 'bg-error/5' : 'hover:bg-surface-container-low'}`}>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className={`font-bold text-base uppercase ${cus.trang_thai === 0 ? 'text-outline' : 'text-on-surface'}`}>{cus.tenkh}</span>
                                        <span className="text-[0.6rem] font-medium tracking-widest text-outline uppercase mt-1">ID: {cus.ma_kh} • {cus.role}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                                            <span className="material-symbols-outlined text-[1rem]">mail</span> {cus.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                                            <span className="material-symbols-outlined text-[1rem]">call</span> {cus.sodt}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    {cus.trang_thai === 1 ? (
                                        <span className="px-3 py-1 text-[0.65rem] font-bold bg-primary-container text-on-primary-container uppercase tracking-widest">Hoạt động</span>
                                    ) : (
                                        <span className="px-3 py-1 text-[0.65rem] font-bold bg-error text-on-error uppercase tracking-widest">Đã khóa</span>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => openModal('edit', cus)} className="p-2 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button 
                                            onClick={() => setToggleModal({ isOpen: true, id: cus.ma_kh, currentStatus: cus.trang_thai })} 
                                            className={`p-2 transition-colors ${cus.trang_thai === 1 ? 'hover:text-error' : 'hover:text-primary'}`}
                                            title={cus.trang_thai === 1 ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                        >
                                            <span className="material-symbols-outlined text-lg">{cus.trang_thai === 1 ? 'lock' : 'lock_open'}</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PHÂN TRANG */}
            <footer className="mt-12 flex justify-between items-center py-10 border-t border-outline-variant/10">
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.2rem] text-outline">
                    Đang hiển thị {filteredCustomers.length === 0 ? 0 : indexOfFirstCus + 1}-{Math.min(indexOfLastCus, filteredCustomers.length)} của {filteredCustomers.length} khách hàng
                </span>
                {totalPages > 1 && (
                    <div className="flex items-center gap-12">
                        <button onClick={prevPage} disabled={currentPage === 1} className={`group flex items-center gap-3 text-[0.65rem] font-black uppercase tracking-[0.2rem] transition-all ${currentPage === 1 ? 'text-outline-variant/50 cursor-not-allowed' : 'text-outline hover:text-primary'}`}><span className="material-symbols-outlined text-sm">arrow_back</span> Trước</button>
                        <div className="flex items-center gap-6">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button key={number} onClick={() => paginate(number)} className={`text-sm font-bold transition-colors ${currentPage === number ? 'text-primary' : 'text-outline-variant hover:text-on-background'}`}>{number < 10 ? `0${number}` : number}</button>
                            ))}
                        </div>
                        <button onClick={nextPage} disabled={currentPage === totalPages} className={`group flex items-center gap-3 text-[0.65rem] font-black uppercase tracking-[0.2rem] transition-all ${currentPage === totalPages ? 'text-outline-variant/50 cursor-not-allowed' : 'text-on-background hover:text-primary'}`}>Sau <span className="material-symbols-outlined text-sm">arrow_forward</span></button>
                    </div>
                )}
            </footer>

            {/* MODAL THÊM/SỬA */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/40 backdrop-blur-sm transition-all">
                    <form onSubmit={handleSave} className="bg-surface p-10 max-w-2xl w-full vibe-shadow flex flex-col gap-6 animate-fade-in-up">
                        <h3 className="text-xl font-black uppercase tracking-widest text-on-surface mb-2">
                            {modalConfig.mode === 'add' ? 'Thêm Khách Hàng' : 'Cập Nhật Thông Tin'}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Mã KH (ID)</label>
                                    <input required value={formData.ma_kh} onChange={(e) => setFormData({...formData, ma_kh: e.target.value.toUpperCase()})} disabled={modalConfig.mode === 'edit'} placeholder="VD: KH_001" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-bold text-sm disabled:text-outline-variant disabled:cursor-not-allowed uppercase" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Họ và Tên</label>
                                    <input required value={formData.tenkh} onChange={(e) => setFormData({...formData, tenkh: e.target.value})} placeholder="Nguyễn Văn A" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Số Điện Thoại</label>
                                    <input required value={formData.sodt} onChange={(e) => setFormData({...formData, sodt: e.target.value})} placeholder="09..." className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Email (Dùng đăng nhập)</label>
                                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={modalConfig.mode === 'edit'} placeholder="email@example.com" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm disabled:text-outline-variant disabled:cursor-not-allowed" />
                                </div>
                                {modalConfig.mode === 'add' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Mật khẩu</label>
                                        <input required type="password" value={formData.matkhau} onChange={(e) => setFormData({...formData, matkhau: e.target.value})} placeholder="Ít nhất 6 ký tự" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Phân Quyền (Role)</label>
                                    <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} disabled={modalConfig.mode === 'edit'} className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm disabled:text-outline-variant disabled:cursor-not-allowed cursor-pointer">
                                        <option value="customer">Customer (Khách mua hàng)</option>
                                        <option value="admin">Admin (Quản trị viên)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button type="button" onClick={() => setModalConfig({ isOpen: false, mode: 'add', data: null })} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors">Hủy</button>
                            <button type="submit" className="px-6 py-3 bg-primary text-on-primary text-[0.65rem] font-bold uppercase tracking-[0.2rem] hover:bg-primary/90 transition-colors vibe-shadow">Lưu lại</button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL KHÓA/MỞ KHÓA TÀI KHOẢN */}
            {toggleModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/40 backdrop-blur-sm transition-all">
                    <div className="bg-surface p-8 max-w-sm w-full vibe-shadow flex flex-col gap-6 animate-fade-in-up">
                        <h3 className={`text-lg font-black uppercase tracking-widest mb-2 ${toggleModal.currentStatus === 1 ? 'text-error' : 'text-primary'}`}>Cảnh báo</h3>
                        <p className="text-[0.8rem] font-medium text-on-surface-variant leading-relaxed">
                            Bạn có chắc chắn muốn {toggleModal.currentStatus === 1 ? 'KHÓA' : 'MỞ KHÓA'} tài khoản <span className="font-bold text-on-surface">{toggleModal.id}</span>? 
                            {toggleModal.currentStatus === 1 ? ' Khách hàng sẽ không thể đăng nhập mua hàng nữa.' : ' Khách hàng sẽ có thể đăng nhập lại bình thường.'}
                        </p>
                        <div className="flex justify-end gap-4 mt-2">
                            <button onClick={() => setToggleModal({ isOpen: false, id: null, currentStatus: null })} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline hover:bg-surface-container-high transition-colors">Hủy</button>
                            <button onClick={executeToggleStatus} className={`px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] vibe-shadow ${toggleModal.currentStatus === 1 ? 'bg-error text-on-error hover:bg-error/90' : 'bg-primary text-on-primary hover:bg-primary/90'}`}>
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}