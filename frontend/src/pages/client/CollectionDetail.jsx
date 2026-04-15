import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function CollectionDetail() {
    const { id } = useParams(); // Lấy mã BST từ URL (Ví dụ: BST_01)
    const [data, setData] = useState({ collection: null, products: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Gọi API lấy thông tin BST và các sản phẩm bên trong nó
        fetch(`${API_BASE}/client/collections/${id}`)
            .then(res => res.json())
            .then(resData => {
                if (resData.error) {
                    alert("Lỗi: " + resData.error);
                } else {
                    setData(resData);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [id]);

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + ' ₫';

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9]">
                <div className="w-12 h-12 border-4 border-[#7c572d] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data.collection) return <div className="pt-32 text-center text-xl font-bold">Không tìm thấy Bộ sưu tập!</div>;

    return (
        <div className="bg-[#FDFBF9] text-[#1a1c1c] min-h-screen animate-fade-in font-['Be_Vietnam_Pro']">
            {/* --- BANNER BỘ SƯU TẬP --- */}
            <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
                <img 
                    src={`${STORAGE_URL}/${data.collection.hinh_anh}`} 
                    alt={data.collection.ten_bst} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <span className="text-white/80 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-4">
                        Bộ Sưu Tập
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        {data.collection.ten_bst}
                    </h1>
                    <p className="text-white/90 text-sm md:text-base max-w-2xl font-light">
                        {data.collection.mo_ta}
                    </p>
                </div>
            </div>

            {/* --- DANH SÁCH SẢN PHẨM --- */}
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-widest text-[#3E2723]">Sản phẩm nổi bật</h2>
                        <p className="text-xs text-[#7c572d] font-bold mt-2 uppercase tracking-widest">{data.products.length} Món đồ</p>
                    </div>
                </div>

                {data.products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                        {data.products.map(item => (
                            <Link to={`/product/${item.ma_sp}`} key={item.ma_sp} className="group cursor-pointer">
                                <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F5] mb-4">
                                    <img 
                                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-1000" 
                                        src={`${STORAGE_URL}/${item.hinh_anh}`} 
                                        alt={item.ten_sp} 
                                    />
                                    {item.gia_flash && (
                                        <div className="absolute top-4 left-4 bg-[#B71C1C] text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">SALE</div>
                                    )}
                                </div>
                                <h3 className="text-[12px] uppercase font-bold tracking-widest mb-1 group-hover:text-[#7c572d] transition-colors truncate">{item.ten_sp}</h3>
                                <div className="flex gap-3 items-center mt-2">
                                    <span className="text-[#3E2723] font-black">{formatPrice(item.gia_flash || item.price)}</span>
                                    {item.gia_flash && <span className="text-[#3E2723]/40 line-through text-[11px] font-bold">{formatPrice(item.price)}</span>}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-[#3E2723]/10">
                        <span className="text-[12px] font-black uppercase tracking-[0.2em] opacity-40">Đang cập nhật sản phẩm cho bộ sưu tập này...</span>
                    </div>
                )}
            </div>
        </div>
    );
}