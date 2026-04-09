import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Inventory() {
    const navigate = useNavigate();
    
    const [inventoryData, setInventoryData] = useState([]);
    const [stats, setStats] = useState({ total_items: 0, out_of_stock: 0, low_stock: 0, total_value: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Filters & Pagination
    const [filterTab, setFilterTab] = useState('all'); 
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // YÊU CẦU: Hiển thị 5 sản phẩm / trang
    const itemsPerPage = 5;

    // Modal Quick Update
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [variantStocks, setVariantStocks] = useState([]);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/admin/inventory');
            const data = await res.json();
            setInventoryData(data.items || []);
            setStats(data.stats || { total_items: 0, out_of_stock: 0, low_stock: 0, total_value: 0 });
        } catch (error) { toast.error('Lỗi kết nối máy chủ!'); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchInventory(); }, []);

    const categories = ['all', ...new Set(inventoryData.map(item => item.ten_dm))];

    const filteredItems = inventoryData.filter(item => {
        const matchTab = filterTab === 'all' || item.status === filterTab;
        const matchCat = categoryFilter === 'all' || item.ten_dm === categoryFilter;
        const matchSearch = item.ten_sp.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.ma_sp.toLowerCase().includes(searchTerm.toLowerCase());
        return matchTab && matchCat && matchSearch;
    });

    useEffect(() => { setCurrentPage(1); }, [filterTab, categoryFilter, searchTerm]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // ==========================================
    // TÍNH NĂNG XUẤT BÁO CÁO (EXPORT CSV)
    // ==========================================
    const handleExportReport = () => {
        if (filteredItems.length === 0) {
            toast.warning('Không có dữ liệu để xuất!');
            return;
        }

        // Khởi tạo nội dung file CSV (Thêm BOM \uFEFF để Excel đọc được Tiếng Việt)
        let csvContent = "\uFEFFMã SP,Tên Sản Phẩm,Danh Mục,Tổng Tồn Kho,Trạng Thái,Giá Trị Tồn Kho (VND)\n";

        filteredItems.forEach(item => {
            // Tính tổng giá trị của riêng sản phẩm này
            let totalItemValue = item.variants.reduce((sum, v) => sum + (v.so_luong_ton * v.gia_ban), 0);
            
            // Dịch trạng thái ra tiếng Việt
            let statusText = 'Còn hàng';
            if (item.status === 'out_of_stock') statusText = 'Hết hàng';
            if (item.status === 'low_stock') statusText = 'Sắp hết';

            // Xử lý chuỗi tên SP phòng trường hợp có dấu phẩy
            let safeName = `"${item.ten_sp.replace(/"/g, '""')}"`;

            csvContent += `${item.ma_sp},${safeName},${item.ten_dm},${item.total_stock},${statusText},${totalItemValue}\n`;
        });

        // Tạo file ảo và trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `VibeStudio_KhoHang_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Đã xuất Báo cáo Tồn kho thành công!');
    };

    // ==========================================
    // QUICK UPDATE LOGIC
    // ==========================================
    const openQuickUpdate = (product) => {
        setSelectedProduct(product);
        setVariantStocks(product.variants.map(v => ({ ma_bien_the: v.ma_bien_the, kich_thuoc: v.kich_thuoc, mau_sac: v.mau_sac, so_luong_ton: v.so_luong_ton })));
        setIsUpdateModalOpen(true);
    };

    const handleStockChange = (index, value) => {
        const newStocks = [...variantStocks];
        newStocks[index].so_luong_ton = parseInt(value) || 0;
        setVariantStocks(newStocks);
    };

    const saveStockUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/admin/inventory/${selectedProduct.ma_sp}/stock`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ variants: variantStocks })
            });
            if (res.ok) {
                toast.success('Cập nhật kho hàng thành công!');
                setIsUpdateModalOpen(false);
                fetchInventory(); 
            }
        } catch (error) { toast.error('Lỗi hệ thống!'); }
    };

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    return (
        <div className="p-8 space-y-8 flex-1 max-w-7xl mx-auto w-full">
            {/* Header & Khung Thao Tác (Đã gắn tính năng) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tighter text-on-background">INVENTORY CONTROL</h2>
                    <p className="text-on-surface-variant font-medium uppercase tracking-[0.2em] text-xs">Quản lý kho hàng curator</p>
                </div>
                <div className="flex gap-4">
                    {/* NÚT NHẬP KHO MỚI: Chuyển hướng sang trang Tạo SP */}
                    <button 
                        onClick={() => navigate('/admin/products/create')}
                        className="px-6 py-3 bg-primary text-white text-xs font-bold uppercase tracking-[0.15rem] flex items-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all vibe-shadow"
                    >
                        <span className="material-symbols-outlined text-sm">add_box</span> Nhập kho mới
                    </button>
                    {/* NÚT XUẤT BÁO CÁO: Tải file Excel/CSV */}
                    <button 
                        onClick={handleExportReport}
                        className="px-6 py-3 bg-surface-container-low text-on-background text-xs font-bold uppercase tracking-[0.15rem] flex items-center gap-2 hover:bg-surface-container-high transition-all vibe-shadow border border-outline-variant/20"
                    >
                        <span className="material-symbols-outlined text-sm">download</span> Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Bento Grid Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface-container-low p-6 flex flex-col justify-between vibe-shadow">
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Tổng Sản Phẩm</span>
                    <div className="mt-4 flex items-baseline gap-2"><span className="text-3xl font-black tracking-tighter">{stats.total_items}</span></div>
                </div>
                <div className="bg-surface-container-low p-6 flex flex-col justify-between border-l-4 border-error vibe-shadow">
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-error">Đã hết hàng</span>
                    <div className="mt-4 flex items-baseline gap-2"><span className="text-3xl font-black tracking-tighter text-error">{stats.out_of_stock}</span><span className="material-symbols-outlined text-error text-xl">warning</span></div>
                </div>
                <div className="bg-surface-container-low p-6 flex flex-col justify-between border-l-4 border-primary vibe-shadow">
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Sắp hết hàng</span>
                    <div className="mt-4 flex items-baseline gap-2"><span className="text-3xl font-black tracking-tighter text-primary">{stats.low_stock}</span></div>
                </div>
                <div className="bg-surface-container-low p-6 flex flex-col justify-between vibe-shadow">
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Giá trị kho</span>
                    <div className="mt-4 flex items-baseline gap-2"><span className="text-xl font-black tracking-tighter text-primary">{formatCurrency(stats.total_value)}</span></div>
                </div>
            </div>

            {/* Inventory Management Table */}
            <div className="bg-surface-container-lowest vibe-shadow">
                {/* Filters */}
                <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/10">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setFilterTab('all')} className={`px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.1rem] transition-colors ${filterTab === 'all' ? 'bg-inverse-surface text-inverse-on-surface' : 'bg-secondary-container text-on-secondary-container hover:bg-inverse-surface hover:text-inverse-on-surface'}`}>Tất cả</button>
                        <button onClick={() => setFilterTab('low_stock')} className={`px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.1rem] transition-colors ${filterTab === 'low_stock' ? 'bg-inverse-surface text-inverse-on-surface' : 'bg-secondary-container text-on-secondary-container hover:bg-inverse-surface hover:text-inverse-on-surface'}`}>Sắp hết hàng</button>
                        <button onClick={() => setFilterTab('out_of_stock')} className={`px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.1rem] transition-colors ${filterTab === 'out_of_stock' ? 'bg-inverse-surface text-inverse-on-surface' : 'bg-secondary-container text-on-secondary-container hover:bg-inverse-surface hover:text-inverse-on-surface'}`}>Đã hết hàng</button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-sm text-outline-variant">search</span>
                            <input type="text" placeholder="Tìm tên hoặc SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 py-1.5 border-b border-outline-variant/30 bg-transparent text-xs font-medium focus:outline-none focus:border-primary" />
                        </div>
                        <div className="flex items-center border-b border-outline-variant/30 py-1 px-2">
                            <span className="material-symbols-outlined text-sm text-on-surface-variant">filter_list</span>
                            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-transparent border-0 focus:ring-0 text-[0.7rem] font-bold uppercase tracking-wider text-on-surface-variant cursor-pointer outline-none">
                                {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'Danh mục: Tất cả' : c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low">
                                <th className="px-6 py-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Sản phẩm</th>
                                <th className="px-6 py-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">SKU</th>
                                <th className="px-6 py-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Phân loại (Size/Color)</th>
                                <th className="px-6 py-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Tổng Số lượng</th>
                                <th className="px-6 py-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Trạng thái</th>
                                <th className="px-6 py-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-10 font-bold text-outline">Đang tải dữ liệu kho...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-10 font-bold text-outline">Không tìm thấy sản phẩm nào.</td></tr>
                            ) : currentItems.map(item => (
                                <tr key={item.ma_sp} className="hover:bg-surface-container-low transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-16 bg-surface-container-high overflow-hidden flex-shrink-0">
                                                {item.hinh_anh ? <img src={`http://127.0.0.1:8000/storage/${item.hinh_anh}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="sp" /> : <div className="w-full h-full bg-outline-variant/20"></div>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black tracking-tight uppercase line-clamp-1" title={item.ten_sp}>{item.ten_sp}</p>
                                                <p className="text-[0.6rem] text-on-surface-variant font-medium tracking-[0.1em]">{item.ten_dm}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-[0.7rem] font-mono text-on-surface-variant">{item.ma_sp}</td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {item.variants.map(v => (
                                                <span key={v.ma_bien_the} className={`px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-tighter ${v.so_luong_ton === 0 ? 'bg-error/10 text-error' : 'bg-surface-container'}`}>
                                                    {v.kich_thuoc}/{v.mau_sac} ({v.so_luong_ton})
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${item.status === 'out_of_stock' || item.status === 'low_stock' ? 'text-error' : 'text-on-background'}`}>{item.total_stock}</span>
                                            <span className="text-[0.6rem] font-medium text-on-surface-variant">units</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        {item.status === 'out_of_stock' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-on-background text-surface text-[0.6rem] font-bold uppercase tracking-wider"><span className="material-symbols-outlined text-xs">block</span> Đã hết hàng</span>}
                                        {item.status === 'low_stock' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-error-container text-on-error-container text-[0.6rem] font-bold uppercase tracking-wider"><span className="material-symbols-outlined text-xs">priority_high</span> Sắp hết hàng</span>}
                                        {item.status === 'in_stock' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container text-on-secondary-container text-[0.6rem] font-bold uppercase tracking-wider"><span className="material-symbols-outlined text-xs">check_circle</span> Còn hàng</span>}
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <button onClick={() => openQuickUpdate(item)} className={`px-3 py-1.5 transition-all text-[0.6rem] font-bold uppercase tracking-wider active:scale-[0.98] ${item.status === 'out_of_stock' ? 'bg-primary text-white' : 'bg-transparent border border-outline-variant/20 hover:border-primary hover:text-primary'}`}>
                                            {item.status === 'out_of_stock' ? 'Restock' : 'Quick Update'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredItems.length > 0 && (
                    <div className="p-6 flex items-center justify-between border-t border-outline-variant/10">
                        <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Hiển thị {currentItems.length} trên {filteredItems.length} sản phẩm</span>
                        <div className="flex gap-2 items-center">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 hover:bg-surface-container transition-all disabled:opacity-30">
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center border transition-all text-[0.65rem] font-bold ${currentPage === i + 1 ? 'bg-inverse-surface text-inverse-on-surface border-transparent' : 'border-outline-variant/30 hover:bg-surface-container'}`}>
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 hover:bg-surface-container transition-all disabled:opacity-30">
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Asymmetric Editorial Inventory Insight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 relative h-[300px] bg-[#1A1C1C] overflow-hidden group vibe-shadow">
                    <img className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000" src="/images.jpg" alt="warehouse"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C1C] to-transparent"></div>
                    <div className="absolute bottom-8 left-8 space-y-2">
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Warehouse <br/>Optimization</h3>
                        <p className="text-white/60 text-xs font-medium uppercase tracking-[0.2em]">Efficiency through architectural curation</p>
                    </div>
                </div>
                <div className="bg-primary p-8 flex flex-col justify-center gap-6 vibe-shadow">
                    <div className="space-y-1">
                        <span className="material-symbols-outlined text-white text-3xl">bolt</span>
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter">Fastest Movers</h4>
                        <p className="text-white/70 text-[0.65rem] font-medium uppercase tracking-[0.15em]">Top selling categories</p>
                    </div>
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center border-b border-white/20 pb-2">
                            <span className="text-white text-[0.7rem] font-bold uppercase">Áo Thun (T-Shirts)</span>
                            <span className="text-white/90 text-[0.7rem] font-bold">HOT</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-white/20 pb-2">
                            <span className="text-white text-[0.7rem] font-bold uppercase">Quần Urban (Bottoms)</span>
                            <span className="text-white/90 text-[0.7rem] font-bold">Trending</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* MODAL QUICK UPDATE STOCK */}
            {isUpdateModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/60 backdrop-blur-sm p-4">
                    <div className="bg-surface p-8 max-w-lg w-full vibe-shadow flex flex-col animate-fade-in-up border-t-4 border-primary">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-widest text-on-surface">Cập Nhật Kho</h3>
                                <p className="text-xs font-bold text-outline uppercase tracking-widest mt-1">{selectedProduct.ten_sp}</p>
                            </div>
                            <button onClick={() => setIsUpdateModalOpen(false)} className="material-symbols-outlined hover:text-error transition-colors">close</button>
                        </div>
                        
                        <form onSubmit={saveStockUpdate} className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {variantStocks.map((variant, index) => (
                                <div key={variant.ma_bien_the} className="flex justify-between items-center p-4 bg-surface-container-low border-l-4 border-primary">
                                    <div>
                                        <p className="font-bold text-sm uppercase">{variant.kich_thuoc} / {variant.mau_sac}</p>
                                        <p className="text-[0.65rem] text-outline-variant font-mono mt-1">{variant.ma_bien_the}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-outline">Tồn kho:</span>
                                        <input 
                                            type="number" min="0" 
                                            value={variant.so_luong_ton} 
                                            onChange={(e) => handleStockChange(index, e.target.value)}
                                            className="w-20 bg-surface border border-outline-variant/30 py-1 px-2 focus:border-primary outline-none font-bold text-center text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                            
                            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-outline-variant/20">
                                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline hover:bg-surface-container-high transition-colors">Hủy</button>
                                <button type="submit" className="px-6 py-3 bg-primary text-on-primary text-[0.65rem] font-bold uppercase tracking-[0.2rem] hover:bg-primary/90 transition-colors vibe-shadow">Lưu Kho</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}