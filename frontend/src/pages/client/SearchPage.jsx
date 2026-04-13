import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query'); // Lấy từ khóa sếp vừa gõ từ URL
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setIsLoading(true);
            try {
                // Sử dụng API lấy sản phẩm tổng quát kèm theo từ khóa search
                // Backend của sếp đã có hàm getAllProducts xử lý cái này rồi
                const res = await fetch(`${API_BASE}/client/shop?search=${query}`);
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (query) {
            fetchResults();
        }
    }, [query]);

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + ' ₫';

    return (
        <div className="bg-[#FDFBF9] min-h-screen pt-32 pb-20 px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Tiêu đề kết quả */}
                <div className="mb-12 border-b border-[#3E2723]/10 pb-8">
                    <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-[#3E2723]">
                        KẾT QUẢ CHO: <span className="text-[#C6A15B]">"{query}"</span>
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3rem] mt-2 opacity-50 text-[#3E2723]">
                        Vibe Studio / Tìm thấy {products.length} sản phẩm
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-[#3E2723] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2rem] text-[#3E2723]">Đang bới đồ...</span>
                    </div>
                ) : products.length > 0 ? (
                    /* Lưới sản phẩm chuẩn Bento */
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {products.map(item => (
                            <div key={item.ma_sp} className="group animate-fade-in-up">
                                <Link to={`/product/${item.ma_sp}`}>
                                    <div className="aspect-[3/4] overflow-hidden bg-[#F2F2F2] mb-4 relative">
                                        <img 
                                            src={`${STORAGE_URL}/${item.hinh_anh}`} 
                                            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700" 
                                            alt={item.ten_sp} 
                                        />
                                        {item.gia_flash && (
                                            <div className="absolute top-0 left-0 bg-[#B71C1C] text-white px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2rem]">
                                                Sale
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-[#3E2723]/0 group-hover:bg-[#3E2723]/5 transition-colors duration-500"></div>
                                    </div>
                                    <h3 className="text-[12px] font-bold uppercase tracking-widest truncate text-[#3E2723]">
                                        {item.ten_sp}
                                    </h3>
                                    <div className="mt-2 flex items-baseline gap-3">
                                        <span className="text-[14px] font-black text-[#3E2723]">
                                            {formatPrice(item.gia_flash || item.price)}
                                        </span>
                                        {item.gia_flash && (
                                            <span className="text-[11px] line-through opacity-30 font-bold text-[#3E2723]">
                                                {formatPrice(item.price)}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Trường hợp không tìm thấy gì */
                    <div className="py-32 text-center">
                        <span className="material-symbols-outlined text-6xl opacity-10 mb-4 text-[#3E2723]">search_off</span>
                        <p className="text-[11px] font-black uppercase tracking-[0.4rem] opacity-30 text-[#3E2723]">
                            Rất tiếc, chúng tôi không tìm thấy sản phẩm nào cho từ khóa này.
                        </p>
                        <Link to="/shop" className="inline-block mt-8 text-[10px] font-black uppercase tracking-widest underline underline-offset-8 hover:text-[#C6A15B] text-[#3E2723]">
                            Khám phá Bộ sưu tập khác
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}