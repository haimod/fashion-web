import React from 'react';

export default function Dashboard() {
  return (
    <>
      {/* Header Section */}
      <header className="mb-16 flex justify-between items-end">
        <div>
          <span className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.2rem] text-[11px] text-primary">Overview</span>
          <h2 className="text-5xl font-black tracking-tighter text-on-surface mt-2 uppercase">Dashboard</h2>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-white border border-outline-variant/30 text-on-surface font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.15rem] text-[10px] hover:bg-surface-container-low transition-all">
            Xuất báo cáo
          </button>
          <button className="px-8 py-3 bg-primary text-white font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.15rem] text-[10px] hover:opacity-90 transition-all shadow-xl shadow-primary/10">
            Tạo mới +
          </button>
        </div>
      </header>

      {/* Bento Grid Insights */}
      <div className="grid grid-cols-12 gap-8 mb-16">
        <div className="col-span-12 md:col-span-8 bg-surface-container-low p-10 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <p className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] text-secondary mb-1">Doanh thu tháng này</p>
            <h3 className="text-6xl font-black tracking-tighter text-on-surface">1.284.000.000<span className="text-2xl ml-2 text-primary">VND</span></h3>
            <div className="mt-8 flex items-center gap-2 text-emerald-600">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="text-[11px] font-bold uppercase tracking-widest">+12.4% so với tháng trước</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[15rem]">payments</span>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-[#1A1C1C] p-10 text-white flex flex-col justify-center">
          <p className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] text-secondary-fixed-dim mb-4">Đơn hàng mới</p>
          <h3 className="text-5xl font-black tracking-tighter">158</h3>
          <p className="text-[11px] uppercase tracking-widest mt-4 text-primary-container">42 đơn đang chờ xử lý</p>
        </div>

        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-10 flex flex-col justify-center border border-outline-variant/10">
          <p className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] text-secondary mb-4">Khách hàng mới</p>
          <h3 className="text-4xl font-bold tracking-tighter text-on-surface">1,024</h3>
          <div className="w-full h-1 bg-surface-container mt-6">
            <div className="w-2/3 h-full bg-primary"></div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-primary-container p-10 text-on-primary-container flex flex-col justify-center">
          <p className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] opacity-70 mb-4">Tỉ lệ chuyển đổi</p>
          <h3 className="text-4xl font-bold tracking-tighter">3.82%</h3>
          <p className="text-[10px] uppercase tracking-widest mt-4 font-bold">+0.5% hôm nay</p>
        </div>

        <div className="col-span-12 md:col-span-4 bg-surface-container-high p-10 flex flex-col justify-center">
          <p className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] text-on-surface-variant mb-4">Tồn kho thấp</p>
          <h3 className="text-4xl font-bold tracking-tighter text-error">12 SP</h3>
          <button className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline text-left">Xem danh sách</button>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-12 gap-12">
        <section className="col-span-12 lg:col-span-8">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.2rem] text-sm">Sản phẩm mới cập nhật</h4>
            <a className="text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors" href="#">Xem tất cả</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="pb-4 font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[10px] text-secondary">Sản phẩm</th>
                  <th className="pb-4 font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[10px] text-secondary">Danh mục</th>
                  <th className="pb-4 font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[10px] text-secondary text-right">Giá (VND)</th>
                  <th className="pb-4 font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[10px] text-secondary text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {/* Product Row */}
                <tr className="group hover:bg-surface-container-low transition-colors">
                  <td className="py-6 flex items-center gap-4">
                    <div className="w-12 h-16 bg-surface-container relative overflow-hidden">
                      <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=200" alt="Product"/>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface uppercase tracking-tight">Urban Linen Shirt</p>
                      <p className="text-[10px] text-secondary uppercase tracking-widest">SKU: VS-001</p>
                    </div>
                  </td>
                  <td className="py-6 text-[11px] uppercase tracking-wider text-on-surface-variant">Nam / Casual</td>
                  <td className="py-6 text-[11px] font-bold text-right tracking-tighter">850,000</td>
                  <td className="py-6 text-center">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-widest">Còn hàng</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Flash Sale / Voucher */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container-high p-8">
            <h4 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.2rem] text-sm mb-6">Flash Sale Builder</h4>
            <div className="space-y-6">
              <div>
                <label className="block font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.15rem] text-[10px] text-on-surface-variant mb-2">Tên chiến dịch</label>
                <input className="w-full bg-transparent border-b border-outline-variant py-2 focus:border-primary outline-none text-sm transition-colors" placeholder="Hanoi Urban Night" type="text"/>
              </div>
              <button className="w-full py-4 bg-primary text-white font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.2rem] text-[10px] hover:opacity-90 transition-all mt-4">Kích hoạt Flash Sale</button>
            </div>
          </div>
        </section>
        </div>
        {/* Footer Section */}
      <footer className="mt-20 pt-16 border-t border-outline-variant/15 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl">
          <div className="col-span-1 md:col-span-2">
            <h5 className="text-xl font-black tracking-widest text-[#1A1C1C] dark:text-[#F9F9F9] uppercase mb-4">
              Vibe Studio
            </h5>
            <p className="font-['Be_Vietnam_Pro'] text-[13px] leading-relaxed text-on-surface-variant max-w-sm">
              Vietnamese Heritage x Urban Edge. Curation of modern aesthetics through the lens of tradition.
            </p>
          </div>
          
          <div>
            <h6 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.2rem] text-[11px] mb-6">Hệ thống</h6>
            <ul className="space-y-3 font-['Be_Vietnam_Pro'] text-[13px] text-secondary">
              <li><a className="hover:text-primary transition-colors" href="#">Bảo mật hệ thống</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Nhật ký hoạt động</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Phân quyền Curator</a></li>
            </ul>
          </div>
          
          <div>
            <h6 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.2rem] text-[11px] mb-6">Hỗ trợ</h6>
            <ul className="space-y-3 font-['Be_Vietnam_Pro'] text-[13px] text-secondary">
              <li><a className="hover:text-primary transition-colors" href="#">Tài liệu hướng dẫn</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Báo cáo lỗi</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Trung tâm kỹ thuật</a></li>
            </ul>
          </div>
        </div>
        
        <p className="mt-16 font-['Be_Vietnam_Pro'] text-[11px] uppercase tracking-widest text-on-surface-variant opacity-60">
          © 2024 Vibe Studio. Built for the Urban Curator.
        </p>
      </footer>

      

      {/* Floating Action Button */}
      <div className="fixed bottom-12 right-12">
        <button className="w-16 h-16 bg-primary text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300">
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </>
  );
}