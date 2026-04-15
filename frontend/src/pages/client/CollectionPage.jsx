import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function CollectionPage() {
    const [collections, setCollections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/client/collections`)
            .then(res => {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    return res.json();
                } else {
                    throw new Error("Backend sập! Trả về HTML thay vì JSON.");
                }
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setCollections(data);
                } else {
                    setCollections([]);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Lỗi fetch Bộ sưu tập:", err.message);
                setCollections([]); 
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9]">
                <div className="w-12 h-12 border-4 border-[#7c572d] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const getGridClass = (index) => {
        const pattern = index % 4;
        if (pattern === 0) return "md:col-span-8 aspect-[16/9]"; 
        if (pattern === 1) return "md:col-span-4 aspect-[4/5]";  
        if (pattern === 2) return "md:col-span-4 aspect-square"; 
        return "md:col-span-8 aspect-[16/9]";                    
    };

    return (
        <div className="bg-[#f4fafd] text-[#161d1f] font-['Be_Vietnam_Pro'] animate-fade-in">
            <main className="pt-24">
                
                {/* --- HERO SECTION (ĐÃ ÉP CÂN CHO NHỎ LẠI) --- */}
                {collections.length > 0 && (
                    <section className="relative w-full h-[45vh] md:h-[500px] overflow-hidden px-4 md:px-12 pb-8">
                        <div className="relative h-full w-full group overflow-hidden rounded-sm">
                            <img 
                                alt={collections[0].ten_bst} 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                                src={`${STORAGE_URL}/${collections[0].hinh_anh}`} 
                            />
                            
                            {/* Box thông tin đã được thu gọn */}
                            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 max-w-sm md:max-w-md bg-white/90 backdrop-blur-md p-6 md:p-8 shadow-xl">
                                <span className="text-[9px] md:text-[10px] text-[#7c572d] tracking-[0.2em] font-black mb-3 block uppercase">
                                    BỘ SƯU TẬP MỚI NHẤT
                                </span>
                                <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-none text-[#161d1f] mb-3 md:mb-4 uppercase">
                                    {collections[0].ten_bst}
                                </h1>
                                <p className="text-xs md:text-sm text-[#586062] leading-relaxed mb-5 md:mb-6 line-clamp-2">
                                    {collections[0].mo_ta || 'Khám phá bộ sưu tập mới nhất từ Vibe Studio.'}
                                </p>
                                <Link 
                                    to={`/collection/${collections[0].ma_bst}`}
                                    className="inline-block bg-[#7c572d] text-white px-6 py-3 md:px-8 md:py-3 text-[10px] md:text-xs tracking-widest uppercase font-black hover:bg-[#161d1f] transition-all"
                                >
                                    Khám Phá Ngay
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* --- LƯỚI BENTO CÁC BỘ SƯU TẬP CÒN LẠI --- */}
                <section className="px-4 md:px-12 py-12 md:py-16 bg-[#f4fafd]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#161d1f] mb-3 md:mb-4">Các Bộ Sưu Tập</h2>
                            <p className="text-[#586062] text-sm md:text-base max-w-md">Những câu chuyện được kể qua từng thớ vải và đường kim mũi chỉ, mang đậm dấu ấn nghệ thuật của Vibe Studio.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                        {collections.slice(1).map((item, index) => (
                            <Link 
                                to={`/collection/${item.ma_bst}`} 
                                key={item.ma_bst} 
                                className={`${getGridClass(index)} group cursor-pointer relative overflow-hidden bg-[#e8eff1] block rounded-sm shadow-sm hover:shadow-xl transition-shadow`}
                            >
                                <img 
                                    alt={item.ten_bst} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 mix-blend-multiply" 
                                    src={`${STORAGE_URL}/${item.hinh_anh}`}
                                />
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-[#161d1f]/80 via-[#161d1f]/10 to-transparent opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white md:transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-2xl md:text-3xl font-black uppercase mb-1 md:mb-2 leading-tight">{item.ten_bst}</h3>
                                    <p className="text-xs md:text-sm opacity-90 italic font-light hidden md:block line-clamp-1">
                                        {item.mo_ta || 'Khám phá ngay...'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* --- QUOTE SECTION --- */}
                <section className="bg-[#eef5f7] py-20 md:py-28 px-6 md:px-12 flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-[#7c572d] text-4xl md:text-5xl mb-6 md:mb-8">auto_stories</span>
                    <blockquote className="max-w-3xl mb-10 md:mb-12">
                        <p className="text-xl md:text-3xl font-light italic text-[#161d1f] leading-relaxed">
                            "Thời trang không chỉ là những gì chúng ta mặc, mà là cách chúng ta thể hiện bản sắc văn hóa và tâm hồn của mình với thế giới."
                        </p>
                        <cite className="block mt-6 text-[10px] md:text-xs font-bold text-[#7c572d] tracking-[0.2em] not-italic uppercase">— Trần Đức Hải</cite>
                    </blockquote>
                    <div className="w-16 md:w-24 h-px bg-[#827569]/30"></div>
                </section>
                
            </main>
        </div>
    );
}