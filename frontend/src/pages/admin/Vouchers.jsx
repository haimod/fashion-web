import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function Vouchers() {
    // ==========================================
    // STATE: VOUCHERS
    // ==========================================
    const [vouchers, setVouchers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); 
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ ma_code: '', loai_giam: 'percent', gia_tri_giam: '', don_toi_thieu: '0', so_lan_su_dung_toi_da: '100', ngay_bat_dau: '', ngay_het_han: '' });

    // ==========================================
    // STATE: FLASH SALE
    // ==========================================
    const [flashSales, setFlashSales] = useState([]); 
    const [selectedFS, setSelectedFS] = useState(null); 
    
    const [isFSModalOpen, setIsFSModalOpen] = useState(false); 
    const [fsForm, setFsForm] = useState({ ten_chuong_trinh: '', thoi_gian_bat_dau: '', thoi_gian_ket_thuc: '' });
    const [isSavingFS, setIsSavingFS] = useState(false);
    
    const [fsItems, setFsItems] = useState([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [availableVariants, setAvailableVariants] = useState([]);
    const [flashPriceInput, setFlashPriceInput] = useState({});
    const [variantSearchTerm, setVariantSearchTerm] = useState('');

    // ==========================================
    // STATE: MODAL XÁC NHẬN (THAY THẾ CONFIRM)
    // ==========================================
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, message: '' });

    // Hàm gọi Modal Xác nhận
    const openConfirmModal = (actionFunc, message) => {
        setConfirmModal({ isOpen: true, action: actionFunc, message });
    };

    // Hàm chạy action khi bấm "Xác Nhận"
    const executeConfirm = () => {
        if(confirmModal.action) confirmModal.action();
        setConfirmModal({ isOpen: false, action: null, message: '' });
    };

    // ==========================================
    // FETCH DATA API
    // ==========================================
    const fetchData = async () => {
        try {
            const [voucherRes, fsRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/admin/vouchers'),
                fetch('http://127.0.0.1:8000/api/admin/flash-sales') 
            ]);
            
            setVouchers(await voucherRes.json() || []);

            const fsDataText = await fsRes.text();
            if (fsDataText && fsDataText !== 'null' && fsDataText !== '') {
                const fsList = JSON.parse(fsDataText);
                setFlashSales(fsList);
                if(fsList.length > 0 && !selectedFS) {
                    handleSelectFS(fsList[0]);
                }
            } else {
                setFlashSales([]);
                setSelectedFS(null);
            }
        } catch (error) { toast.error('Lỗi kết nối máy chủ!'); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    // ==========================================
    // VOUCHER LOGIC 
    // ==========================================
    const openAddVoucherModal = () => {
        setModalMode('add');
        setEditingId(null);
        setFormData({ ma_code: '', loai_giam: 'percent', gia_tri_giam: '', don_toi_thieu: '0', so_lan_su_dung_toi_da: '100', ngay_bat_dau: '', ngay_het_han: '' });
        setIsModalOpen(true);
    };

    const openEditVoucherModal = (vc) => {
        setModalMode('edit');
        setEditingId(vc.ma_voucher);
        setFormData({ 
            ma_code: vc.ma_code, loai_giam: vc.loai_giam, gia_tri_giam: vc.gia_tri_giam, 
            don_toi_thieu: vc.don_toi_thieu, so_lan_su_dung_toi_da: vc.so_lan_su_dung_toi_da, 
            ngay_bat_dau: vc.ngay_bat_dau.slice(0, 16), ngay_het_han: vc.ngay_het_han ? vc.ngay_het_han.slice(0, 16) : '' 
        });
        setIsModalOpen(true);
    };

    // ĐÃ THAY THẾ WINDOW.CONFIRM
    const handleDeleteVoucher = (id) => {
        openConfirmModal(async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/admin/vouchers/${id}`, { method: 'DELETE' });
                if(res.ok) { toast.success('Đã xóa Voucher thành công!'); fetchData(); }
            } catch (error) { toast.error('Lỗi kết nối Server!'); }
        }, 'Bạn có chắc chắn muốn xóa mã Voucher này vĩnh viễn không?');
    };

    const handleSaveVoucher = async (e) => {
        e.preventDefault();
        const url = modalMode === 'add' ? 'http://127.0.0.1:8000/api/admin/vouchers' : `http://127.0.0.1:8000/api/admin/vouchers/${editingId}`;
        const method = modalMode === 'add' ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(formData) });
            if (response.ok) { 
                toast.success(modalMode === 'add' ? 'Tạo Voucher thành công!' : 'Cập nhật thành công!'); 
                setIsModalOpen(false); 
                fetchData(); 
            } else toast.error('Kiểm tra lại dữ liệu!');
        } catch (error) { toast.error('Lỗi kết nối Server'); }
    };

    const filteredVouchers = vouchers.filter(vc => {
        const matchSearch = vc.ma_code.toLowerCase().includes(searchTerm.toLowerCase());
        const now = new Date();
        const startDate = new Date(vc.ngay_bat_dau);
        const endDate = new Date(vc.ngay_het_han);
        const isDepleted = vc.so_lan_da_dung >= vc.so_lan_su_dung_toi_da;

        let status = 'active';
        if (now < startDate) status = 'upcoming';
        else if (now > endDate || isDepleted) status = 'expired';

        return matchSearch && (filterStatus === 'all' || filterStatus === status);
    });

    // ==========================================
    // FLASH SALE LOGIC 
    // ==========================================
    const handleSelectFS = async (fs) => {
        setSelectedFS(fs);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/admin/flash-sales/${fs.ma_fs}/items`);
            if(res.ok) setFsItems(await res.json() || []);
        } catch(error) { console.error(error); }
    };

    const handleSaveFlashSale = async (e) => {
        e.preventDefault();
        setIsSavingFS(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/flash-sales', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(fsForm) });
            if (response.ok) { 
                toast.success('Đã lên lịch chiến dịch Flash Sale!'); 
                setIsFSModalOpen(false);
                setFsForm({ ten_chuong_trinh: '', thoi_gian_bat_dau: '', thoi_gian_ket_thuc: '' });
                fetchData(); 
            } else toast.error('Dữ liệu không hợp lệ!');
        } catch (error) { toast.error('Lỗi kết nối Server!'); } 
        finally { setIsSavingFS(false); }
    };

    // ĐÃ THAY THẾ WINDOW.CONFIRM
    const handleDeleteFS = (ma_fs) => {
        openConfirmModal(async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/admin/flash-sales/${ma_fs}`, { method: 'DELETE' });
                if(res.ok) {
                    toast.success('Đã hủy chiến dịch Flash Sale!');
                    if(selectedFS?.ma_fs === ma_fs) { setSelectedFS(null); setFsItems([]); }
                    fetchData();
                }
            } catch (error) { toast.error('Lỗi hệ thống!'); }
        }, 'CẢNH BÁO: Bạn có chắc chắn muốn hủy chiến dịch Flash Sale này không? Toàn bộ sản phẩm bên trong sẽ bị xóa!');
    };

    // --- LOGIC SẢN PHẨM FS ---
    const openAddProductModal = async () => {
        if(!selectedFS) return;
        const res = await fetch(`http://127.0.0.1:8000/api/admin/flash-sales/${selectedFS.ma_fs}/available-variants`);
        setAvailableVariants(await res.json());
        setFlashPriceInput({});
        setVariantSearchTerm(''); 
        setIsProductModalOpen(true);
    };

    const handleAddVariantToFS = async (variant) => {
        const gia_flash = flashPriceInput[variant.ma_bien_the];
        if(!gia_flash || gia_flash <= 0) { toast.warning('Vui lòng nhập giá hợp lệ!'); return; }
        if(parseFloat(gia_flash) >= parseFloat(variant.gia_ban)) { toast.error('Giá Flash Sale phải nhỏ hơn giá gốc!'); return; }

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/admin/flash-sales/${selectedFS.ma_fs}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ma_bien_the: variant.ma_bien_the, gia_flash: gia_flash }) });
            if(res.ok) {
                toast.success('Đã thêm sản phẩm vào Flash Sale!');
                setAvailableVariants(prev => prev.filter(v => v.ma_bien_the !== variant.ma_bien_the));
                handleSelectFS(selectedFS); 
            }
        } catch (error) { toast.error('Lỗi hệ thống!'); }
    };

    const handleRemoveFSItem = async (ma_bien_the) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/admin/flash-sales/${selectedFS.ma_fs}/items/${ma_bien_the}`, { method: 'DELETE' });
            if(res.ok) { toast.success('Đã gỡ sản phẩm!'); handleSelectFS(selectedFS); }
        } catch (error) { toast.error('Lỗi hệ thống!'); }
    };

    const filteredVariantsForModal = availableVariants.filter(variant => 
        variant.ten_sp.toLowerCase().includes(variantSearchTerm.toLowerCase()) || 
        variant.ma_bien_the.toLowerCase().includes(variantSearchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'VÔ THỜI HẠN';
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    };

    const totalUsed = vouchers.reduce((sum, vc) => sum + vc.so_lan_da_dung, 0);

    return (
        <div className="space-y-16">
            <section className="flex justify-between items-end">
                <div className="space-y-2">
                    <p className="font-['Be_Vietnam_Pro'] uppercase tracking-[0.2rem] text-[0.7rem] text-primary font-bold">Marketing Hub</p>
                    <h2 className="text-5xl font-black tracking-tighter text-on-background leading-none">QUẢN LÝ KHUYẾN MÃI</h2>
                </div>
                <button onClick={openAddVoucherModal} className="bg-primary text-white px-8 py-4 font-['Be_Vietnam_Pro'] uppercase tracking-[0.15rem] text-[0.75rem] font-bold flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all vibe-shadow">
                    <span className="material-symbols-outlined text-[1.2rem]">add</span> Tạo Voucher Mới
                </button>
            </section>

            {/* BỘ LỌC VOUCHER */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest p-6 vibe-shadow items-end">
                <div className="flex flex-col gap-2 relative">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Tìm kiếm mã Voucher</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
                        <input type="text" placeholder="Nhập mã CODE..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent border-b border-outline-variant/50 py-2 pl-8 focus:border-primary outline-none font-medium text-sm transition-colors uppercase"/>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Lọc trạng thái hoạt động</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none font-medium text-sm text-on-surface cursor-pointer">
                        <option value="all">Tất cả Voucher</option><option value="active">Đang chạy</option><option value="upcoming">Sắp diễn ra</option><option value="expired">Kết thúc</option>
                    </select>
                </div>
            </section>

            {/* DANH SÁCH VOUCHER */}
            <section className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {isLoading ? <div className="col-span-3 text-center py-10">Đang tải...</div> : filteredVouchers.map((vc, index) => {
                        const percentUsed = vc.so_lan_su_dung_toi_da > 0 ? (vc.so_lan_da_dung / vc.so_lan_su_dung_toi_da) * 100 : 0;
                        const isPercent = vc.loai_giam === 'percent';
                        const cardStyles = index % 2 === 0 ? "bg-surface-container-low border-l-4 border-primary" : "bg-surface-container-lowest border border-outline-variant/10";
                        const badgeStyles = index % 2 === 0 ? "bg-primary-container/20 text-primary" : "bg-secondary-container text-on-secondary-container";
                        return (
                            <div key={vc.ma_voucher} className={`${cardStyles} p-8 flex flex-col justify-between h-[320px] vibe-shadow hover:scale-[1.02] transition-transform`}>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <span className={`${badgeStyles} px-3 py-1 font-['Be_Vietnam_Pro'] uppercase tracking-[0.1rem] text-[0.6rem] font-black`}>GIẢM {isPercent ? `${Number(vc.gia_tri_giam)}%` : `${(Number(vc.gia_tri_giam)/1000)}K`}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditVoucherModal(vc)} className="material-symbols-outlined text-secondary hover:text-primary transition-colors text-[1.2rem]">edit</button>
                                            <button onClick={() => handleDeleteVoucher(vc.ma_voucher)} className="material-symbols-outlined text-secondary hover:text-error transition-colors text-[1.2rem]">delete</button>
                                        </div>
                                    </div>
                                    <div><h4 className="text-3xl font-black tracking-tighter mb-1">{vc.ma_code}</h4><p className="font-['Be_Vietnam_Pro'] uppercase tracking-[0.1rem] text-[0.65rem] text-on-surface-variant">Đơn tối thiểu: {Number(vc.don_toi_thieu).toLocaleString()}đ</p></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-full bg-surface-container-high h-[2px]"><div className={`${index % 2 === 0 ? "bg-primary" : "bg-secondary"} h-full`} style={{ width: `${percentUsed}%` }}></div></div>
                                    <div className="flex justify-between font-['Be_Vietnam_Pro'] uppercase tracking-[0.1rem] text-[0.65rem] font-bold"><span className="text-on-surface-variant">ĐÃ DÙNG: {vc.so_lan_da_dung}/{vc.so_lan_su_dung_toi_da}</span><span className={vc.ngay_het_han ? "text-primary" : "text-secondary"}>HẾT HẠN: {formatDate(vc.ngay_het_han)}</span></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* FLASH SALE SECTION */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                        <h3 className="font-['Be_Vietnam_Pro'] uppercase tracking-[0.15rem] text-[0.8rem] font-black text-on-background">CÁC CHIẾN DỊCH FS</h3>
                        <button onClick={() => setIsFSModalOpen(true)} className="bg-on-background text-white px-3 py-1 font-['Be_Vietnam_Pro'] uppercase tracking-[0.1rem] text-[0.6rem] font-bold hover:bg-primary transition-colors">
                            + TẠO MỚI
                        </button>
                    </div>
                    
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {flashSales.length === 0 ? (
                            <p className="text-center text-sm font-medium text-outline">Chưa có chiến dịch nào.</p>
                        ) : flashSales.map(fs => {
                            const now = new Date();
                            const start = new Date(fs.thoi_gian_bat_dau);
                            const end = new Date(fs.thoi_gian_ket_thuc);
                            let statusText = 'LÊN LỊCH'; let statusColor = 'text-primary';
                            if(now >= start && now <= end) { statusText = 'ĐANG CHẠY'; statusColor = 'text-error animate-pulse'; }
                            else if(now > end) { statusText = 'KẾT THÚC'; statusColor = 'text-secondary'; }

                            const isSelected = selectedFS?.ma_fs === fs.ma_fs;

                            return (
                                <div key={fs.ma_fs} onClick={() => handleSelectFS(fs)} className={`p-5 cursor-pointer border transition-all vibe-shadow ${isSelected ? 'bg-primary text-white border-primary' : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-black text-base uppercase tracking-tight line-clamp-1 flex-1 pr-2">{fs.ten_chuong_trinh}</h4>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteFS(fs.ma_fs); }} className={`material-symbols-outlined text-sm hover:text-error ${isSelected ? 'text-white/70' : 'text-outline'}`}>delete</button>
                                    </div>
                                    <p className={`text-[0.65rem] font-bold uppercase tracking-widest ${isSelected ? 'text-white/90' : statusColor}`}>• {statusText}</p>
                                    <p className={`text-[0.6rem] mt-2 font-medium ${isSelected ? 'text-white/70' : 'text-on-surface-variant'}`}>
                                        {fs.thoi_gian_bat_dau.slice(0,16).replace('T', ' ')} <br/> {fs.thoi_gian_ket_thuc.slice(0,16).replace('T', ' ')}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                        <h3 className="font-['Be_Vietnam_Pro'] uppercase tracking-[0.15rem] text-[0.8rem] font-black text-on-background">
                            {selectedFS ? `SẢN PHẨM: ${selectedFS.ten_chuong_trinh}` : 'CHỌN CHIẾN DỊCH ĐỂ XEM'}
                        </h3>
                        {selectedFS && (
                            <button onClick={openAddProductModal} className="text-primary font-['Be_Vietnam_Pro'] uppercase tracking-[0.1rem] text-[0.65rem] font-bold hover:underline flex items-center gap-1">
                                <span className="material-symbols-outlined text-[1rem]">playlist_add</span> Thêm SP vào chiến dịch
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                        {!selectedFS ? (
                            <div className="text-center py-10 border border-dashed border-outline-variant text-outline font-bold text-sm">Chọn một chiến dịch bên trái để xem và thêm sản phẩm.</div>
                        ) : fsItems.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-primary/50 text-primary font-bold text-sm bg-primary/5">Chiến dịch này chưa có sản phẩm nào. Bấm thêm ngay!</div>
                        ) : (
                            fsItems.map(item => (
                                <div key={item.ma_bien_the} className="flex items-center gap-6 p-4 bg-surface-container-lowest hover:bg-surface-container-high transition-colors vibe-shadow">
                                    <div className="w-16 h-20 flex-shrink-0 bg-surface-container-high">
                                        {item.hinh_anh && <img className="w-full h-full object-cover" src={`http://127.0.0.1:8000/storage/${item.hinh_anh}`} alt="SP" />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h5 className="text-sm font-bold tracking-tight uppercase">{item.ten_sp}</h5>
                                        <p className="font-['Be_Vietnam_Pro'] uppercase tracking-[0.1rem] text-[0.6rem] text-on-surface-variant">Mã BT: {item.ma_bien_the} | Size: {item.kich_thuoc} | Màu: {item.mau_sac}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[0.65rem] text-secondary line-through">{Number(item.gia_ban).toLocaleString()}đ</p>
                                            <p className="font-black text-primary text-sm">{Number(item.gia_flash).toLocaleString()}đ</p>
                                        </div>
                                        <button onClick={() => handleRemoveFSItem(item.ma_bien_the)} className="material-symbols-outlined text-error opacity-40 hover:opacity-100 cursor-pointer transition-opacity">close</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Thống kê */}
            <section className="bg-surface-container-high p-12 flex flex-col md:flex-row justify-between items-center gap-12 vibe-shadow">
                <div className="space-y-2 text-center md:text-left">
                    <h4 className="text-2xl font-black tracking-tighter">HIỆU QUẢ CHIẾN DỊCH</h4>
                </div>
                <div className="flex gap-16">
                    <div className="text-center">
                        <p className="text-4xl font-black text-primary">{vouchers.length}</p>
                        <p className="font-['Be_Vietnam_Pro'] uppercase tracking-[0.1rem] text-[0.6rem] font-bold mt-2">Tổng số Voucher</p>
                    </div>
                    <div className="text-center border-x border-outline-variant/30 px-16">
                        <p className="text-4xl font-black text-on-background">{totalUsed}</p>
                        <p className="font-['Be_Vietnam_Pro'] uppercase tracking-[0.1rem] text-[0.6rem] font-bold mt-2">Lượt đã sử dụng</p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-black text-primary">{flashSales.length}</p>
                        <p className="font-['Be_Vietnam_Pro'] uppercase tracking-[0.1rem] text-[0.6rem] font-bold mt-2">Chiến dịch FS</p>
                    </div>
                </div>
            </section>

            {/* MODAL TẠO / SỬA VOUCHER */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/40 backdrop-blur-sm transition-all p-4">
                    <form onSubmit={handleSaveVoucher} className="bg-surface p-10 max-w-2xl w-full vibe-shadow flex flex-col gap-6 animate-fade-in-up">
                        <h3 className="text-xl font-black uppercase tracking-widest text-on-surface mb-2">{modalMode === 'add' ? 'Tạo Voucher Mới' : 'Cập Nhật Voucher'}</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Mã CODE (Viết liền, không dấu)</label>
                                    <input required disabled={modalMode === 'edit'} value={formData.ma_code} onChange={(e) => setFormData({...formData, ma_code: e.target.value.toUpperCase()})} placeholder="VD: SUMMER50" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-bold text-sm uppercase disabled:text-outline-variant disabled:cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Loại Giảm Giá</label>
                                    <select value={formData.loai_giam} onChange={(e) => setFormData({...formData, loai_giam: e.target.value})} className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm cursor-pointer">
                                        <option value="percent">Giảm theo % (Phần trăm)</option><option value="fixed">Giảm tiền mặt (VND)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Mức Giảm (Số)</label>
                                    <input required type="number" min="0" value={formData.gia_tri_giam} onChange={(e) => setFormData({...formData, gia_tri_giam: e.target.value})} placeholder={formData.loai_giam === 'percent' ? "VD: 20" : "VD: 50000"} className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Đơn tối thiểu (VND)</label>
                                    <input type="number" min="0" value={formData.don_toi_thieu} onChange={(e) => setFormData({...formData, don_toi_thieu: e.target.value})} className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Số lượt sử dụng tối đa</label>
                                    <input required type="number" min="1" value={formData.so_lan_su_dung_toi_da} onChange={(e) => setFormData({...formData, so_lan_su_dung_toi_da: e.target.value})} className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col gap-2 w-full">
                                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Bắt đầu</label>
                                        <input required type="datetime-local" value={formData.ngay_bat_dau} onChange={(e) => setFormData({...formData, ngay_bat_dau: e.target.value})} className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-[0.75rem]" />
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Kết thúc</label>
                                        <input required type="datetime-local" value={formData.ngay_het_han} onChange={(e) => setFormData({...formData, ngay_het_han: e.target.value})} className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-[0.75rem]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors">Hủy</button>
                            <button type="submit" className="px-6 py-3 bg-primary text-on-primary text-[0.65rem] font-bold uppercase tracking-[0.2rem] hover:bg-primary/90 transition-colors vibe-shadow">Lưu Thay Đổi</button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL TẠO FLASH SALE */}
            {isFSModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/40 backdrop-blur-sm transition-all p-4">
                    <form onSubmit={handleSaveFlashSale} className="bg-surface p-10 max-w-md w-full vibe-shadow flex flex-col gap-6 animate-fade-in-up">
                        <h3 className="text-xl font-black uppercase tracking-widest text-on-surface mb-2">TẠO CHIẾN DỊCH FLASH SALE</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-primary">Tên Chương Trình</label>
                                <input required type="text" value={fsForm.ten_chuong_trinh} onChange={(e) => setFsForm({...fsForm, ten_chuong_trinh: e.target.value})} className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-bold outline-none" placeholder="VD: SIÊU SALE NỬA ĐÊM" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-primary">Thời Gian Bắt Đầu</label>
                                <input required type="datetime-local" value={fsForm.thoi_gian_bat_dau} onChange={(e) => setFsForm({...fsForm, thoi_gian_bat_dau: e.target.value})} className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-bold outline-none text-sm" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-primary">Thời Gian Kết Thúc</label>
                                <input required type="datetime-local" value={fsForm.thoi_gian_ket_thuc} onChange={(e) => setFsForm({...fsForm, thoi_gian_ket_thuc: e.target.value})} className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-bold outline-none text-sm" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-4">
                            <button type="button" onClick={() => setIsFSModalOpen(false)} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline hover:bg-surface-container-high transition-colors">Hủy</button>
                            <button type="submit" disabled={isSavingFS} className="px-6 py-3 bg-primary text-on-primary text-[0.65rem] font-bold uppercase tracking-[0.2rem] hover:bg-primary/90 transition-colors vibe-shadow disabled:opacity-50">Kích Hoạt</button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL THÊM SẢN PHẨM VÀO FLASH SALE */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/40 backdrop-blur-sm transition-all p-4">
                    <div className="bg-surface p-8 max-w-3xl w-full vibe-shadow flex flex-col h-[80vh]">
                        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-4">
                            <h3 className="text-xl font-black uppercase tracking-widest text-on-surface">CHỌN BIẾN THỂ THAM GIA FLASH SALE</h3>
                            <button onClick={() => setIsProductModalOpen(false)} className="material-symbols-outlined hover:text-error transition-colors">close</button>
                        </div>
                        <div className="mb-4 relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm">search</span>
                            <input type="text" placeholder="Gõ tên sản phẩm hoặc mã để tìm nhanh..." value={variantSearchTerm} onChange={(e) => setVariantSearchTerm(e.target.value)} className="w-full bg-surface-container-high border-none py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-primary text-sm font-medium"/>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {filteredVariantsForModal.length === 0 ? <p className="text-center py-10 text-outline font-bold">Không tìm thấy biến thể nào.</p> : filteredVariantsForModal.map(variant => (
                                <div key={variant.ma_bien_the} className="flex items-center gap-4 p-4 border border-outline-variant/20 hover:border-primary/50 transition-colors">
                                    <div className="w-12 h-16 bg-surface-container-high">
                                        {variant.hinh_anh && <img className="w-full h-full object-cover" src={`http://127.0.0.1:8000/storage/${variant.hinh_anh}`} alt="sp"/>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm uppercase">{variant.ten_sp}</p>
                                        <p className="text-[0.65rem] text-on-surface-variant font-medium">Mã BT: {variant.ma_bien_the} | Size: {variant.kich_thuoc} | Màu: {variant.mau_sac}</p>
                                        <p className="text-[0.65rem] font-bold mt-1">Giá gốc: <span className="line-through text-secondary">{Number(variant.gia_ban).toLocaleString()}đ</span></p>
                                    </div>
                                    <div className="flex flex-col gap-2 w-32">
                                        <input type="number" placeholder="Giá Flash..." value={flashPriceInput[variant.ma_bien_the] || ''} onChange={(e) => setFlashPriceInput({...flashPriceInput, [variant.ma_bien_the]: e.target.value})} className="bg-transparent border-b border-outline-variant focus:border-primary outline-none text-xs font-bold py-1 px-2 w-full"/>
                                        <button onClick={() => handleAddVariantToFS(variant)} className="bg-primary text-white text-[0.6rem] font-bold uppercase py-2 hover:bg-primary/90 transition-colors">Thêm vào FS</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL XÁC NHẬN (Thay thế window.confirm) */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1A1C1C]/60 backdrop-blur-sm transition-all p-4">
                    <div className="bg-surface p-8 max-w-sm w-full vibe-shadow flex flex-col gap-6 animate-fade-in-up border-t-4 border-error">
                        <h3 className="text-lg font-black uppercase tracking-widest text-error mb-2">Cảnh báo</h3>
                        <p className="text-[0.8rem] font-medium text-on-surface-variant leading-relaxed">
                            {confirmModal.message}
                        </p>
                        <div className="flex justify-end gap-4 mt-2">
                            <button onClick={() => setConfirmModal({ isOpen: false, action: null, message: '' })} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline hover:bg-surface-container-high transition-colors">Hủy</button>
                            <button onClick={executeConfirm} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] bg-error text-on-error hover:bg-error/90 transition-colors vibe-shadow">
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}