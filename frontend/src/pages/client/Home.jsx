import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// --- 1. COMPONENT FLASH SALE (PHONG CÁCH GỌN GÀNG) ---
const FlashSaleBlock = ({ sale, formatPrice }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    useEffect(() => {
        const timer = setInterval(() => {
            const distance = new Date(sale.endTime).getTime() - new Date().getTime();
            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((distance / (1000 * 60)) % 60),
                    seconds: Math.floor((distance / 1000) % 60)
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [sale.endTime]);

    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 p-6 bg-surface-container-low border-l-4 border-primary shadow-sm">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">FLASH SALE</h3>
                    <p className="text-primary text-[8px] tracking-[0.2rem] font-bold uppercase">{sale.ten_chuong_trinh}</p>
                </div>
                <div className="flex gap-4 font-black text-3xl">
                    <span>{timeLeft.hours.toString().padStart(2, '0')}</span>:
                    <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>:
                    <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sale.items.slice(0, 4).map(item => (
                    <Link to={`/shop/${item.ma_sp}`} key={item.ma_sp} className="group">
                        <div className="relative aspect-[3/4] overflow-hidden mb-2 shadow-sm">
                            <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={`http://127.0.0.1:8000/storage/${item.hinh_anh}`} alt={item.ten_sp} />
                            <div className="absolute top-2 left-2 bg-error text-white px-2 py-0.5 text-[9px] font-black">-{item.phan_tram_giam}%</div>
                        </div>
                        <h4 className="text-[9px] font-bold uppercase tracking-widest leading-tight h-6 line-clamp-2">{item.ten_sp}</h4>
                        <span className="text-error font-black text-xs">{formatPrice(item.gia_giam)}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

// --- 2. COMPONENT SLIDER: NÚT ĐÈ HÌNH & LÀM MỜ ---
const ProductSlider = ({ title, products, formatPrice, sliderRef, isDynamic = false }) => {
    const [curr, setCurr] = useState(0);
    useEffect(() => { setCurr(0); }, [products]);
    if (!products || products.length === 0) return null;
    const max = Math.max(0, products.length - 4);

    return (
        <section 
            ref={sliderRef} 
            className={`px-8 max-w-7xl mx-auto border-b border-outline-variant/5 animate-fade-in ${isDynamic ? 'py-4 bg-surface-container-lowest border-t-2 border-primary' : 'py-12'}`}
        >
            <div className="mb-4">
                <h2 className="text-xl font-black uppercase tracking-tighter italic">{title}</h2>
            </div>
            
            <div className="relative group/slider">
                <button 
                    onClick={() => setCurr(c => Math.max(0, c - 1))} 
                    className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-on-surface hover:bg-white/50 transition-all ${curr === 0 ? 'opacity-0' : 'opacity-100'}`}
                >
                    <span className="material-symbols-outlined text-sm">west</span>
                </button>

                <button 
                    onClick={() => setCurr(c => c < max ? c + 1 : 0)} 
                    className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-on-surface hover:bg-white/50 transition-all ${products.length <= 4 ? 'opacity-0' : 'opacity-100'}`}
                >
                    <span className="material-symbols-outlined text-sm">east</span>
                </button>

                <div className="overflow-hidden">
                    <div 
                        className="flex transition-transform duration-700 cubic-bezier(0.25, 1, 0.5, 1) gap-6" 
                        style={{ transform: `translateX(-${curr * (100 / 4 + 0.5)}%)` }}
                    >
                        {products.map(item => (
                            <Link to={`/shop/${item.ma_sp}`} key={item.ma_sp} className="min-w-[calc(25%-1.2rem)] group">
                                <div className="aspect-[3/4] overflow-hidden mb-3 bg-surface-container-low relative shadow-sm">
                                    <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" src={`http://127.0.0.1:8000/storage/${item.hinh_anh}`} alt={item.ten_sp} />
                                </div>
                                <h4 className="text-[9px] font-bold uppercase tracking-[0.1rem] mb-0.5 h-6 line-clamp-2">{item.ten_sp}</h4>
                                <span className="text-primary font-black text-sm">{formatPrice(item.price)}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- 3. MAIN HOME ---
export default function Home() {
    const [homeData, setHomeData] = useState({ flashSales: [], categories: [], mensFashion: [], womensFashion: [], newArrivals: [] });
    const [dynamicSec, setDynamicSec] = useState({ title: 'Hàng mới về', products: [] });
    const [activeTab, setActiveTab] = useState(0); 
    const [activeCatId, setActiveCatId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [catIdx, setCatIdx] = useState(0);
    const visibleCats = 6;

    const dynamicRef = useRef(null);
    const stickyMenuRef = useRef(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/client/home-data')
            .then(res => res.json()).then(data => {
                setHomeData(data);
                setDynamicSec({ title: 'Sản phẩm mới nhất', products: data.newArrivals });
                if (data.flashSales?.length > 0) setActiveTab(0);
                setIsLoading(false);
            });
    }, []);

    const handleBookmark = async (cat) => {
        setActiveCatId(cat.ma_dm);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/client/category/${cat.ma_dm}`);
            const products = await res.json();
            setDynamicSec({ title: cat.ten_dm, products });
            
            setTimeout(() => {
                if (dynamicRef.current && stickyMenuRef.current) {
                    const menuHeight = stickyMenuRef.current.offsetHeight;
                    const elementPosition = dynamicRef.current.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                        top: elementPosition - menuHeight - 45, // Tăng nhẹ để đảm bảo thấy giá
                        behavior: 'smooth'
                    });
                }
            }, 150);
        } catch (error) { console.error(error); }
    };

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + ' ₫';
    const nextCat = () => { if (catIdx < homeData.categories.length - visibleCats) setCatIdx(catIdx + 1); };
    const prevCat = () => { if (catIdx > 0) setCatIdx(catIdx - 1); };

    if (isLoading) return <div className="h-screen flex items-center justify-center font-black tracking-[1rem] uppercase animate-pulse text-primary">VIBE STUDIO...</div>;

    return (
        <div className="animate-fade-in bg-white pb-32 text-on-surface">
            {/* HERO */}
            <section className="relative h-[60vh] flex items-center px-8 md:px-20 bg-surface-container-low overflow-hidden">
                <img className="absolute inset-0 w-full h-full object-cover grayscale opacity-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVDb1r_JIfBnDQe24YQQom1Tgiqbi3lmxBTykUGM5HamQjeT7zqPg3TrAegA0E5lkqzf3a9687Q44Ffg8y2l0e7GImhrBn4EY45IPHwVThpV_rvH6mudRjQNEy0vcz_j9-Qfh2QNoLBvIsW-Imkb_EWt2F6fHT_YukWmUqjl7qIui4uTBJblTs7VMmA4uAvmK4Il6pnk8593lL7FiFXN-chGxjUztAApBQjA2MPvBgB37vt2aw9lXqWyyR5z3Snk8U_L76X6IC7KSE" alt="Hero" />
                <div className="relative z-10">
                    <h1 className="text-5xl md:text-[7rem] font-black uppercase tracking-tighter leading-none">VIBE STUDIO</h1>
                </div>
            </section>

            {/* --- BOOKMARK MENU --- */}
            <div ref={stickyMenuRef} className="sticky top-16 z-50 bg-white/95 backdrop-blur-xl py-4 border-b border-outline-variant/10 shadow-sm">
                <div className="max-w-7xl mx-auto px-8 flex items-center gap-4">
                    <button onClick={prevCat} className={`text-on-surface ${catIdx === 0 ? 'opacity-10' : 'hover:text-primary transition-colors'}`}>
                        <span className="material-symbols-outlined font-bold">chevron_left</span>
                    </button>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex transition-transform duration-500 ease-out gap-6" style={{ transform: `translateX(-${catIdx * (100 / visibleCats + 0.6)}%)` }}>
                            {homeData.categories.map((cat) => (
                                <button key={cat.ma_dm} onClick={() => handleBookmark(cat)} className="flex flex-col items-center gap-1 group min-w-[calc(16.666%-1.2rem)]">
                                    <div className={`w-11 h-11 rounded-full border-2 transition-all p-0.5 overflow-hidden ${activeCatId === cat.ma_dm ? 'border-primary scale-110 shadow-md' : 'border-outline-variant opacity-60'}`}>
                                        <img className={`w-full h-full object-cover rounded-full ${activeCatId === cat.ma_dm ? 'grayscale-0' : 'grayscale'}`} src={cat.representative_image ? `http://127.0.0.1:8000/storage/${cat.representative_image}` : "https://via.placeholder.com/150"} alt={cat.ten_dm} />
                                    </div>
                                    <span className={`text-[6.5px] font-black uppercase tracking-widest ${activeCatId === cat.ma_dm ? 'text-primary' : 'text-outline'}`}>{cat.ten_dm}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={nextCat} className={`text-on-surface ${catIdx >= homeData.categories.length - visibleCats ? 'opacity-10' : 'hover:text-primary transition-colors'}`}>
                        <span className="material-symbols-outlined font-bold">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* --- ⚡ FLASH SALES (ĐÃ QUAY TRỞ LẠI) --- */}
            {homeData.flashSales.length > 0 && (
                <section className="py-12 px-8 max-w-7xl mx-auto border-b border-outline-variant/5">
                    <div className="flex gap-4 border-b border-outline-variant/20 mb-8 justify-center">
                        {homeData.flashSales.map((sale, idx) => (
                            <button key={sale.ma_fs} onClick={() => setActiveTab(idx)} className={`pb-3 text-[10px] font-black uppercase tracking-[0.2rem] relative transition-all ${activeTab === idx ? 'text-primary' : 'text-outline opacity-50'}`}>
                                {sale.ten_chuong_trinh}
                                {activeTab === idx && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-width"></div>}
                            </button>
                        ))}
                    </div>
                    <FlashSaleBlock sale={homeData.flashSales[activeTab]} formatPrice={formatPrice} />
                </section>
            )}

            {/* --- CÁC SECTION SẢN PHẨM --- */}
            <ProductSlider title="Men's Archive" products={homeData.mensFashion} formatPrice={formatPrice} />
            <ProductSlider title="Women's Archive" products={homeData.womensFashion} formatPrice={formatPrice} />

            {/* --- KHU VỰC KHÁM PHÁ (BẤM BOOKMARK NHẢY ĐẾN ĐÂY) --- */}
            <ProductSlider 
                title={dynamicSec.title} 
                products={dynamicSec.products} 
                formatPrice={formatPrice} 
                sliderRef={dynamicRef}
                isDynamic={true}
            />
        </div>
    );
}