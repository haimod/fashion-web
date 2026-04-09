import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export default function Collections() {
    const [collections, setCollections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); 
    const [searchTerm, setSearchTerm] = useState('');

    // State cho Modal Form (Tạo mới / Sửa)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' hoặc 'edit'
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ ten_bst: '', mo_ta: '', thoi_gian_bd: '', thoi_gian_kt: '', trang_thai: '1' });
    const [imageFile, setImageFile] = useState(null);
    const [currentImagePreview, setCurrentImagePreview] = useState(null); // Để hiển thị ảnh cũ khi edit
    const fileInputRef = useRef(null);

    // State cho Phân trang (Pagination)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; // Số lượng hiển thị trên 1 trang

    // State cho Modal Quản lý SP trong BST
    const [selectedBST, setSelectedBST] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [bstItems, setBstItems] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [productSearchTerm, setProductSearchTerm] = useState('');

    // State Confirm Modal (Xóa)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, message: '' });

    const openConfirmModal = (actionFunc, message) => setConfirmModal({ isOpen: true, action: actionFunc, message });
    const executeConfirm = () => { if(confirmModal.action) confirmModal.action(); setConfirmModal({ isOpen: false, action: null, message: '' }); };

    const fetchCollections = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/admin/collections');
            setCollections(await res.json() || []);
        } catch (error) { toast.error('Lỗi tải dữ liệu!'); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchCollections(); }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    };

    // =======================================
    // LOGIC THÊM & SỬA BỘ SƯU TẬP
    // =======================================
    const openAddModal = () => {
        setModalMode('add');
        setEditingId(null);
        setFormData({ ten_bst: '', mo_ta: '', thoi_gian_bd: '', thoi_gian_kt: '', trang_thai: '1' });
        setImageFile(null);
        setCurrentImagePreview(null);
        setIsModalOpen(true);
    };

    const openEditModal = (col) => {
        setModalMode('edit');
        setEditingId(col.ma_bst);
        setFormData({ 
            ten_bst: col.ten_bst, 
            mo_ta: col.mo_ta || '', 
            thoi_gian_bd: col.thoi_gian_bd ? col.thoi_gian_bd.slice(0, 16) : '', 
            thoi_gian_kt: col.thoi_gian_kt ? col.thoi_gian_kt.slice(0, 16) : '', 
            trang_thai: col.trang_thai.toString() 
        });
        setImageFile(null);
        setCurrentImagePreview(col.hinh_anh ? `http://127.0.0.1:8000/storage/${col.hinh_anh}` : null);
        setIsModalOpen(true);
    };

    const handleSaveCollection = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('ten_bst', formData.ten_bst);
        data.append('mo_ta', formData.mo_ta);
        data.append('thoi_gian_bd', formData.thoi_gian_bd);
        data.append('thoi_gian_kt', formData.thoi_gian_kt);
        data.append('trang_thai', formData.trang_thai);
        if (imageFile) data.append('hinh_anh', imageFile);

        const url = modalMode === 'add' ? 'http://127.0.0.1:8000/api/admin/collections' : `http://127.0.0.1:8000/api/admin/collections/${editingId}`;

        try {
            // Dùng POST cho cả Thêm và Sửa vì có FormData (File Upload)
            const res = await fetch(url, { method: 'POST', body: data });
            if (res.ok) {
                toast.success(modalMode === 'add' ? 'Tạo Bộ sưu tập thành công!' : 'Cập nhật thành công!');
                setIsModalOpen(false);
                fetchCollections();
            } else toast.error('Vui lòng kiểm tra lại thông tin!');
        } catch (error) { toast.error('Lỗi máy chủ!'); }
    };

    const handleDeleteCollection = (id) => {
        openConfirmModal(async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/admin/collections/${id}`, { method: 'DELETE' });
                if(res.ok) { toast.success('Đã xóa Bộ sưu tập!'); fetchCollections(); }
            } catch (error) { toast.error('Lỗi hệ thống!'); }
        }, 'Cảnh báo: Xóa bộ sưu tập này sẽ gỡ toàn bộ liên kết sản phẩm bên trong nó. Bạn có chắc chắn?');
    };

    // =======================================
    // LOGIC QUẢN LÝ SẢN PHẨM TRONG BST
    // =======================================
    const openManageProducts = async (bst) => {
        setSelectedBST(bst);
        setProductSearchTerm('');
        try {
            const [itemsRes, availableRes] = await Promise.all([
                fetch(`http://127.0.0.1:8000/api/admin/collections/${bst.ma_bst}/items`),
                fetch(`http://127.0.0.1:8000/api/admin/collections/${bst.ma_bst}/available`)
            ]);
            setBstItems(await itemsRes.json());
            setAvailableProducts(await availableRes.json());
            setIsProductModalOpen(true);
        } catch (error) { toast.error('Lỗi tải danh sách sản phẩm!'); }
    };

    const handleAddProductToBST = async (sp) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/admin/collections/${selectedBST.ma_bst}/items`, { 
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ma_sp: sp.ma_sp }) 
            });
            if(res.ok) {
                setAvailableProducts(prev => prev.filter(p => p.ma_sp !== sp.ma_sp));
                setBstItems(prev => [...prev, sp]);
                fetchCollections(); 
            }
        } catch (error) { toast.error('Lỗi thêm sản phẩm!'); }
    };

    const handleRemoveProductFromBST = async (ma_sp) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/admin/collections/${selectedBST.ma_bst}/items/${ma_sp}`, { method: 'DELETE' });
            if(res.ok) {
                const removedItem = bstItems.find(p => p.ma_sp === ma_sp);
                setBstItems(prev => prev.filter(p => p.ma_sp !== ma_sp));
                setAvailableProducts(prev => [removedItem, ...prev]);
                fetchCollections(); 
            }
        } catch (error) { toast.error('Lỗi gỡ sản phẩm!'); }
    };

    // =======================================
    // XỬ LÝ TÌM KIẾM, LỌC & PHÂN TRANG
    // =======================================
    // 1. Lọc trước
    const filteredCollections = collections.filter(col => {
        const matchSearch = col.ten_bst.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || 
                            (filterStatus === 'active' && col.trang_thai === 1) || 
                            (filterStatus === 'draft' && col.trang_thai === 0);
        return matchSearch && matchStatus;
    });

    // Khi thay đổi Search/Lọc, reset về trang 1
    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

    // 2. Tính toán phân trang
    const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCollections = filteredCollections.slice(indexOfFirstItem, indexOfLastItem);

    const filteredAvailableProducts = availableProducts.filter(p => p.ten_sp.toLowerCase().includes(productSearchTerm.toLowerCase()));

    return (
        <div className="p-12 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div>
                    <h2 className="text-5xl font-extrabold tracking-tighter text-[#1A1C1C] mb-4">QUẢN LÝ BỘ SƯU TẬP</h2>
                    <p className="font-['Be_Vietnam_Pro'] uppercase text-[0.75rem] tracking-[0.15rem] text-[#5F5E5E]">Điều hành phong cách nghệ thuật của Vibe Studio</p>
                </div>
                <button onClick={openAddModal} className="px-10 py-5 bg-primary text-on-primary font-bold uppercase text-[0.75rem] tracking-[0.2rem] transition-all active:scale-95 hover:bg-[#5b3a13] shadow-lg shadow-[#7C572D]/10">
                    THÊM BỘ SƯU TẬP MỚI
                </button>
            </section>

            {/* Filters Bar */}
            <section className="mb-12 flex flex-wrap items-center justify-between gap-6 border-b border-outline-variant/20 pb-8">
                <div className="flex gap-4">
                    <button onClick={() => setFilterStatus('all')} className={`${filterStatus === 'all' ? 'bg-on-background text-background' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'} px-6 py-2 text-[0.7rem] uppercase tracking-widest font-bold transition-colors`}>Tất cả</button>
                    <button onClick={() => setFilterStatus('active')} className={`${filterStatus === 'active' ? 'bg-on-background text-background' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'} px-6 py-2 text-[0.7rem] uppercase tracking-widest font-bold transition-colors`}>Đang hiển thị</button>
                    <button onClick={() => setFilterStatus('draft')} className={`${filterStatus === 'draft' ? 'bg-on-background text-background' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'} px-6 py-2 text-[0.7rem] uppercase tracking-widest font-bold transition-colors`}>Bản nháp</button>
                </div>
                <div className="flex items-center border-b border-on-background w-full md:w-64">
                    <span className="material-symbols-outlined text-[20px] pb-2">search</span>
                    <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border-none bg-transparent focus:ring-0 w-full text-[0.85rem] pb-2 px-3 outline-none" placeholder="Tên bộ sưu tập..." type="text"/>
                </div>
            </section>

            {/* Collections Gallery Table */}
            <div className="space-y-1 min-h-[400px]">
                <div className="grid grid-cols-12 px-6 py-4 bg-surface-container-low text-[#5F5E5E] font-['Be_Vietnam_Pro'] uppercase text-[0.65rem] tracking-[0.15rem] font-bold">
                    <div className="col-span-3">Hình ảnh (Ngang)</div>
                    <div className="col-span-3 pl-4">Thông tin bộ sưu tập</div>
                    <div className="col-span-2 text-center">Sản phẩm</div>
                    <div className="col-span-2 text-center">Ngày tạo</div>
                    <div className="col-span-2 text-right">Trạng thái / Thao tác</div>
                </div>

                {isLoading ? <div className="text-center py-10 font-bold text-outline">Đang tải...</div> : 
                 currentCollections.length === 0 ? <div className="text-center py-10 text-outline">Không có bộ sưu tập nào.</div> :
                 currentCollections.map((col) => (
                    <div key={col.ma_bst} className="grid grid-cols-12 px-6 py-8 items-center bg-surface-container-lowest hover:bg-surface-container-low transition-colors group">
                        <div className="col-span-3 cursor-pointer" onClick={() => openManageProducts(col)}>
                            {/* TÍNH NĂNG MỚI: Đã đổi sang tỷ lệ ngang (aspect-video) */}
                            <div className="aspect-video overflow-hidden bg-surface-container-high relative">
                                {col.hinh_anh ? (
                                    <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={`http://127.0.0.1:8000/storage/${col.hinh_anh}`} alt="bst" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-outline text-xs font-bold">CHƯA CÓ ẢNH</div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-3xl">view_cozy</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-3 pl-8">
                            <h3 className="text-xl font-bold tracking-tight text-on-surface mb-2 leading-snug">{col.ten_bst}</h3>
                            <p className="text-on-surface-variant text-[0.75rem] max-w-xs leading-relaxed opacity-70 line-clamp-2">{col.mo_ta}</p>
                        </div>
                        <div className="col-span-2 text-center">
                            <button onClick={() => openManageProducts(col)} className="font-['Be_Vietnam_Pro'] uppercase text-[0.85rem] tracking-widest font-bold text-primary hover:underline">
                                {col.so_luong_sp || 0} MẪU
                            </button>
                        </div>
                        <div className="col-span-2 text-center">
                            <span className="text-on-surface-variant text-[0.8rem]">{formatDate(col.thoi_gian_bd)}</span>
                        </div>
                        <div className="col-span-2 text-right space-y-4">
                            <div>
                                {col.trang_thai === 1 ? (
                                    <span className="bg-primary/10 text-primary px-3 py-1 text-[0.6rem] uppercase font-bold tracking-widest">Đang hiển thị</span>
                                ) : (
                                    <span className="bg-secondary-container text-secondary px-3 py-1 text-[0.6rem] uppercase font-bold tracking-widest">Bản nháp</span>
                                )}
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button onClick={() => openEditModal(col)} className="text-on-surface hover:text-primary transition-colors" title="Sửa"><span className="material-symbols-outlined">edit</span></button>
                                <button onClick={() => handleDeleteCollection(col.ma_bst)} className="text-on-surface hover:text-error transition-colors" title="Xóa"><span className="material-symbols-outlined">delete</span></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TÍNH NĂNG MỚI: THANH PHÂN TRANG (PAGINATION) */}
            {filteredCollections.length > 0 && (
                <div className="mt-12 flex justify-between items-center border-t border-outline-variant/20 pt-8">
                    <span className="font-['Be_Vietnam_Pro'] uppercase text-[0.7rem] tracking-[0.2rem] text-on-surface-variant">
                        HIỂN THỊ {currentCollections.length} TRÊN {filteredCollections.length} BỘ SƯU TẬP
                    </span>
                    <div className="flex space-x-8 items-center">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="font-bold uppercase text-[0.7rem] tracking-[0.2rem] disabled:opacity-30 disabled:cursor-not-allowed hover:text-primary transition-colors"
                        >
                            Trước
                        </button>
                        <div className="flex space-x-4">
                            {[...Array(totalPages)].map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 flex items-center justify-center font-bold text-[0.7rem] transition-colors ${currentPage === i + 1 ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                                >
                                    {(i + 1).toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="font-bold uppercase text-[0.7rem] tracking-[0.2rem] disabled:opacity-30 disabled:cursor-not-allowed hover:text-primary transition-colors"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL TẠO MỚI / SỬA */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/40 backdrop-blur-sm p-4">
                    <form onSubmit={handleSaveCollection} className="bg-surface p-10 max-w-2xl w-full vibe-shadow flex flex-col gap-6 animate-fade-in-up">
                        <h3 className="text-xl font-black uppercase tracking-widest text-on-surface border-b border-outline-variant/20 pb-4">
                            {modalMode === 'add' ? 'Thêm Bộ Sưu Tập Mới' : 'Cập Nhật Bộ Sưu Tập'}
                        </h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Tên Bộ sưu tập</label>
                                    <input required value={formData.ten_bst} onChange={e => setFormData({...formData, ten_bst: e.target.value})} className="w-full bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none font-bold" />
                                </div>
                                <div>
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Mô tả câu chuyện</label>
                                    <textarea value={formData.mo_ta} onChange={e => setFormData({...formData, mo_ta: e.target.value})} className="w-full bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none text-sm" rows="3"></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Bắt đầu</label>
                                        <input required type="datetime-local" value={formData.thoi_gian_bd} onChange={e => setFormData({...formData, thoi_gian_bd: e.target.value})} className="w-full bg-transparent border-b border-outline-variant/50 py-2 outline-none text-xs font-bold" />
                                    </div>
                                    <div>
                                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Kết thúc</label>
                                        <input required type="datetime-local" value={formData.thoi_gian_kt} onChange={e => setFormData({...formData, thoi_gian_kt: e.target.value})} className="w-full bg-transparent border-b border-outline-variant/50 py-2 outline-none text-xs font-bold" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Trạng thái</label>
                                    <select value={formData.trang_thai} onChange={e => setFormData({...formData, trang_thai: e.target.value})} className="w-full bg-transparent border-b border-outline-variant/50 py-2 outline-none font-bold text-sm">
                                        <option value="1">Đang hiển thị (Public)</option><option value="0">Bản nháp (Draft)</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Upload Banner (Đã chỉnh lại text tỷ lệ) */}
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/50 p-4 bg-surface-container-lowest relative cursor-pointer group aspect-video" onClick={() => fileInputRef.current.click()}>
                                {imageFile ? (
                                    <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-full h-full object-cover absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : currentImagePreview ? (
                                    <img src={currentImagePreview} alt="preview" className="w-full h-full object-cover absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">image</span>
                                        <p className="text-[0.7rem] font-bold uppercase tracking-widest text-outline">Tải Banner Lên</p>
                                        <p className="text-xs text-outline-variant mt-1">Khuyên dùng tỷ lệ ngang (16:9)</p>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} onChange={e => setImageFile(e.target.files[0])} accept="image/*" className="hidden" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline hover:bg-surface-container-high transition-colors">Hủy</button>
                            <button type="submit" className="px-6 py-3 bg-primary text-on-primary text-[0.65rem] font-bold uppercase tracking-[0.2rem] hover:bg-primary/90 transition-colors vibe-shadow">Lưu Thiết Lập</button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL QUẢN LÝ SẢN PHẨM TRONG BST */}
            {isProductModalOpen && selectedBST && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/60 backdrop-blur-sm p-4">
                    <div className="bg-surface w-full max-w-5xl h-[85vh] flex flex-col vibe-shadow animate-fade-in-up">
                        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-widest text-on-surface">{selectedBST.ten_bst}</h3>
                                <p className="text-xs font-bold text-outline uppercase tracking-widest mt-1">Điều phối sản phẩm hiển thị</p>
                            </div>
                            <button onClick={() => setIsProductModalOpen(false)} className="material-symbols-outlined hover:text-error transition-colors text-3xl">close</button>
                        </div>
                        
                        <div className="flex flex-1 overflow-hidden">
                            {/* Cột trái: DS Sản phẩm có thể thêm */}
                            <div className="w-1/2 border-r border-outline-variant/20 flex flex-col bg-surface-container-lowest">
                                <div className="p-4 border-b border-outline-variant/20 relative">
                                    <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-outline-variant text-sm">search</span>
                                    <input type="text" placeholder="Tìm sản phẩm để thêm..." value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} className="w-full bg-surface border-none py-2 pl-10 pr-4 outline-none focus:ring-1 focus:ring-primary text-sm font-medium"/>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {filteredAvailableProducts.length === 0 ? <p className="text-center text-sm text-outline mt-10">Không còn sản phẩm nào phù hợp.</p> : filteredAvailableProducts.map(sp => (
                                        <div key={sp.ma_sp} className="flex items-center gap-4 p-3 border border-outline-variant/20 hover:border-primary/50 transition-colors">
                                            <div className="w-12 h-16 bg-surface-container-high flex-shrink-0">
                                                {sp.hinh_anh && <img src={`http://127.0.0.1:8000/storage/${sp.hinh_anh}`} alt="sp" className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm uppercase leading-tight line-clamp-2">{sp.ten_sp}</p>
                                                <p className="text-xs text-outline">{sp.ma_sp}</p>
                                            </div>
                                            <button onClick={() => handleAddProductToBST(sp)} className="material-symbols-outlined text-primary hover:bg-primary/10 p-2 rounded-full transition-colors" title="Thêm vào BST">add_circle</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cột phải: DS SP Đã nằm trong BST */}
                            <div className="w-1/2 flex flex-col">
                                <div className="p-4 border-b border-outline-variant/20 bg-surface">
                                    <p className="font-bold uppercase text-[0.7rem] tracking-widest text-primary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">collections_bookmark</span> Đã thêm ({bstItems.length})
                                    </p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-surface">
                                    {bstItems.length === 0 ? <p className="text-center text-sm text-outline mt-10">Kéo sản phẩm từ bên trái vào đây.</p> : bstItems.map(sp => (
                                        <div key={sp.ma_sp} className="flex items-center gap-4 p-3 bg-surface-container-low border-l-4 border-primary vibe-shadow">
                                            <div className="w-12 h-16 bg-surface-container-high flex-shrink-0">
                                                {sp.hinh_anh && <img src={`http://127.0.0.1:8000/storage/${sp.hinh_anh}`} alt="sp" className="w-full h-full object-cover grayscale" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm uppercase leading-tight line-clamp-2">{sp.ten_sp}</p>
                                                <p className="text-xs text-outline">{sp.ma_sp}</p>
                                            </div>
                                            <button onClick={() => handleRemoveProductFromBST(sp.ma_sp)} className="material-symbols-outlined text-error hover:bg-error/10 p-2 rounded-full transition-colors" title="Xóa khỏi BST">remove_circle</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM MODAL (XÓA) */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1A1C1C]/60 backdrop-blur-sm p-4">
                    <div className="bg-surface p-8 max-w-sm w-full vibe-shadow flex flex-col gap-6 border-t-4 border-error animate-fade-in-up">
                        <h3 className="text-lg font-black uppercase tracking-widest text-error mb-2">Cảnh báo</h3>
                        <p className="text-[0.8rem] font-medium text-on-surface-variant leading-relaxed">{confirmModal.message}</p>
                        <div className="flex justify-end gap-4 mt-2">
                            <button onClick={() => setConfirmModal({ isOpen: false, action: null, message: '' })} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline hover:bg-surface-container-high transition-colors">Hủy</button>
                            <button onClick={executeConfirm} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] bg-error text-on-error hover:bg-error/90 transition-colors">Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}