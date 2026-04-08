// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';

// export default function AdminSidebar() {
//   const location = useLocation();

//   // Hàm kiểm tra route để active menu
//   const isActive = (path) => location.pathname === path;

//   return (
//     <aside className="fixed left-0 top-0 h-full flex flex-col py-8 bg-[#F9F9F9] dark:bg-[#1A1C1C] w-64 border-r border-[#5F5E5E]/15 z-50">
//       <div className="px-8 mb-12">
//         <h1 className="text-lg font-black text-[#1A1C1C] dark:text-[#F9F9F9] uppercase tracking-tighter">Vibe Studio</h1>
//         <p className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] text-[#50453B] mt-1">Admin Panel</p>
//       </div>

//       <nav className="flex-1 space-y-2 overflow-y-auto">
//         <Link 
//           to="/admin" 
//           className={`flex items-center gap-4 py-3 font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] transition-colors duration-200 ${
//             isActive('/admin') ? 'text-[#1A1C1C] dark:text-[#F9F9F9] border-l-4 border-[#7C572D] pl-4' : 'text-[#5F5E5E] dark:text-[#50453B] pl-5 hover:bg-[#D4A574]/10'
//           }`}
//         >
//           <span className="material-symbols-outlined">dashboard</span>
//           <span>Dashboard</span>
//         </Link>

//        <Link to="/admin/products" className="group flex items-center px-3 py-3 font-['Be_Vietnam_Pro'] uppercase tracking-[0.15rem] text-[0.7rem] font-medium text-[#7C572D] border-l-4 border-[#7C572D] pl-4 translate-x-1 duration-300">
//            <span className="material-symbols-outlined mr-4">apparel</span> Sản phẩm
//         </Link>
//               <Link 
//           to="/admin/categories" 
//           className="flex items-center gap-4 px-6 py-4 text-sm font-bold tracking-[0.15rem] uppercase text-outline-variant hover:text-primary hover:bg-surface-container-high transition-all"
//       >
//           <span className="material-symbols-outlined">category</span>
//           Danh Mục
//       </Link>
//         <Link to="/admin/orders" className="flex items-center gap-4 text-[#5F5E5E] dark:text-[#50453B] pl-5 py-3 font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] hover:bg-[#D4A574]/10 dark:hover:bg-[#7C572D]/10 transition-colors duration-200">
//           <span className="material-symbols-outlined">shopping_cart</span>
//           <span>Đơn hàng</span>
//         </Link>

//         <Link to="/admin/vouchers" className="flex items-center gap-4 text-[#5F5E5E] dark:text-[#50453B] pl-5 py-3 font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] hover:bg-[#D4A574]/10 dark:hover:bg-[#7C572D]/10 transition-colors duration-200">
//           <span className="material-symbols-outlined">sell</span>
//           <span>Khuyến mãi</span>
//         </Link>

//         <Link to="/admin/inventory" className="flex items-center gap-4 text-[#5F5E5E] dark:text-[#50453B] pl-5 py-3 font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] hover:bg-[#D4A574]/10 dark:hover:bg-[#7C572D]/10 transition-colors duration-200">
//           <span className="material-symbols-outlined">warehouse</span>
//           <span>Tồn kho</span>
//         </Link>

//         <Link to="/admin/users" className="flex items-center gap-4 text-[#5F5E5E] dark:text-[#50453B] pl-5 py-3 font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] hover:bg-[#D4A574]/10 dark:hover:bg-[#7C572D]/10 transition-colors duration-200">
//           <span className="material-symbols-outlined">group</span>
//           <span>Khách hàng</span>
//         </Link>

//         <Link to="/admin/settings" className="flex items-center gap-4 text-[#5F5E5E] dark:text-[#50453B] pl-5 py-3 font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] hover:bg-[#D4A574]/10 dark:hover:bg-[#7C572D]/10 transition-colors duration-200">
//           <span className="material-symbols-outlined">settings</span>
//           <span>Cài đặt</span>
//         </Link>
//       </nav>

//       <div className="px-8 pt-8 mt-auto border-t border-[#5F5E5E]/15">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="w-8 h-8 bg-primary-container flex items-center justify-center">
//             <span className="text-[10px] font-bold text-on-primary-container">AD</span>
//           </div>
//           <div>
//             <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface">Curator One</p>
//             <p className="text-[9px] text-secondary uppercase tracking-widest">Master Admin</p>
//           </div>
//         </div>
//         <button className="w-full py-3 bg-[#1A1C1C] text-white font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[10px] hover:bg-primary transition-colors duration-300">
//           Đăng xuất
//         </button>
//       </div>
//     </aside>
//   );
// }