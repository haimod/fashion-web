import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- STATE CHO TÌM KIẾM & BỘ LỌC ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stockFilter, setStockFilter] = useState(''); 
    const [priceSort, setPriceSort] = useState('default'); 

    // --- STATE PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5;

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/products');
            const data = await response.json();
            setProducts(data || []);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu sản phẩm!');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const uniqueCategories = [...new Set(products.map(item => item.category))];

    // Reset về trang 1 mỗi khi gõ tìm kiếm hoặc đổi bất kỳ bộ lọc nào
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, stockFilter, priceSort]);

    // ==========================================
    // LOGIC LỌC (FILTER) & SẮP XẾP (SORT)
    // ==========================================
    // 1. Lọc dữ liệu trước
    const filteredProducts = products.filter(product => {
        const matchSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.id?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchCategory = selectedCategory === '' || product.category === selectedCategory;
        
        let matchStock = true;
        const totalStock = Number(product.stock) || 0; // Đảm bảo ép kiểu số
        if (stockFilter === 'in_stock') matchStock = totalStock > 0;
        if (stockFilter === 'out_of_stock') matchStock = totalStock <= 0;
        
        return matchSearch && matchCategory && matchStock;
    });

    // 2. Sắp xếp giá trên danh sách đã lọc
    const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;
        if (priceSort === 'price_asc') return priceA - priceB; // Giá thấp đến cao
        if (priceSort === 'price_desc') return priceB - priceA; // Giá cao xuống thấp
        return 0; // default
    });

    // ==========================================
    // LOGIC PHÂN TRANG
    // ==========================================
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedAndFilteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(sortedAndFilteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const prevPage = () => setCurrentPage(prev => prev > 1 ? prev - 1 : 1);
    const nextPage = () => setCurrentPage(prev => prev < totalPages ? prev + 1 : totalPages);

    const executeDelete = async () => {
        const id = deleteModal.productId;
        setDeleteModal({ isOpen: false, productId: null }); 

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success('Đã xóa sản phẩm khỏi kho!');
                setProducts(products.filter(p => p.id !== id));
            } else {
                toast.error('Không thể xóa! Có thể SP đang nằm trong đơn hàng/BST.');
            }
        } catch (error) {
            toast.error('Lỗi kết nối server!');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b-0">
                <div className="max-w-2xl">
                    <h2 className="text-5xl font-black tracking-tight text-on-background mb-4 uppercase">QUẢN LÝ SẢN PHẨM</h2>
                    <p className="text-on-surface-variant font-medium text-sm tracking-[0.1rem] uppercase">Phân loại, chỉnh sửa và quản lý danh mục thời trang Urban Curator.</p>
                </div>
                <Link to="/admin/products/create" className="px-10 py-5 bg-primary text-on-primary font-bold uppercase tracking-[0.15rem] text-[0.7rem] vibe-shadow hover:bg-primary/90 transition-all inline-flex items-center gap-2 whitespace-nowrap active:scale-95">
                    <span className="material-symbols-outlined text-lg">add_circle</span> THÊM SẢN PHẨM MỚI
                </Link>
            </div>

            {/* ========================================= */}
            {/* THANH CÔNG CỤ: TÌM KIẾM & BỘ LỌC ĐA NĂNG  */}
            {/* ========================================= */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-surface-container-lowest p-6 vibe-shadow items-end">
                {/* Ô Tìm kiếm */}
                <div className="flex flex-col gap-2 relative">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Tìm kiếm sản phẩm</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline-variant text-sm">search</span>
                        <input 
                            type="text" 
                            placeholder="Tên, mã SKU..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-b border-outline-variant/50 py-2 pl-8 focus:border-primary outline-none font-bold text-sm transition-colors"
                        />
                    </div>
                </div>

                {/* Bộ lọc Danh mục */}
                <div className="flex flex-col gap-2">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Danh mục</label>
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none font-bold text-sm text-on-surface cursor-pointer"
                    >
                        <option value="">Tất cả danh mục</option>
                        {uniqueCategories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Bộ lọc Trạng thái Kho */}
                <div className="flex flex-col gap-2">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Tồn kho</label>
                    <select 
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="w-full bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none font-bold text-sm text-on-surface cursor-pointer"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="in_stock">Còn hàng (SL &gt; 0)</option>
                        <option value="out_of_stock">Hết hàng (SL = 0)</option>
                    </select>
                </div>

                {/* Sắp xếp theo Giá */}
                <div className="flex flex-col gap-2">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Sắp xếp giá</label>
                    <select 
                        value={priceSort}
                        onChange={(e) => setPriceSort(e.target.value)}
                        className="w-full bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none font-bold text-sm text-on-surface cursor-pointer"
                    >
                        <option value="default">Mới nhất (Mặc định)</option>
                        <option value="price_asc">Giá: Thấp đến Cao</option>
                        <option value="price_desc">Giá: Cao xuống Thấp</option>
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-surface-container-lowest vibe-shadow overflow-hidden min-h-[400px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low border-b-0">
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant w-24">Hình ảnh</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Tên Sản phẩm / SKU</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Danh mục</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Giá bán (Từ)</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant text-center">Tổng Tồn Kho</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-0">
                        {isLoading ? (
                            <tr><td colSpan="6" className="text-center py-10 font-bold text-outline">Đang tải dữ liệu sản phẩm...</td></tr>
                        ) : sortedAndFilteredProducts.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-10 font-bold text-outline">Không tìm thấy sản phẩm nào phù hợp.</td></tr>
                        ) : (
                            currentProducts.map((product) => {
                                const totalStock = Number(product.stock) || 0;
                                const minPrice = Number(product.price) || 0;
                                
                                return (
                                    <tr key={product.id} className="hover:bg-surface-container-low transition-all border-b border-outline-variant/10 group">
                                        <td className="px-8 py-6">
                                            <div className="w-16 h-20 bg-surface-container-high overflow-hidden">
                                                <img 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                                    src={product.image ? `http://127.0.0.1:8000/storage/${product.image}` : "/images.jpg"} 
                                                />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold tracking-tight text-on-surface mb-1 uppercase line-clamp-1">{product.name}</span>
                                                <span className="text-[0.6rem] font-medium tracking-widest text-outline uppercase">{product.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[0.65rem] font-bold px-3 py-1 bg-surface-container text-on-surface uppercase tracking-widest">{product.category}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                {/* ĐÃ THÊM CHỮ TỪ DO CÓ NHIỀU BIẾN THỂ */}
                                                <span className="text-[0.65rem] font-bold text-outline uppercase tracking-widest mb-1">Từ</span>
                                                <span className="text-sm font-black tracking-tighter text-primary">
                                                    {minPrice.toLocaleString('vi-VN')} ₫
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex items-center gap-2">
                                                <div className={`w-2 h-2 ${totalStock > 10 ? 'bg-primary' : totalStock > 0 ? 'bg-primary-container' : 'bg-error'}`}></div>
                                                <span className={`text-[0.75rem] font-black tracking-wider ${totalStock > 10 ? 'text-on-background' : totalStock > 0 ? 'text-on-primary-container' : 'text-error'}`}>
                                                    {totalStock > 0 ? totalStock : 'HẾT'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <Link to={`/admin/products/edit/${product.id}`} className="p-2 hover:text-primary transition-colors hover:bg-primary/10 rounded-full" title="Sửa">
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </Link>
                                                <button onClick={() => setDeleteModal({ isOpen: true, productId: product.id })} className="p-2 hover:text-error transition-colors hover:bg-error/10 rounded-full" title="Xóa">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {sortedAndFilteredProducts.length > 0 && (
                <footer className="mt-8 flex justify-between items-center py-6 border-t border-outline-variant/20">
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline">
                        Đang hiển thị {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, sortedAndFilteredProducts.length)} của {sortedAndFilteredProducts.length} sản phẩm
                    </span>
                    
                    {totalPages > 1 && (
                        <div className="flex items-center gap-8">
                            <button onClick={prevPage} disabled={currentPage === 1} className="group flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.2rem] transition-all disabled:opacity-30 hover:text-primary">
                                <span className="material-symbols-outlined text-sm">arrow_back</span> Trước
                            </button>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                    <button 
                                        key={number} 
                                        onClick={() => paginate(number)} 
                                        className={`w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors ${currentPage === number ? 'bg-inverse-surface text-inverse-on-surface' : 'text-outline-variant hover:bg-surface-container'}`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>
                            <button onClick={nextPage} disabled={currentPage === totalPages} className="group flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.2rem] transition-all disabled:opacity-30 hover:text-primary">
                                Sau <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </footer>
            )}

            {/* Modal Xóa */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/60 backdrop-blur-sm p-4">
                    <div className="bg-surface p-8 max-w-sm w-full vibe-shadow flex flex-col gap-6 animate-fade-in-up border-t-4 border-error">
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-widest text-error mb-2">Cảnh báo</h3>
                            <p className="text-[0.8rem] font-medium text-on-surface-variant leading-relaxed">
                                Bạn có chắc chắn muốn xóa sản phẩm <span className="font-black text-on-surface">{deleteModal.productId}</span> khỏi kho? Hành động này sẽ xóa toàn bộ các biến thể size/màu của nó.
                            </p>
                        </div>
                        <div className="flex justify-end gap-4 mt-2">
                            <button onClick={() => setDeleteModal({ isOpen: false, productId: null })} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline hover:bg-surface-container-high transition-colors">Hủy bỏ</button>
                            <button onClick={executeDelete} className="px-6 py-3 bg-error text-on-error text-[0.65rem] font-bold uppercase tracking-[0.2rem] hover:bg-error/90 transition-colors vibe-shadow">Xóa sản phẩm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}