import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function ClientHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const navigate = useNavigate();
    
    const cartCount = 2;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== "") {
        // 🚨 THAY ĐỔI QUAN TRỌNG: Dẫn về /search kèm theo query 🚨
        navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
        
        // Đóng search trên mobile và xóa input (tùy chọn)
        setIsMobileSearchOpen(false);
        setSearchQuery(""); 
    }
};

    const navLinkClass = ({ isActive }) => 
        `text-[11px] lg:text-[13px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative pb-2 ${
            isActive 
                ? 'text-[#3E2723] after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#3E2723]' 
                : 'text-[#3E2723]/50 hover:text-[#C6A15B]'
        }`;

    return (
        <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ease-in-out ${
            isScrolled 
                ? 'bg-[#FDFBF9]/95 backdrop-blur-md shadow-sm h-16' 
                : 'bg-[#FDFBF9] h-20'
        }`}>
            <div className="max-w-[1440px] mx-auto h-full px-6 lg:px-12 flex justify-between items-center relative">
                
                {/* --- TRÁI: LOGO & SEARCH (DESKTOP) --- */}
                <div className="flex items-center gap-10">
                    <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter text-[#3E2723] uppercase hover:opacity-70 transition-opacity">
                        Vibe Studio
                    </Link>

                    <div className="hidden lg:flex items-center relative group">
                        <span className="material-symbols-outlined text-[20px] absolute left-0 opacity-40 group-focus-within:text-[#C6A15B] group-focus-within:opacity-100 transition-all">search</span>
                        <input 
                            type="text"
                            placeholder="TÌM SẢN PHẨM..."
                            className="bg-transparent border-none border-b border-transparent focus:border-[#3E2723]/10 focus:ring-0 text-[11px] font-bold uppercase tracking-widest w-32 focus:w-60 pl-8 pb-1 transition-all duration-500 placeholder:text-[#3E2723]/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-0 text-[14px] opacity-40 hover:opacity-100">✕</button>
                        )}
                    </div>
                </div>

                {/* --- GIỮA: MENU --- */}
                <nav className="hidden md:flex items-center gap-8 lg:gap-12">
                    <NavLink to="/category/DM_NAM" className={navLinkClass}>Nam</NavLink>
                    <NavLink to="/category/DM_NU" className={navLinkClass}>Nữ</NavLink>
                    <NavLink to="/shop" end className={navLinkClass}>Bộ sưu tập</NavLink>
                    <NavLink to="/sale" className={navLinkClass}>Sale</NavLink>
                </nav>

                {/* --- PHẢI: ICONS --- */}
                <div className="flex items-center gap-5 lg:gap-7 text-[#3E2723]">
                    {/* Search Trigger (Mobile) */}
                    <button 
                        onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        className="lg:hidden material-symbols-outlined text-[24px] hover:text-[#C6A15B]"
                    >
                        {isMobileSearchOpen ? 'close' : 'search'}
                    </button>

                    <Link to="/profile" className="hover:text-[#C6A15B] transition-colors">
                        <span className="material-symbols-outlined text-[26px] font-light">person</span>
                    </Link>

                    <Link to="/cart" className="relative group p-1">
                        <span className="material-symbols-outlined text-[24px] font-light group-hover:scale-110 transition-transform duration-300">
                            shopping_bag
                        </span>
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-[#3E2723] text-[#FDFBF9] text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* --- SEARCH OVERLAY (MOBILE) --- */}
                <div className={`absolute top-full left-0 w-full bg-[#FDFBF9] border-b border-[#3E2723]/5 px-6 py-4 transition-all duration-300 md:hidden ${
                    isMobileSearchOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'
                }`}>
                    <div className="flex items-center bg-[#3E2723]/5 px-4 py-2">
                        <input 
                            type="text"
                            placeholder="TÌM SẢN PHẨM..."
                            className="bg-transparent border-none focus:ring-0 text-[12px] font-bold uppercase w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <button onClick={() => setSearchQuery("")} className="material-symbols-outlined text-[20px] opacity-40">close</button>
                    </div>
                </div>

            </div>
        </header>
    );
}