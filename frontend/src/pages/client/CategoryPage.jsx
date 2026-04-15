import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function CategoryPage() {
    const { id } = useParams(); // Sẽ nhận 'NAM', 'NU' hoặc 'PK'
    
    const [categories, setCategories] = useState([]); 
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    
    const [priceMax, setPriceMax] = useState(5000000);
    const [displayPrice, setDisplayPrice] = useState(5000000); 
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedSubCat, setSelectedSubCat] = useState(null); 
    const [sort, setSort] = useState('newest');
    
    // State quản lý việc Đóng/Mở của 2 nhóm Menu
    const [showMainCats, setShowMainCats] = useState(true); // Luôn mở nhóm hiện tại khi vào trang
    const [showOtherCats, setShowOtherCats] = useState(false);

    // 1. LẤY TẤT CẢ DANH MỤC TỪ DATABASE
    useEffect(() => {
        fetch(`${API_BASE}/client/home-data`)
            .then(res => res.json())
            .then(data => {
                if (data.categories) setCategories(data.categories);
            })
            .catch(err => console.error("Lỗi danh mục:", err));
    }, []);

    // Tự động dịch mã ID thành Tên Nhóm để làm Tiêu đề Dropdown
    const getMainCategoryName = (code) => {
        if (code === 'NAM') return 'Nam';
        if (code === 'NU') return 'Nữ';
        if (code === 'PK') return 'Phụ kiện';
        return 'Danh mục';
    };

    // Lọc danh sách con
    const subCategories = categories.filter(cat => cat.ma_dm && cat.ma_dm.startsWith(`${id}_`));
    const otherCategories = categories.filter(cat => 
        cat.ma_dm && 
        !cat.ma_dm.startsWith('NAM_') && 
        !cat.ma_dm.startsWith('NU_') && 
        !cat.ma_dm.startsWith(`${id}_`)
    );

    // 2. GỌI API SẢN PHẨM
    const fetchProducts = useCallback(async (isInitial = false) => {
        if (isInitial) setIsLoading(true);
        else setIsFiltering(true);

        try {
            let url = `${API_BASE}/client/category/${id}?price_max=${priceMax}&sort=${sort}`;
            if (selectedSize) url += `&size=${selectedSize}`;
            if (selectedSubCat) url += `&sub_category=${selectedSubCat}`;

            const res = await fetch(url);
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Lỗi fetch:", err);
        } finally {
            setIsLoading(false);
            setIsFiltering(false);
        }
    }, [id, priceMax, selectedSize, selectedSubCat, sort]);

    // 3. CÁC HIỆU ỨNG VÀ EVENT
    useEffect(() => {
        const timer = setTimeout(() => setPriceMax(displayPrice), 400); 
        return () => clearTimeout(timer);
    }, [displayPrice]);

    // Khi chuyển tab trên Top Nav (Nam <-> Nữ)
    useEffect(() => {
        setSelectedSubCat(null); 
        setShowMainCats(true); // Luôn xổ Menu chính ra
        setShowOtherCats(false); // Thu gọn Menu Khác lại
        fetchProducts(true);
    }, [id]);

    useEffect(() => {
        fetchProducts(false);
    }, [priceMax, selectedSize, selectedSubCat, sort]);

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + ' ₫';
    const pageTitle = id === 'NAM' ? "Men's Collection" : id === 'NU' ? "Women's Collection" : "Accessories";

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9]">
            <div className="w-12 h-12 border-4 border-[#7c572d] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="bg-[#FDFBF9] text-[#1a1c1c] min-h-screen animate-fade-in">
            <main className="pt-24 flex flex-col md:flex-row max-w-[1600px] mx-auto">
                
                {/* --- SIDEBAR FILTERS --- */}
                <aside className="w-full md:w-80 h-fit md:h-[calc(100vh-6rem)] md:sticky top-24 px-8 py-6 space-y-10 border-r border-[#3E2723]/5">
                    
                    <div className="flex items-center justify-between md:block">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3rem] text-[#C6A15B] mb-6">
                            Bộ lọc sản phẩm
                        </h2>
                    </div>

                    {/* 1. PHÂN LOẠI (Dropdown Xổ Xuống) */}
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest">Phân loại</h3>
                        <div className="flex flex-col gap-1">
                            
                            {/* --- ACCORDION NHÓM CHÍNH (Nam/Nữ) --- */}
                            <div className="border-b border-[#3E2723]/10 pb-3">
                                <button 
                                    onClick={() => setShowMainCats(!showMainCats)}
                                    className="text-left text-[13px] font-bold uppercase text-[#50453b] hover:text-[#7c572d] flex items-center justify-between w-full"
                                >
                                    <span>{getMainCategoryName(id)}</span>
                                    <span className={`text-[10px] transition-transform ${showMainCats ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                
                                <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${showMainCats ? 'max-h-[500px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <button 
                                        onClick={() => setSelectedSubCat(null)} 
                                        className={`text-left text-[12px] pl-3 border-l-2 transition-colors uppercase ${!selectedSubCat ? 'border-[#7c572d] text-[#7c572d] font-bold' : 'border-[#3E2723]/20 text-[#50453b] hover:text-[#7c572d]'}`}
                                    >
                                        Tất cả {getMainCategoryName(id)}
                                    </button>
                                    {subCategories.map(cat => (
                                        <button 
                                            key={cat.ma_dm} 
                                            onClick={() => setSelectedSubCat(cat.ma_dm)} 
                                            className={`text-left text-[12px] pl-3 border-l-2 transition-colors uppercase ${selectedSubCat === cat.ma_dm ? 'border-[#7c572d] text-[#7c572d] font-bold' : 'border-[#3E2723]/20 text-[#50453b] hover:text-[#7c572d]'}`}
                                        >
                                            {cat.ten_dm}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* --- ACCORDION NHÓM KHÁC (Phụ kiện...) --- */}
                            {otherCategories.length > 0 && (
                                <div className="pt-3">
                                    <button 
                                        onClick={() => setShowOtherCats(!showOtherCats)}
                                        className="text-left text-[13px] font-bold uppercase text-[#50453b] hover:text-[#7c572d] flex items-center justify-between w-full"
                                    >
                                        <span>Khác</span>
                                        <span className={`text-[10px] transition-transform ${showOtherCats ? 'rotate-180' : ''}`}>▼</span>
                                    </button>
                                    
                                    <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${showOtherCats ? 'max-h-[500px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        {otherCategories.map(cat => (
                                            <button 
                                                key={cat.ma_dm} 
                                                onClick={() => setSelectedSubCat(cat.ma_dm)} 
                                                className={`text-left text-[12px] pl-3 border-l-2 transition-colors uppercase ${selectedSubCat === cat.ma_dm ? 'border-[#7c572d] text-[#7c572d] font-bold' : 'border-[#3E2723]/20 text-[#50453b] hover:text-[#7c572d]'}`}
                                            >
                                                {cat.ten_dm}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* 2. KÍCH THƯỚC (Size) */}
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest">Kích thước</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {['S', 'M', 'L', 'XL'].map(s => (
                                <button 
                                    key={s} 
                                    onClick={() => setSelectedSize(s === selectedSize ? null : s)} 
                                    className={`aspect-square text-[10px] font-bold border transition-all ${selectedSize === s ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'border-[#3E2723]/10 hover:border-[#3E2723]'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. KHOẢNG GIÁ */}
                    <div className="space-y-5">
                        <div className="flex justify-between items-end">
                            <h3 className="text-[11px] font-black uppercase tracking-widest">Giá tối đa</h3>
                            <span className="text-[12px] font-bold text-[#7c572d]">{formatPrice(displayPrice)}</span>
                        </div>
                        <input className="w-full h-[2px] bg-[#3E2723]/10 accent-[#3E2723] appearance-none cursor-pointer" max="5000000" min="500000" step="100000" type="range" value={displayPrice} onChange={(e) => setDisplayPrice(e.target.value)} />
                    </div>

                </aside>

                {/* --- LƯỚI SẢN PHẨM --- */}
                <section className="flex-1 px-8 py-6 relative">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter uppercase italic text-[#3E2723] mb-2">{pageTitle}</h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3rem] text-[#C6A15B]">Vibe Studio / {products.length} Products</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white px-4 py-2 border border-[#3E2723]/5 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Sắp xếp:</span>
                            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent border-none outline-none text-[11px] font-black uppercase cursor-pointer">
                                <option value="newest">Mới nhất</option>
                                <option value="price_asc">Giá tăng dần</option>
                                <option value="price_desc">Giá giảm dần</option>
                            </select>
                        </div>
                    </div>

                    <div className={`relative transition-all duration-500 ${isFiltering ? 'opacity-40 blur-[2px]' : 'opacity-100 blur-0'}`}>
                        {products.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                                {products.map(item => (
                                    <div key={item.ma_sp} className="group relative flex flex-col">
                                        <Link to={`/product/${item.ma_sp}`}>
                                            <div className="aspect-[3/4] overflow-hidden bg-[#F2F2F2] relative">
                                                <img src={`${STORAGE_URL}/${item.hinh_anh}`} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-1000" alt={item.ten_sp} />
                                                {item.gia_flash && <div className="absolute top-0 left-0 bg-[#B71C1C] text-white px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2rem]">Sale</div>}
                                            </div>
                                        </Link>
                                        <div className="mt-6 space-y-1">
                                            <Link to={`/product/${item.ma_sp}`} className="text-[13px] font-bold uppercase truncate hover:text-[#C6A15B] transition-colors block">{item.ten_sp}</Link>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-[15px] font-medium text-[#3E2723]">{formatPrice(item.gia_flash || item.price)}</span>
                                                {item.gia_flash && <span className="text-[11px] line-through opacity-30 font-bold">{formatPrice(item.price)}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[50vh] flex items-center justify-center border-2 border-dashed border-[#3E2723]/10">
                                <span className="text-[11px] font-black uppercase tracking-[0.4rem] opacity-30">Không có sản phẩm</span>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}