import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- STATE CHO TÌM KIẾM & BỘ LỌC ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, in_use, empty

    // --- STATE PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const categoriesPerPage = 5;

    // State cho Modal
    const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'add', data: null });
    const [formData, setFormData] = useState({ ma_dm: '', ten_dm: '' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            toast.error('Lỗi tải danh mục!');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    // Reset về trang 1 khi gõ tìm kiếm hoặc lọc
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    // ==========================================
    // LOGIC LỌC (FILTER) & TÌM KIẾM (SEARCH)
    // ==========================================
    const filteredCategories = categories.filter(cat => {
        const matchSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            cat.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchStatus = true;
        if (filterStatus === 'in_use') matchStatus = cat.product_count > 0;
        if (filterStatus === 'empty') matchStatus = cat.product_count === 0;

        return matchSearch && matchStatus;
    });

    // ==========================================
    // LOGIC PHÂN TRANG
    // ==========================================
    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
    const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const prevPage = () => setCurrentPage(prev => prev > 1 ? prev - 1 : 1);
    const nextPage = () => setCurrentPage(prev => prev < totalPages ? prev + 1 : totalPages);

    // Bật Modal Thêm/Sửa
    const openModal = (mode, category = null) => {
        setModalConfig({ isOpen: true, mode, data: category });
        if (mode === 'edit') {
            setFormData({ ma_dm: category.id, ten_dm: category.name });
        } else {
            setFormData({ ma_dm: '', ten_dm: '' });
        }
    };

    // Lưu dữ liệu
    const handleSave = async (e) => {
        e.preventDefault();
        const url = modalConfig.mode === 'add' 
            ? 'http://127.0.0.1:8000/api/admin/categories' 
            : `http://127.0.0.1:8000/api/admin/categories/${formData.ma_dm}`;
            
        const method = modalConfig.mode === 'add' ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success(modalConfig.mode === 'add' ? 'Thêm thành công!' : 'Cập nhật thành công!');
                setModalConfig({ isOpen: false, mode: 'add', data: null });
                fetchCategories(); 
            } else {
                const err = await response.json();
                toast.error(err.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            toast.error('Lỗi kết nối Server');
        }
    };

    // Xóa danh mục
    const executeDelete = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/categories/${deleteModal.id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success('Xóa danh mục thành công!');
                setCategories(categories.filter(c => c.id !== deleteModal.id));
            } else {
                const err = await response.json();
                toast.error(err.message || 'Không thể xóa!');
            }
        } catch (error) {
            toast.error('Lỗi kết nối server!');
        } finally {
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    return (
        <>
            <div className="flex justify-between items-end mb-10 border-b-0">
                <div className="max-w-2xl">
                    <h2 className="text-5xl font-bold tracking-tight text-on-background mb-4 uppercase">DANH MỤC SẢN PHẨM</h2>
                    <p className="text-on-surface-variant font-light text-lg">Quản lý các nhóm thời trang để cấu trúc cửa hàng của bạn.</p>
                </div>
                <button 
                    onClick={() => openModal('add')} 
                    className="px-10 py-4 bg-gradient-to-tr from-primary to-primary-container text-on-primary font-bold uppercase tracking-[0.15rem] text-[0.7rem] vibe-shadow hover:opacity-90 transition-all whitespace-nowrap"
                >
                    THÊM DANH MỤC MỚI
                </button>
            </div>

            {/* ========================================= */}
            {/* THANH CÔNG CỤ: TÌM KIẾM & BỘ LỌC          */}
            {/* ========================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-surface-container-lowest p-6 vibe-shadow items-end">
                {/* Ô Tìm kiếm */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-2 relative">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Tìm kiếm danh mục</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
                        <input 
                            type="text" 
                            placeholder="Nhập tên hoặc mã danh mục..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-b border-outline-variant/50 py-2 pl-8 focus:border-primary outline-none font-medium text-sm transition-colors"
                        />
                    </div>
                </div>

                {/* Bộ lọc Trạng thái sử dụng */}
                <div className="flex flex-col gap-2">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Lọc trạng thái</label>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none font-medium text-sm text-on-surface cursor-pointer"
                    >
                        <option value="all">Tất cả danh mục</option>
                        <option value="in_use">Đang chứa sản phẩm (Không thể xóa)</option>
                        <option value="empty">Danh mục rỗng (Có thể xóa)</option>
                    </select>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-surface-container-lowest vibe-shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low border-b-0">
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Mã Danh Mục</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Tên Danh Mục</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant text-center">Số Sản Phẩm</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-0">
                        {isLoading ? (
                            <tr><td colSpan="4" className="text-center py-10 text-outline">Đang tải...</td></tr>
                        ) : filteredCategories.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-10 text-outline">Không tìm thấy danh mục nào.</td></tr>
                        ) : currentCategories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-surface-container-low transition-all border-b border-outline-variant/10">
                                <td className="px-8 py-6 font-bold text-sm tracking-widest text-outline uppercase">{cat.id}</td>
                                <td className="px-8 py-6 font-bold text-base uppercase text-on-surface">{cat.name}</td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-4 py-1 text-xs font-bold rounded-full ${cat.product_count > 0 ? 'bg-surface-container-high text-on-surface' : 'bg-error/10 text-error'}`}>
                                        {cat.product_count}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => openModal('edit', cat)} className="p-2 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button onClick={() => setDeleteModal({ isOpen: true, id: cat.id })} className="p-2 hover:text-error transition-colors">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <footer className="mt-12 flex justify-between items-center py-10 border-t border-outline-variant/10">
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.2rem] text-outline">
                    Đang hiển thị {filteredCategories.length === 0 ? 0 : indexOfFirstCategory + 1}-{Math.min(indexOfLastCategory, filteredCategories.length)} của {filteredCategories.length} danh mục
                </span>
                
                {totalPages > 1 && (
                    <div className="flex items-center gap-12">
                        <button onClick={prevPage} disabled={currentPage === 1} className={`group flex items-center gap-3 text-[0.65rem] font-black uppercase tracking-[0.2rem] transition-all ${currentPage === 1 ? 'text-outline-variant/50 cursor-not-allowed' : 'text-outline hover:text-primary'}`}>
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Trước
                        </button>
                        <div className="flex items-center gap-6">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button key={number} onClick={() => paginate(number)} className={`text-sm font-bold transition-colors ${currentPage === number ? 'text-primary' : 'text-outline-variant hover:text-on-background'}`}>
                                    {number < 10 ? `0${number}` : number}
                                </button>
                            ))}
                        </div>
                        <button onClick={nextPage} disabled={currentPage === totalPages} className={`group flex items-center gap-3 text-[0.65rem] font-black uppercase tracking-[0.2rem] transition-all ${currentPage === totalPages ? 'text-outline-variant/50 cursor-not-allowed' : 'text-on-background hover:text-primary'}`}>
                            Sau <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                )}
            </footer>

            {/* Modal Thêm/Sửa */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/40 backdrop-blur-sm transition-all">
                    <form onSubmit={handleSave} className="bg-surface p-10 max-w-md w-full vibe-shadow flex flex-col gap-6 animate-fade-in-up">
                        <h3 className="text-xl font-black uppercase tracking-widest text-on-surface mb-2">
                            {modalConfig.mode === 'add' ? 'Thêm Danh Mục' : 'Cập Nhật Danh Mục'}
                        </h3>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Mã Danh Mục (Viết liền không dấu)</label>
                            <input 
                                required 
                                value={formData.ma_dm} 
                                onChange={(e) => setFormData({...formData, ma_dm: e.target.value.toUpperCase()})}
                                disabled={modalConfig.mode === 'edit'} 
                                placeholder="VD: DM_AOKHOAC" 
                                className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-bold text-sm disabled:text-outline-variant disabled:cursor-not-allowed uppercase" 
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Tên Danh Mục</label>
                            <input 
                                required 
                                value={formData.ten_dm} 
                                onChange={(e) => setFormData({...formData, ten_dm: e.target.value})}
                                placeholder="VD: Áo Khoác Mùa Đông" 
                                className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" 
                            />
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button type="button" onClick={() => setModalConfig({ isOpen: false, mode: 'add', data: null })} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors">Hủy</button>
                            <button type="submit" className="px-6 py-3 bg-primary text-on-primary text-[0.65rem] font-bold uppercase tracking-[0.2rem] hover:bg-primary/90 transition-colors vibe-shadow">Lưu lại</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Xóa */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/40 backdrop-blur-sm transition-all">
                    <div className="bg-surface p-8 max-w-sm w-full vibe-shadow flex flex-col gap-6 animate-fade-in-up">
                        <h3 className="text-lg font-black uppercase tracking-widest text-error mb-2">Cảnh báo</h3>
                        <p className="text-[0.8rem] font-medium text-on-surface-variant leading-relaxed">
                            Xóa danh mục <span className="font-bold text-on-surface">{deleteModal.id}</span>? Chỉ xóa được khi danh mục không còn sản phẩm nào.
                        </p>
                        <div className="flex justify-end gap-4 mt-2">
                            <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline hover:bg-surface-container-high transition-colors">Hủy</button>
                            <button onClick={executeDelete} className="px-6 py-3 bg-error text-on-error text-[0.65rem] font-bold uppercase tracking-[0.2rem] vibe-shadow">Xác nhận Xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}