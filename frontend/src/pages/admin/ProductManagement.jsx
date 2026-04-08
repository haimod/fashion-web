import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- STATE CHO TÌM KIẾM & BỘ LỌC ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stockFilter, setStockFilter] = useState(''); // Lọc tồn kho
    const [priceSort, setPriceSort] = useState('default'); // Sắp xếp giá

    // --- STATE PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5;

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/products');
            const data = await response.json();
            setProducts(data);
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
        const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchCategory = selectedCategory === '' || product.category === selectedCategory;
        
        let matchStock = true;
        if (stockFilter === 'in_stock') matchStock = product.stock > 0;
        if (stockFilter === 'out_of_stock') matchStock = product.stock <= 0;
        
        return matchSearch && matchCategory && matchStock;
    });

    // 2. Sắp xếp giá trên danh sách đã lọc
    const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
        if (priceSort === 'price_asc') return a.price - b.price; // Giá thấp đến cao
        if (priceSort === 'price_desc') return b.price - a.price; // Giá cao xuống thấp
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
                toast.error('Không thể xóa! Có thể SP đang nằm trong đơn hàng.');
            }
        } catch (error) {
            toast.error('Lỗi kết nối server!');
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-end mb-10 border-b-0">
                <div className="max-w-2xl">
                    <h2 className="text-5xl font-bold tracking-tight text-on-background mb-4 uppercase">QUẢN LÝ SẢN PHẨM</h2>
                    <p className="text-on-surface-variant font-light text-lg">Phân loại, chỉnh sửa và quản lý danh mục thời trang Urban Curator của bạn.</p>
                </div>
                <Link to="/admin/products/create" className="px-10 py-4 bg-gradient-to-tr from-primary to-primary-container text-on-primary font-bold uppercase tracking-[0.15rem] text-[0.7rem] vibe-shadow hover:opacity-90 transition-all inline-block whitespace-nowrap">
                    THÊM SẢN PHẨM MỚI
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
                        <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
                        <input 
                            type="text" 
                            placeholder="Tên, mã SKU..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-b border-outline-variant/50 py-2 pl-8 focus:border-primary outline-none font-medium text-sm transition-colors"
                        />
                    </div>
                </div>

                {/* Bộ lọc Danh mục */}
                <div className="flex flex-col gap-2">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Danh mục</label>
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none font-medium text-sm text-on-surface cursor-pointer"
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
                        className="w-full bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none font-medium text-sm text-on-surface cursor-pointer"
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
                        className="w-full bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none font-medium text-sm text-on-surface cursor-pointer"
                    >
                        <option value="default">Mặc định</option>
                        <option value="price_asc">Giá: Thấp đến Cao</option>
                        <option value="price_desc">Giá: Cao xuống Thấp</option>
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-surface-container-lowest vibe-shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low border-b-0">
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Hình ảnh</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Tên Sản phẩm / SKU</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Danh mục</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Giá bán</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant">Trạng thái kho</th>
                            <th className="px-8 py-6 text-[0.6rem] font-black tracking-[0.2rem] uppercase text-on-surface-variant text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-0">
                        {isLoading ? (
                            <tr><td colSpan="6" className="text-center py-10 text-outline">Đang tải dữ liệu kho...</td></tr>
                        ) : sortedAndFilteredProducts.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-10 text-outline">Không tìm thấy sản phẩm nào phù hợp.</td></tr>
                        ) : (
                            currentProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-surface-container-low transition-all border-b border-outline-variant/10">
                                    <td className="px-8 py-8">
                                        <div className="w-20 h-24 bg-surface-container-high overflow-hidden">
                                            <img 
                                                alt={product.name} 
                                                className="w-full h-full object-cover" 
                                                src={product.image ? `http://127.0.0.1:8000/storage/${product.image}` : "/images.jpg"} 
                                            />
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold tracking-tight text-on-surface mb-1 uppercase">{product.name}</span>
                                            <span className="text-[0.6rem] font-medium tracking-widest text-outline uppercase">{product.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <span className="text-[0.65rem] font-medium px-3 py-1 bg-secondary-container text-on-secondary-container uppercase tracking-widest">{product.category}</span>
                                    </td>
                                    <td className="px-8 py-8">
                                        <span className="text-sm font-bold tracking-tighter">
                                            {Number(product.price).toLocaleString('vi-VN')} ₫
                                        </span>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 ${product.stock > 10 ? 'bg-primary' : product.stock > 0 ? 'bg-primary-container' : 'bg-error'}`}></div>
                                            <span className={`text-[0.65rem] font-bold uppercase tracking-widest ${product.stock > 10 ? 'text-on-surface-variant' : product.stock > 0 ? 'text-on-primary-container' : 'text-error'}`}>
                                                {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link to={`/admin/products/edit/${product.id}`} className="p-2 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </Link>
                                            <button onClick={() => setDeleteModal({ isOpen: true, productId: product.id })} className="p-2 hover:text-error transition-colors">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <footer className="mt-12 flex justify-between items-center py-10 border-t border-outline-variant/10">
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.2rem] text-outline">
                    Đang hiển thị {sortedAndFilteredProducts.length === 0 ? 0 : indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, sortedAndFilteredProducts.length)} của {sortedAndFilteredProducts.length} sản phẩm
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

            {/* Modal Xóa */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/40 backdrop-blur-sm transition-all">
                    <div className="bg-surface p-8 max-w-sm w-full vibe-shadow flex flex-col gap-6 animate-fade-in-up">
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-widest text-error mb-2">Cảnh báo</h3>
                            <p className="text-[0.8rem] font-medium text-on-surface-variant leading-relaxed">
                                Bạn có chắc chắn muốn xóa sản phẩm <span className="font-bold text-on-surface">{deleteModal.productId}</span> khỏi kho?
                            </p>
                        </div>
                        <div className="flex justify-end gap-4 mt-2">
                            <button onClick={() => setDeleteModal({ isOpen: false, productId: null })} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors">Hủy bỏ</button>
                            <button onClick={executeDelete} className="px-6 py-3 bg-error text-on-error text-[0.65rem] font-bold uppercase tracking-[0.2rem] hover:bg-error/90 transition-colors vibe-shadow">Xóa sản phẩm</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}