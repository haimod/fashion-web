import React from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';

export default function AdminLayout() {
    // Hàm này giúp tự động đổi màu Menu tùy theo trang đang đứng
    const getNavClass = ({ isActive }) => {
        const baseClass = "group flex items-center px-3 py-3 font-['Be_Vietnam_Pro'] uppercase tracking-[0.15rem] text-[0.7rem] font-medium transition-all duration-300";
        const activeClass = "text-[#7C572D] dark:text-[#D4A574] border-l-4 border-[#7C572D] pl-4 translate-x-1";
        const inactiveClass = "text-[#5F5E5E] dark:text-[#50453B] pl-5 hover:text-[#1A1C1C] dark:hover:text-white";
        
        return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
    };

    return (
        <div className="bg-background text-on-background antialiased overflow-x-hidden flex">
            {/* SideNavBar - Đã nâng cấp bằng NavLink */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r-0 bg-[#F9F9F9] dark:bg-[#1A1C1C] flex flex-col py-8 gap-y-6 vibe-shadow z-50">
                <div className="px-8 mb-4">
                    <h1 className="text-2xl font-black tracking-tighter text-[#1A1C1C] dark:text-[#F9F9F9]">VIBE STUDIO</h1>
                    <p className="font-['Be_Vietnam_Pro'] uppercase tracking-[0.15rem] text-[0.7rem] font-medium text-[#5F5E5E]">Admin Curator</p>
                </div>
                <nav className="flex-1 flex flex-col gap-y-1">
                    {/* Dùng "end" để Dashboard không bị sáng khi vào các trang con */}
                    <NavLink to="/admin" end className={getNavClass}>
                        <span className="material-symbols-outlined mr-4">dashboard</span> Dashboard
                    </NavLink>
                    <NavLink to="/admin/products" className={getNavClass}>
                        <span className="material-symbols-outlined mr-4">apparel</span> Sản phẩm
                    </NavLink>
                    <NavLink to="/admin/categories" className={getNavClass}>
                        <span className="material-symbols-outlined mr-4">category</span> Danh mục
                    </NavLink>
                    <NavLink to="/admin/orders" className={getNavClass}>
                        <span className="material-symbols-outlined mr-4">shopping_cart</span> Đơn hàng
                    </NavLink>
                    <NavLink to="/admin/vouchers" className={getNavClass}>
                        <span className="material-symbols-outlined mr-4">sell</span> Khuyến mãi
                    </NavLink>
                    <NavLink to="/admin/inventory" className={getNavClass}>
                        <span className="material-symbols-outlined mr-4">inventory_2</span> Tồn kho
                    </NavLink>
                    <NavLink to="/admin/users" className={getNavClass}>
                        <span className="material-symbols-outlined mr-4">group</span> Khách hàng
                    </NavLink>
                    <NavLink to="/admin/settings" className={getNavClass}>
                        <span className="material-symbols-outlined mr-4">settings</span> Cài đặt
                    </NavLink>
                </nav>
                <div className="mt-auto px-8 border-t-0 flex flex-col gap-y-4">
                    <Link to="#" className="flex items-center font-['Be_Vietnam_Pro'] uppercase tracking-[0.15rem] text-[0.7rem] font-medium text-[#5F5E5E] hover:text-[#1A1C1C] transition-all">
                        <span className="material-symbols-outlined mr-4">help</span> Support
                    </Link>
                    <Link to="#" className="flex items-center font-['Be_Vietnam_Pro'] uppercase tracking-[0.15rem] text-[0.7rem] font-medium text-[#5F5E5E] hover:text-error transition-all">
                        <span className="material-symbols-outlined mr-4">logout</span> Log out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 w-full min-h-screen bg-surface flex flex-col">
                {/* TopNavBar */}
                <header className="sticky top-0 z-40 bg-[#F9F9F9] dark:bg-[#1A1C1C] flex justify-between items-center w-full px-8 py-4 border-b-0 tonal-shift">
                    <div className="flex items-center gap-x-8">
                        {/* Đã comment ẩn ô tìm kiếm thừa ở đây */}
                        {/* <div className="relative w-64">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-sm">search</span>
                            <input className="w-full bg-transparent border-b border-outline-variant focus:border-primary outline-none py-1 pl-9 pr-2 text-xs uppercase tracking-widest font-medium placeholder:text-outline-variant/60" placeholder="Tìm kiếm..." type="text" />
                        </div> */}
                    </div>
                    <div className="flex items-center gap-x-6">
                        <div className="flex items-center gap-x-4 font-['Be_Vietnam_Pro'] tracking-[-2%] font-bold uppercase text-[0.75rem] text-[#5F5E5E]">
                            <button className="material-symbols-outlined p-2 hover:bg-[#D4A574]/10 transition-colors duration-200">notifications</button>
                            <button className="material-symbols-outlined p-2 hover:bg-[#D4A574]/10 transition-colors duration-200">account_circle</button>
                        </div>
                    </div>
                </header>

                {/* KHU VỰC THAY ĐỔI THEO TRANG */}
                <div className="flex-1 p-12 relative">
                    <Outlet /> 
                    
                    {/* Chữ VIBE mờ ở góc dưới cùng màn hình (Chữ ký thương hiệu) */}
                    <div className="fixed bottom-12 right-12 opacity-5 pointer-events-none">
                        <h3 className="text-9xl font-black tracking-tighter text-outline select-none">VIBE</h3>
                    </div>
                </div>
            </main>
        </div>
    );
}