import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// LẤY URL TỪ FILE .env KHI DEPLOY, NẾU KHÔNG CÓ THÌ DÙNG LOCALHOST
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// --- 0. COMPONENT SKELETON LOADING ---
const HomeSkeleton = () => (
    <div className="animate-pulse bg-[#FDFBF9] min-h-screen">
        <div className="h-[85vh] bg-[#3E2723]/10 w-full mb-10"></div>
        <div className="max-w-7xl mx-auto px-8 flex gap-6 mb-20 overflow-hidden">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-[#3E2723]/10"></div>
                    <div className="w-16 h-2 bg-[#3E2723]/10 rounded"></div>
                </div>
            ))}
        </div>
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-[#3E2723]/10 rounded-sm"></div>
            ))}
        </div>
    </div>
);

// --- 1. COMPONENT FLASH SALE ---
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
        <div className="animate-fade-in-up mb-12">
            <div className="flex justify-between items-center mb-6 p-6 bg-[#3E2723] border-l-4 border-[#C6A15B] shadow-lg">
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic text-[#FDFBF9]">FLASH SALE</h3>
                    <p className="text-[#C6A15B] text-xs tracking-[0.2rem] font-bold uppercase">{sale.ten_chuong_trinh}</p>
                </div>
                <div className="flex gap-4 font-black text-3xl text-[#FDFBF9] tracking-tighter">
                    <span>{timeLeft.hours.toString().padStart(2, '0')}</span>:
                    <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>:
                    <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sale.items.slice(0, 4).map(item => (
                    <Link to={`/shop/${item.ma_sp}`} key={item.ma_sp} className="group bg-white p-3 shadow-sm hover:shadow-xl transition-shadow duration-500">
                        <div className="relative aspect-[3/4] overflow-hidden mb-3">
                            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={`${STORAGE_URL}/${item.hinh_anh}`} alt={item.ten_sp} />
                            <div className="absolute top-2 left-2 bg-[#B71C1C] text-white px-3 py-1 text-xs font-black shadow-md">-{item.phan_tram_giam}%</div>
                        </div>
                        <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest leading-tight h-10 line-clamp-2 text-[#3E2723]">{item.ten_sp}</h4>
                        <span className="text-[#B71C1C] font-black text-sm md:text-base mt-2 block">{formatPrice(item.gia_giam)}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

// --- 2. COMPONENT SLIDER (CSS SCROLL SNAP THAY VÌ TOÁN HỌC) ---
const ProductSlider = ({ title, products, formatPrice, sliderRef, isDynamic = false }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!products || products.length === 0) return null;

    return (
        <section 
            ref={sliderRef} 
            className={`px-8 max-w-7xl mx-auto border-b border-[#3E2723]/5 animate-fade-in ${isDynamic ? 'py-6 bg-white border-t-2 border-[#3E2723]' : 'py-12'}`}
        >
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter italic text-[#3E2723]">{title}</h2>
                <div className="flex gap-2">
                    <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full bg-[#3E2723]/10 flex items-center justify-center text-[#3E2723] hover:bg-[#3E2723] hover:text-[#FDFBF9] transition-all"><span className="material-symbols-outlined text-base">west</span></button>
                    <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full bg-[#3E2723]/10 flex items-center justify-center text-[#3E2723] hover:bg-[#3E2723] hover:text-[#FDFBF9] transition-all"><span className="material-symbols-outlined text-base">east</span></button>
                </div>
            </div>
            
            <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 pb-4">
                {products.map(item => (
                    <Link to={`/shop/${item.ma_sp}`} key={item.ma_sp} className="snap-start min-w-[70%] md:min-w-[calc(25%-1.2rem)] group bg-white p-3 shadow-sm hover:shadow-lg transition-all duration-300">
                        <div className="aspect-[3/4] overflow-hidden mb-3 relative">
                            <img className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src={`${STORAGE_URL}/${item.hinh_anh}`} alt={item.ten_sp} />
                        </div>
                        <h4 className="text-xs md:text-sm font-bold uppercase tracking-wide mb-1 h-10 line-clamp-2 text-[#3E2723]">{item.ten_sp}</h4>
                        <span className="text-[#3E2723] font-black text-sm md:text-base block">{formatPrice(item.price)}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

// --- 3. COMPONENT HERO CAROUSEL (CODE CỨNG NHƯ Ý SẾP) ---
const HeroCarousel = () => {
    // HARDCODE DỮ LIỆU Ở ĐÂY
    const slides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070",
            title: "VIBE STUDIO",
            subtitle: "FEEL THE VIBE, OWN THE STREET",
            cta: "KHÁM PHÁ NGAY",
            link: "/shop"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070",
            title: "SUMMER '26",
            subtitle: "BỘ SƯU TẬP MÙA HÈ MỚI NHẤT",
            cta: "XEM BỘ SƯU TẬP",
            link: "/shop"
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "MEGA SALE",
            subtitle: "SĂN DEAL HỜI CHỈ CÓ HÔM NAY",
            cta: "SĂN SALE NGAY",
            link: "/shop"
        },

        {
            id: 4,
            image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070",
            title: "NEW ARRIVAL",
            subtitle: "CẬP NHẬT XU HƯỚNG THỜI TRANG MỚI",
            cta: "MUA NGAY",
            link: "/shop"
        },

         {
            id: 5,
            image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2070",
            title: "BEST SELLER",
            subtitle: "NHỮNG SẢN PHẨM ĐƯỢC YÊU THÍCH NHẤT",
            cta: "XEM NGAY",
            link: "/shop"
        }   
    ];

    const [curr, setCurr] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurr((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <section className="relative h-[85vh] overflow-hidden bg-[#FDFBF9]">
            <div 
                className="flex h-full transition-transform duration-1000 cubic-bezier(0.25, 1, 0.5, 1)"
                style={{ transform: `translateX(-${curr * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div key={slide.id} className="min-w-full h-full relative flex items-center px-8 md:px-20">
                        <img 
                            className="absolute inset-0 w-full h-full object-cover opacity-30" 
                            src={slide.image} 
                            alt={slide.title} 
                        />
                        <div className="relative z-10 w-full max-w-5xl">
                            <h1 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter leading-none text-[#3E2723]">
                                {slide.title}
                            </h1>
                            <p className="text-xs md:text-base uppercase tracking-[0.5rem] font-bold mt-6 text-[#C6A15B]">
                                {slide.subtitle}
                            </p>
                            <Link to={slide.link} className="inline-flex items-center gap-2 mt-10 bg-[#3E2723] text-[#FDFBF9] px-10 py-4 text-sm font-black uppercase tracking-widest hover:bg-[#C6A15B] transition-all group">
                                {slide.cta} <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_right_alt</span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {slides.map((_, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setCurr(idx)}
                        className={`h-2.5 rounded-full transition-all duration-500 ${curr === idx ? 'w-10 bg-[#3E2723]' : 'w-2.5 bg-[#3E2723]/30 hover:bg-[#3E2723]/60'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

// --- 4. MAIN HOME ---
export default function Home() {
    const [homeData, setHomeData] = useState({ flashSales: [], categories: [], mensFashion: [], womensFashion: [], newArrivals: [] });
    const [dynamicSec, setDynamicSec] = useState({ title: 'Hàng mới về', products: [] });
    const [activeTab, setActiveTab] = useState(0); 
    const [activeCatId, setActiveCatId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const dynamicRef = useRef(null);
    const stickyMenuRef = useRef(null);
    const scrollCatRef = useRef(null);

    useEffect(() => {
        fetch(`${API_BASE}/client/home-data`)
            .then(res => res.json()).then(data => {
                setHomeData(data);
                setDynamicSec({ title: 'Sản phẩm mới nhất', products: data.newArrivals });
                if (data.flashSales?.length > 0) setActiveTab(0);
                setIsLoading(false);
            }).catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    const handleBookmark = async (cat) => {
        setActiveCatId(cat.ma_dm);
        try {
            const res = await fetch(`${API_BASE}/client/category/${cat.ma_dm}`);
            const products = await res.json();
            setDynamicSec({ title: cat.ten_dm, products });
            
            setTimeout(() => {
                if (dynamicRef.current && stickyMenuRef.current) {
                    const menuHeight = stickyMenuRef.current.offsetHeight;
                    const elementPosition = dynamicRef.current.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                        top: elementPosition - menuHeight - 20,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        } catch (error) { console.error(error); }
    };

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + ' ₫';

    const scrollCategories = (direction) => {
        if (scrollCatRef.current) {
            scrollCatRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
        }
    };

    if (isLoading) return <HomeSkeleton />;

    return (
        <div className="animate-fade-in bg-[#FDFBF9] text-[#3E2723]">
            
            {/* COMPONENT CAROUSEL CODE CỨNG GỌI RA Ở ĐÂY */}
            <HeroCarousel />

            {/* --- BOOKMARK MENU (CSS SNAP) --- */}
            <div ref={stickyMenuRef} className="sticky top-[64px] z-40 bg-[#FDFBF9]/95 backdrop-blur-xl py-4 border-b border-[#3E2723]/10 shadow-md">
                <div className="max-w-7xl mx-auto px-8 flex items-center gap-4">
                    <button onClick={() => scrollCategories('left')} className="text-[#3E2723] hover:text-[#C6A15B] transition-colors md:block hidden">
                        <span className="material-symbols-outlined font-bold text-xl">chevron_left</span>
                    </button>
                    
                    <div 
                        ref={scrollCatRef}
                        className="flex-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-2"
                    >
                        <div className="flex gap-6 md:gap-10">
                            {homeData.categories.map((cat) => {
                                const isActive = activeCatId === cat.ma_dm;
                                return (
                                    <button key={cat.ma_dm} onClick={() => handleBookmark(cat)} className="snap-start flex flex-col items-center gap-2 group min-w-[70px] md:min-w-[90px]">
                                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 transition-all duration-300 p-1 overflow-hidden ${isActive ? 'border-[#3E2723] scale-110 shadow-md rotate-3' : 'border-[#3E2723]/20 hover:border-[#C6A15B]'}`}>
                                            <img className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110" src={cat.representative_image ? `${STORAGE_URL}/${cat.representative_image}` : "https://via.placeholder.com/150"} alt={cat.ten_dm} />
                                        </div>
                                        <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${isActive ? 'text-[#3E2723]' : 'text-[#3E2723]/60 group-hover:text-[#C6A15B]'}`}>{cat.ten_dm}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button onClick={() => scrollCategories('right')} className="text-[#3E2723] hover:text-[#C6A15B] transition-colors md:block hidden">
                        <span className="material-symbols-outlined font-bold text-xl">chevron_right</span>
                    </button>
                </div>
            </div>

            {homeData.flashSales.length > 0 && (
                <section className="py-12 px-8 max-w-7xl mx-auto">
                    <div className="flex gap-6 border-b border-[#3E2723]/10 mb-8 justify-center">
                        {homeData.flashSales.map((sale, idx) => (
                            <button key={sale.ma_fs} onClick={() => setActiveTab(idx)} className={`pb-3 text-xs md:text-sm font-black uppercase tracking-widest relative transition-all ${activeTab === idx ? 'text-[#3E2723]' : 'text-[#3E2723]/40'}`}>
                                {sale.ten_chuong_trinh}
                                {activeTab === idx && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#3E2723] animate-width"></div>}
                            </button>
                        ))}
                    </div>
                    <FlashSaleBlock sale={homeData.flashSales[activeTab]} formatPrice={formatPrice} />
                </section>
            )}

            <ProductSlider title="Men's Collection" products={homeData.mensFashion} formatPrice={formatPrice} />
            <ProductSlider title="Women's Pieces" products={homeData.womensFashion} formatPrice={formatPrice} />

            <ProductSlider 
                title={dynamicSec.title} 
                products={dynamicSec.products} 
                formatPrice={formatPrice} 
                sliderRef={dynamicRef}
                isDynamic={true}
            />

            {/* CTA BANNER CHUẨN UX */}
            <div className="w-full bg-[#3E2723] py-24 px-8 text-center mt-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070')] bg-cover bg-center mix-blend-overlay"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#FDFBF9] mb-4">
                        FEEL THE VIBE, OWN THE STREET
                    </h2>
                    <p className="text-xs md:text-sm uppercase tracking-[0.4rem] font-medium text-[#C6A15B] mb-10">
                        Nâng tầm phong cách cá nhân cùng Vibe Studio 2026
                    </p>
                    <Link 
                        to="/shop" 
                        className="inline-flex items-center gap-3 bg-[#C6A15B] text-[#3E2723] px-12 py-5 text-sm md:text-base font-black uppercase tracking-widest hover:bg-[#FDFBF9] transition-all hover:scale-105 shadow-xl"
                    >
                        SHOP NOW <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}