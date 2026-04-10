import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function ClientHeader() {
    const [isScrolled, setIsScrolled] = useState(false);

    // Hiệu ứng đổi màu Header khi cuộn chuột
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinkClass = ({ isActive }) => 
        `font-['Be_Vietnam_Pro'] tracking-tight font-bold uppercase text-[12px] md:text-[14px] transition-all duration-300 ${
            isActive ? 'text-[#7C572D]' : 'text-[#5F5E5E] dark:text-[#50453B] hover:text-[#7C572D]'
        }`;

    return (
        <nav className={`fixed top-0 w-full flex justify-between items-center px-8 py-6 h-20 z-50 transition-all duration-500 ${
            isScrolled ? 'bg-white/90 dark:bg-[#1A1C1C]/90 backdrop-blur-xl shadow-sm h-16' : 'bg-[#F9F9F9]/70 dark:bg-[#1A1C1C]/70 backdrop-blur-md'
        }`}>
            <div className="flex items-center gap-12">
                <Link to="/" className="text-2xl font-black tracking-tighter text-[#1A1C1C] dark:text-[#F9F9F9] uppercase">
                    Vibe Studio
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    <NavLink to="/shop/nam" className={navLinkClass}>Nam</NavLink>
                    <NavLink to="/shop/nu" className={navLinkClass}>Nữ</NavLink>
                    <NavLink to="/collections" className={navLinkClass}>Bộ sưu tập</NavLink>
                    <NavLink to="/sale" className={navLinkClass}>Khuyến mãi</NavLink>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <Link to="/profile" className="material-symbols-outlined text-[#7C572D] hover:scale-110 transition-transform">person</Link>
                <Link to="/wishlist" className="material-symbols-outlined text-[#7C572D] hover:scale-110 transition-transform">favorite</Link>
                <Link to="/cart" className="relative material-symbols-outlined text-[#7C572D] hover:scale-110 transition-transform">
                    shopping_bag
                    {/* Giỏ hàng có số lượng (Ví dụ: 2) */}
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">2</span>
                </Link>
            </div>
        </nav>
    );
}