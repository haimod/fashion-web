import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function CategoryPage() {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false); // Trạng thái lọc nhẹ
    
    // --- STATE BỘ LỌC ---
    const [priceMax, setPriceMax] = useState(5000000);
    const [displayPrice, setDisplayPrice] = useState(5000000); // Giá hiển thị khi đang kéo
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [sort, setSort] = useState('newest');

    const productTypes = id === 'DM_NAM' 
        ? ['Áo sơ mi', 'Quần Cargo', 'Áo khoác Urban', 'Phụ kiện'] 
        : ['Váy', 'Áo kiểu', 'Quần Tây', 'Túi xách'];

    // 🚀 HÀM GỌI API CHUẨN
    const fetchProducts = useCallback(async (isInitial = false) => {
        if (isInitial) setIsLoading(true);
        else setIsFiltering(true);

        try {
            let url = `${API_BASE}/client/category/${id}?price_max=${priceMax}&sort=${sort}`;
            if (selectedSize) url += `&size=${selectedSize}`;
            if (selectedType) url += `&type=${selectedType}`;

            const res = await fetch(url);
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Lỗi fetch:", err);
        } finally {
            setIsLoading(false);
            setIsFiltering(false);
        }
    }, [id, priceMax, selectedSize, selectedType, sort]);

    // ⏱️ DEBOUNCE CHO THANH GIÁ: Tránh dựt lag khi kéo liên tục
    useEffect(() => {
        const timer = setTimeout(() => {
            setPriceMax(displayPrice);
        }, 400); // Đợi 0.4s sau khi ngừng kéo mới gọi API
        return () => clearTimeout(timer);
    }, [displayPrice]);

    useEffect(() => {
        fetchProducts(products.length === 0);
    }, [id, priceMax, selectedSize, selectedType, sort]);

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + ' ₫';

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#7c572d] border-t-transparent rounded-full animate-spin"></div>
                <span className="font-black tracking-[0.3em] uppercase text-[#7c572d] text-xs">Vibe Studio</span>
            </div>
        </div>
    );

    return (
        <div className="bg-[#FDFBF9] text-[#1a1c1c] min-h-screen animate-fade-in">
            <main className="pt-24 flex flex-col md:flex-row max-w-[1600px] mx-auto">
                
                {/* --- SIDEBAR FILTERS (Thiết kế tinh gọn) --- */}
                <aside className="w-full md:w-80 h-fit md:h-[calc(100vh-6rem)] md:sticky top-24 px-8 py-6 space-y-10 overflow-y-auto no-scrollbar border-r border-[#3E2723]/5">
                    <div className="flex items-center justify-between md:block">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3rem] text-[#C6A15B] mb-6">Bộ lọc sản phẩm</h2>
                    </div>

                    {/* 1. Giới tính */}
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest">Bộ sưu tập</h3>
                        <div className="flex flex-row md:flex-col gap-3">
                            <Link to="/category/DM_NAM" className={`px-4 py-2 text-[12px] uppercase tracking-wider border transition-all ${id === 'DM_NAM' ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'border-[#3E2723]/10 hover:border-[#3E2723]'}`}>Nam</Link>
                            <Link to="/category/DM_NU" className={`px-4 py-2 text-[12px] uppercase tracking-wider border transition-all ${id === 'DM_NU' ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'border-[#3E2723]/10 hover:border-[#3E2723]'}`}>Nữ</Link>
                        </div>
                    </div>

                    {/* 2. Loại sản phẩm */}
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest">Phân loại</h3>
                        <div className="flex flex-wrap md:flex-col gap-2 md:gap-3">
                            <button onClick={() => setSelectedType(null)} className={`text-left text-[13px] transition-colors ${!selectedType ? 'text-[#7c572d] font-bold underline underline-offset-8' : 'text-[#50453b] hover:text-[#7c572d]'}`}>Tất cả</button>
                            {productTypes.map(type => (
                                <button key={type} onClick={() => setSelectedType(type)} className={`text-left text-[13px] transition-colors uppercase ${selectedType === type ? 'text-[#7c572d] font-bold underline underline-offset-8' : 'text-[#50453b] hover:text-[#7c572d]'}`}>{type}</button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Khoảng giá (DisplayPrice thay đổi lập tức, PriceMax thay đổi sau 0.4s) */}
                    <div className="space-y-5">
                        <div className="flex justify-between items-end">
                            <h3 className="text-[11px] font-black uppercase tracking-widest">Giá tối đa</h3>
                            <span className="text-[12px] font-bold text-[#7c572d]">{formatPrice(displayPrice)}</span>
                        </div>
                        <input className="w-full h-[2px] bg-[#3E2723]/10 accent-[#3E2723] appearance-none cursor-pointer" max="5000000" min="500000" step="100000" type="range" value={displayPrice} onChange={(e) => setDisplayPrice(e.target.value)} />
                    </div>

                    {/* 4. Size */}
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest">Kích thước</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {['S', 'M', 'L', 'XL'].map(s => (
                                <button key={s} onClick={() => setSelectedSize(s === selectedSize ? null : s)} className={`aspect-square text-[10px] font-bold border transition-all ${selectedSize === s ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'border-[#3E2723]/10 hover:border-[#3E2723]'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* --- PRODUCT GRID AREA --- */}
                <section className="flex-1 px-8 py-6 relative">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter uppercase italic text-[#3E2723] mb-2">{id === 'DM_NAM' ? 'Men' : 'Women'}</h1>
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

                    {/* Danh sách sản phẩm với Overlay Loader */}
                    <div className={`relative transition-all duration-500 ${isFiltering ? 'opacity-40 blur-[2px] pointer-events-none scale-[0.98]' : 'opacity-100 blur-0 scale-100'}`}>
                        {products.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                                {products.map(item => (
                                    <div key={item.ma_sp} className="group relative flex flex-col animate-fade-in-up">
                                        <Link to={`/product/${item.ma_sp}`}>
                                            <div className="aspect-[3/4] overflow-hidden bg-[#F2F2F2] relative">
                                                <img src={`${STORAGE_URL}/${item.hinh_anh}`} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-1000" alt={item.ten_sp} />
                                                {item.gia_flash && <div className="absolute top-0 left-0 bg-[#B71C1C] text-white px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2rem]">Sale</div>}
                                                <div className="absolute inset-0 bg-[#3E2723]/0 group-hover:bg-[#3E2723]/5 transition-colors duration-500"></div>
                                            </div>
                                        </Link>
                                        <div className="mt-6 space-y-1">
                                            <Link to={`/product/${item.ma_sp}`} className="text-[13px] font-bold uppercase tracking-widest hover:text-[#C6A15B] transition-colors truncate block">{item.ten_sp}</Link>
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
                                <span className="text-[11px] font-black uppercase tracking-[0.4rem] opacity-30 text-center px-10">Rất tiếc, không tìm thấy sản phẩm phù hợp.</span>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}