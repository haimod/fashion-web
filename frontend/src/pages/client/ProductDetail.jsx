import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'FREESIZE'];

export default function ProductDetail() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [mainImage, setMainImage] = useState(null); 
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [activeTab, setActiveTab] = useState('desc');

    const [currentPrice, setCurrentPrice] = useState(0);
    const [currentStock, setCurrentStock] = useState(null);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setIsLoading(true);
        window.scrollTo(0, 0);
        setSelectedColor(null);
        setSelectedSize(null);
        setSelectedVariant(null);

        fetch(`${API_BASE}/client/product/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setCurrentPrice(data.gia_flash || data.gia_ban_thap_nhat);
                setMainImage(data.hinh_anh);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Lỗi tải chi tiết sản phẩm:", err);
                setIsLoading(false);
            });
    }, [id]);

    useEffect(() => {
        if (product && product.variants && selectedColor && selectedSize) {
            const matchedVariant = product.variants.find(
                v => v.mau_sac === selectedColor && v.kich_thuoc === selectedSize
            );
            if (matchedVariant) {
                setCurrentPrice(product.gia_flash || matchedVariant.gia_ban);
                setCurrentStock(matchedVariant.so_luong_ton);
                setSelectedVariant(matchedVariant);
            } else {
                setCurrentStock(0);
                setSelectedVariant(null);
            }
        } else {
            setSelectedVariant(null);
        }
    }, [selectedColor, selectedSize, product]);

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + 'đ';

    // --- HÀM 1: THÊM VÀO GIỎ HÀNG ---
    const handleAddToCart = async () => {
        if (!selectedVariant || !selectedVariant.ma_bien_the) {
            toast.warning("Vui lòng chọn Kích thước và Màu sắc!", { position: 'bottom-right' });
            return false;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.info("Vui lòng đăng nhập để mua hàng!", { position: 'bottom-right' });
            navigate('/login');
            return false;
        }

        try {
            const res = await fetch(`${API_BASE}/client/cart/add`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    ma_bien_the: selectedVariant.ma_bien_the, 
                    so_luong: quantity 
                })
            });

            if (res.ok) {
                toast.success("Đã thêm vào giỏ hàng!", { position: 'bottom-right', autoClose: 2000 });
                return true;
            } else {
                const data = await res.json();
                toast.error(`Lỗi: ${data.error || 'Có lỗi xảy ra'}`);
                return false;
            }
        } catch (error) {
            toast.error("Lỗi kết nối đến máy chủ!");
            return false;
        }
    };

    // --- HÀM 2: MUA NGAY (CHUYỂN THẲNG ĐẾN CHECKOUT) ---
    const handleBuyNow = () => {
        if (!selectedVariant || !selectedVariant.ma_bien_the) {
            toast.warning("Vui lòng chọn Kích thước và Màu sắc!", { position: 'bottom-right' });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.info("Vui lòng đăng nhập để mua hàng!", { position: 'bottom-right' });
            navigate('/login');
            return;
        }

        // Truyền thẳng dữ liệu món đồ qua state của React Router
        navigate('/checkout', {
            state: {
                directItem: {
                    ma_bien_the: selectedVariant.ma_bien_the,
                    ten_sp: product.ten_sp,
                    hinh_anh: product.hinh_anh,
                    kich_thuoc: selectedVariant.kich_thuoc,
                    mau_sac: selectedVariant.mau_sac,
                    gia_ban: currentPrice,
                    so_luong: quantity
                }
            }
        });
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center font-black tracking-widest text-[#3E2723] animate-pulse">ĐANG TẢI...</div>;
    if (!product || product.error) return <div className="h-screen flex items-center justify-center font-black text-2xl">KHÔNG TÌM THẤY SẢN PHẨM</div>;

    return (
        <div className="bg-[#FDFBF9] text-[#3E2723] pt-20 pb-32 animate-fade-in relative">
            <div className="max-w-[1440px] mx-auto px-8 py-12 lg:grid lg:grid-cols-12 lg:gap-16 items-start">
                
                {/* Cột trái: Ảnh sản phẩm */}
                <div className="lg:col-span-7 space-y-4 sticky top-28">
                    <div className="w-full aspect-[4/5] overflow-hidden bg-[#F5F5F5]">
                        <img className="w-full h-full object-cover mix-blend-multiply transition-opacity duration-300" src={`${STORAGE_URL}/${mainImage}`} alt={product.ten_sp} />
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide py-2">
                        <button 
                            onClick={() => setMainImage(product.hinh_anh)}
                            className={`cursor-pointer flex-shrink-0 w-20 h-24 snap-start transition-all ${mainImage === product.hinh_anh ? 'border-b-2 border-[#3E2723] opacity-100' : 'opacity-50 hover:opacity-100'}`}
                        >
                            <img className="w-full h-full object-cover mix-blend-multiply" src={`${STORAGE_URL}/${product.hinh_anh}`} alt="Thumbnail" />
                        </button>
                        {product.gallery && product.gallery.map((img, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setMainImage(img.duong_dan)}
                                className={`cursor-pointer flex-shrink-0 w-20 h-24 snap-start transition-all ${mainImage === img.duong_dan ? 'border-b-2 border-[#3E2723] opacity-100' : 'opacity-50 hover:opacity-100'}`}
                            >
                                <img className="w-full h-full object-cover mix-blend-multiply" src={`${STORAGE_URL}/${img.duong_dan}`} alt={`Gallery ${idx}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cột phải: Chi tiết sản phẩm */}
                <div className="lg:col-span-5 sticky top-28 h-fit mt-12 lg:mt-0 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide pr-2">
                    <div className="flex flex-col gap-8">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.2rem] text-[#C6A15B] font-bold mb-3">{product.ten_dm || 'Danh mục'}</p>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-4">{product.ten_sp}</h1>
                            <div className="flex items-center gap-3">
                                {product.rating > 0 ? (
                                    <>
                                        <div className="flex text-[#C6A15B]">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: i < Math.round(product.rating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                            ))}
                                        </div>
                                        <span className="text-[11px] uppercase tracking-widest opacity-50">{product.review_count} ĐÁNH GIÁ</span>
                                    </>
                                ) : (
                                    <span className="text-[10px] uppercase tracking-widest opacity-40">CHƯA CÓ ĐÁNH GIÁ</span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 border-b border-[#3E2723]/10 pb-6">
                            <div className="flex items-baseline gap-4">
                                {product.gia_flash ? (
                                    <>
                                        <span className="text-2xl md:text-3xl font-medium tracking-tight text-[#B71C1C]">{formatPrice(currentPrice)}</span>
                                        <span className="text-sm md:text-base opacity-40 line-through tracking-wider">{formatPrice(product.gia_goc)}</span>
                                    </>
                                ) : (
                                    <span className="text-2xl md:text-3xl font-medium tracking-tight">{formatPrice(currentPrice)}</span>
                                )}
                            </div>
                            {currentStock !== null && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${currentStock > 0 ? 'bg-green-700' : 'bg-[#B71C1C]'}`}></span>
                                    <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
                                        {currentStock > 0 ? `CÒN HÀNG (${currentStock})` : 'HẾT HÀNG'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-8">
                            {/* Chọn Màu Sắc */}
                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.15rem] font-bold mb-4">Màu sắc <span className="text-[#C6A15B] ml-2 opacity-80">{selectedColor || ''}</span></p>
                                    <div className="flex flex-wrap gap-3">
                                        {product.colors.map((color, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => setSelectedColor(color.ten_mau)}
                                                className={`cursor-pointer px-6 py-2.5 border text-[11px] font-black uppercase tracking-[0.15rem] transition-all ${
                                                    selectedColor === color.ten_mau ? 'border-[#3E2723] bg-[#3E2723] text-[#FDFBF9]' : 'border-[#3E2723]/20 hover:border-[#3E2723]'
                                                }`}
                                            >
                                                {color.ten_mau}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Chọn Kích Thước */}
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <p className="text-[11px] uppercase tracking-[0.15rem] font-bold">Kích thước <span className="text-[#C6A15B] ml-2 opacity-80">{selectedSize || ''}</span></p>
                                    <button 
                                        onClick={() => setShowSizeGuide(true)}
                                        className="cursor-pointer text-[10px] uppercase tracking-widest underline opacity-40 hover:text-[#C6A15B] hover:opacity-100 transition-all"
                                    >
                                        HƯỚNG DẪN SIZE
                                    </button>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {STANDARD_SIZES.map((sizeName, idx) => {
                                        const dbSize = product.sizes?.find(s => 
                                            s.ten_size && s.ten_size.trim().toUpperCase() === sizeName.toUpperCase()
                                        );
                                        const isAvailable = dbSize && dbSize.so_luong_ton > 0;

                                        return (
                                            <button 
                                                key={idx}
                                                onClick={() => isAvailable && setSelectedSize(sizeName)}
                                                disabled={!isAvailable}
                                                className={`cursor-pointer disabled:cursor-not-allowed py-3.5 border text-[11px] font-black uppercase tracking-widest transition-all ${
                                                    !isAvailable 
                                                        ? 'opacity-20 border-[#3E2723]/20 bg-gray-50' 
                                                        : selectedSize === sizeName 
                                                            ? 'border-[#3E2723] bg-[#3E2723] text-[#FDFBF9]' 
                                                            : 'border-[#3E2723]/20 hover:border-[#3E2723]'
                                                }`}
                                            >
                                                {sizeName}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Các nút hành động */}
                        <div className="flex flex-col gap-3 pt-6 border-t border-[#3E2723]/10 mt-2">
                            <button 
                                onClick={handleBuyNow}
                                className="cursor-pointer disabled:cursor-not-allowed w-full py-5 bg-[#3E2723] text-[#FDFBF9] font-black uppercase tracking-[0.2rem] text-[12px] hover:bg-[#C6A15B] transition-colors disabled:opacity-50"
                                disabled={!selectedColor || !selectedSize || currentStock === 0}
                            >
                                {(!selectedColor || !selectedSize) ? 'CHỌN PHÂN LOẠI HÀNG' : (currentStock === 0 ? 'HẾT HÀNG' : 'MUA NGAY')}
                            </button>
                            <button 
                                onClick={handleAddToCart}
                                className="cursor-pointer disabled:cursor-not-allowed w-full py-5 border-2 border-[#3E2723] text-[#3E2723] font-black uppercase tracking-[0.2rem] text-[12px] hover:bg-[#3E2723]/5 transition-all disabled:opacity-40"
                                disabled={!selectedColor || !selectedSize || currentStock === 0}
                            >
                                THÊM VÀO GIỎ
                            </button>
                        </div>

                        <div className="flex justify-between pt-6 opacity-60">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">GIAO HÀNG MIỄN PHÍ</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[18px]">sync</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">30 NGÀY ĐỔI TRẢ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs: Mô tả & Đánh giá */}
            <section className="max-w-[1440px] mx-auto px-8 mt-10 border-t border-[#3E2723]/10 pt-16">
                <div className="border-b border-[#3E2723]/15 flex gap-12 overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveTab('desc')} className={`cursor-pointer pb-4 border-b-2 font-bold uppercase text-[12px] tracking-[0.2rem] whitespace-nowrap transition-colors ${activeTab === 'desc' ? 'border-[#3E2723] text-[#3E2723]' : 'border-transparent opacity-50 hover:opacity-100'}`}>Mô tả sản phẩm</button>
                    <button onClick={() => setActiveTab('reviews')} className={`cursor-pointer pb-4 border-b-2 font-bold uppercase text-[12px] tracking-[0.2rem] whitespace-nowrap transition-colors ${activeTab === 'reviews' ? 'border-[#3E2723] text-[#3E2723]' : 'border-transparent opacity-50 hover:opacity-100'}`}>Đánh giá {product.review_count ? `(${product.review_count})` : ''}</button>
                </div>
                <div className="py-12">
                    {activeTab === 'desc' && <div className="max-w-3xl leading-relaxed text-sm md:text-base opacity-80" dangerouslySetInnerHTML={{ __html: product.mo_ta || '<p>Chưa có mô tả.</p>' }}></div>}
                    {activeTab === 'reviews' && (
                        <div>
                            {product.reviews && product.reviews.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-8">
                                    {product.reviews.map(review => (
                                        <div key={review.id} className="bg-white p-6 shadow-sm border border-[#3E2723]/5">
                                            <p className="font-bold uppercase text-[12px] tracking-widest">{review.ten_khach_hang}</p>
                                            <div className="flex text-[#C6A15B] my-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < review.so_sao ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                                ))}
                                            </div>
                                            <p className="text-sm opacity-80">{review.noi_dung}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 opacity-50 text-sm font-bold tracking-widest uppercase">Sản phẩm chưa có đánh giá nào.</div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Gợi ý cho bạn */}
            {product.related_products && product.related_products.length > 0 && (
                <section className="max-w-[1440px] mx-auto px-8 mt-16 mb-20 border-t border-[#3E2723]/10 pt-16">
                    <div className="mb-10 flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-[#3E2723]">GỢI Ý CHO BẠN</h2>
                            <p className="text-[10px] md:text-xs uppercase tracking-[0.2rem] font-bold mt-2 text-[#C6A15B]">Sản phẩm có thể bạn sẽ thích</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {product.related_products.map(item => (
                            <Link to={`/shop/${item.ma_sp}`} key={item.ma_sp} className="cursor-pointer group bg-white p-4 border border-[#3E2723]/5 shadow-sm hover:shadow-xl transition-shadow duration-500 block relative">
                                {item.gia_flash && (
                                    <div className="absolute top-6 left-6 z-10 bg-[#B71C1C] text-white px-2 py-1 text-[9px] font-black shadow-md uppercase tracking-widest">
                                        SALE
                                    </div>
                                )}
                                <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-[#F5F5F5]">
                                    <img className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105" src={`${STORAGE_URL}/${item.hinh_anh}`} alt={item.ten_sp} />
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-[0.15rem] leading-tight h-8 line-clamp-2 text-[#3E2723] mb-1">{item.ten_sp}</h4>
                                <div className="mt-2">
                                    {item.gia_flash ? (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[#B71C1C] font-black text-sm">{formatPrice(item.gia_flash)}</span>
                                            <span className="text-[10px] line-through opacity-40 font-bold">{formatPrice(item.price)}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[#3E2723] font-black text-sm block">{formatPrice(item.price)}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Modal Bảng Hướng Dẫn Size */}
            {showSizeGuide && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1C1C]/60 backdrop-blur-sm p-4 animate-fade-in cursor-pointer"
                    onClick={() => setShowSizeGuide(false)}
                >
                    <div 
                        className="cursor-default bg-[#FDFBF9] w-full max-w-2xl p-8 md:p-10 relative shadow-2xl animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <button 
                            onClick={() => setShowSizeGuide(false)} 
                            className="cursor-pointer absolute top-5 right-5 text-[#3E2723]/60 hover:text-[#B71C1C] transition-colors"
                        >
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-[#3E2723] mb-8 text-center italic">
                            Bảng hướng dẫn Size
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-center text-sm border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-[#3E2723] text-[#3E2723] uppercase tracking-widest text-[10px]">
                                        <th className="py-4 font-black">Size</th>
                                        <th className="py-4 font-black">Chiều cao (cm)</th>
                                        <th className="py-4 font-black">Cân nặng (kg)</th>
                                        <th className="py-4 font-black">Vòng ngực (cm)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[#3E2723]/90 text-[13px]">
                                    <tr className="border-b border-[#3E2723]/10 hover:bg-[#3E2723]/5 transition-colors">
                                        <td className="py-4 font-black">S</td><td className="py-4">155 - 162</td><td className="py-4">45 - 52</td><td className="py-4">80 - 84</td>
                                    </tr>
                                    <tr className="border-b border-[#3E2723]/10 hover:bg-[#3E2723]/5 transition-colors">
                                        <td className="py-4 font-black">M</td><td className="py-4">163 - 168</td><td className="py-4">53 - 58</td><td className="py-4">84 - 88</td>
                                    </tr>
                                    <tr className="border-b border-[#3E2723]/10 hover:bg-[#3E2723]/5 transition-colors">
                                        <td className="py-4 font-black">L</td><td className="py-4">169 - 174</td><td className="py-4">59 - 68</td><td className="py-4">88 - 92</td>
                                    </tr>
                                    <tr className="border-b border-[#3E2723]/10 hover:bg-[#3E2723]/5 transition-colors">
                                        <td className="py-4 font-black">XL</td><td className="py-4">175 - 180</td><td className="py-4">69 - 78</td><td className="py-4">92 - 96</td>
                                    </tr>
                                    <tr className="hover:bg-[#3E2723]/5 transition-colors bg-[#3E2723]/5">
                                        <td className="py-4 font-black text-[#C6A15B]">FREESIZE</td>
                                        <td colSpan="3" className="py-4 font-medium uppercase tracking-widest text-[10px]">
                                            Phù hợp mọi dáng người dưới 75kg
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}