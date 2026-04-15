import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function ClientHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // State của Giao diện
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    // State của Chức năng Đăng nhập & Giỏ hàng
    const [cartCount, setCartCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Xử lý Scroll để đổi màu Header
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hàm lấy số lượng giỏ hàng
    const fetchCartCount = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setCartCount(0);
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/client/cart`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const total = data.reduce((sum, item) => sum + item.so_luong, 0);
                setCartCount(total);
            }
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng", error);
        }
    };

    // Kiểm tra đăng nhập và đếm giỏ hàng mỗi khi đổi trang
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        if (token) fetchCartCount();

        // Lắng nghe sự kiện thêm vào giỏ từ các trang khác
        const handleCartUpdate = () => fetchCartCount();
        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [location.pathname]);

    // Xử lý Tìm kiếm
    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== "") {
            navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery(""); 
        }
    };

    // Xử lý Đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setCartCount(0);
        toast.success("Đã đăng xuất thành công!");
        navigate('/login');
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
                
                {/* --- TRÁI: LOGO & SEARCH --- */}
                <div className="flex items-center gap-10">
                    <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter text-[#3E2723] uppercase hover:opacity-70 transition-opacity">
                        Vibe Studio
                    </Link>

                    {/* Khung tìm kiếm (bên trái) */}
                    <div className="hidden lg:flex items-center relative group">
                        <span className="material-symbols-outlined text-[20px] absolute left-0 opacity-40 group-focus-within:text-[#C6A15B] group-focus-within:opacity-100 transition-all cursor-default">search</span>
                        <input 
                            type="text"
                            placeholder="TÌM SẢN PHẨM..."
                            className="bg-transparent border-none border-b border-transparent focus:border-[#3E2723]/10 focus:ring-0 text-[11px] font-bold uppercase tracking-widest w-32 focus:w-60 pl-8 pb-1 transition-all duration-500 placeholder:text-[#3E2723]/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-0 text-[14px] opacity-40 hover:opacity-100 cursor-pointer">✕</button>
                        )}
                    </div>
                </div>

                {/* --- GIỮA: MENU --- */}
                <nav className="hidden md:flex items-center gap-8 lg:gap-12">
                    <NavLink to="/category/NAM" className={navLinkClass}>Nam</NavLink>
                    <NavLink to="/category/NU" className={navLinkClass}>Nữ</NavLink>
                    <NavLink to="/shop" className={navLinkClass}>Bộ Sưu Tập</NavLink>
                    <NavLink to="/sale" className={navLinkClass}>Sale</NavLink>
                </nav>

                {/* --- PHẢI: ICONS (TÀI KHOẢN & GIỎ HÀNG) --- */}
                <div className="flex items-center gap-5 lg:gap-7 text-[#3E2723]">

                    {/* --- TÀI KHOẢN (ĐỘNG) --- */}
                    {isLoggedIn ? (
                        <div 
                            className="relative py-4 cursor-pointer"
                            onMouseEnter={() => setShowUserMenu(true)}
                            onMouseLeave={() => setShowUserMenu(false)}
                        >
                            <button onClick={() => navigate('/profile')} className="hover:text-[#C6A15B] transition-colors flex items-center cursor-pointer">
                                <span className="material-symbols-outlined text-[26px] font-light">person</span>
                            </button>
                            
                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 top-[80%] w-48 bg-[#FDFBF9] border border-[#3E2723]/10 shadow-xl py-2 flex flex-col z-[110] animate-fade-in">
                                    <div className="px-5 py-3 border-b border-[#3E2723]/10 mb-2">
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#3E2723]/50">Tài khoản của tôi</p>
                                    </div>
                                    <Link to="/profile" className="px-5 py-2.5 text-[12px] font-bold tracking-widest uppercase hover:bg-[#3E2723]/5 hover:text-[#C6A15B] transition-colors flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[18px]">account_circle</span> Hồ sơ
                                    </Link>
                                    <Link to="/orders" className="px-5 py-2.5 text-[12px] font-bold tracking-widest uppercase hover:bg-[#3E2723]/5 hover:text-[#C6A15B] transition-colors flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[18px]">receipt_long</span> Đơn hàng
                                    </Link>
                                    <div className="h-px bg-[#3E2723]/10 my-2"></div>
                                    <button onClick={handleLogout} className="cursor-pointer px-5 py-2.5 text-[12px] font-bold tracking-widest uppercase text-[#B71C1C] hover:bg-[#B71C1C]/10 transition-colors text-left flex items-center gap-3 w-full">
                                        <span className="material-symbols-outlined text-[18px]">logout</span> Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="text-[11px] font-black uppercase tracking-widest bg-[#3E2723] text-[#FDFBF9] px-5 py-2 border hover:bg-[#FDFBF9] hover:text-[#3E2723] hover:border-[#3E2723] transition-colors">
                            ĐĂNG NHẬP
                        </Link>
                    )}

                    {/* --- GIỎ HÀNG (ĐỘNG) --- */}
                    <Link to="/cart" className="relative group p-1 cursor-pointer">
                        <span className="material-symbols-outlined text-[24px] font-light group-hover:scale-110 transition-transform duration-300">
                            shopping_bag
                        </span>
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-[#3E2723] text-[#FDFBF9] text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>
                </div>

            </div>
        </header>
    );
}