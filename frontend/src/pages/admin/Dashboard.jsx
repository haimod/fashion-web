import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State cho Form Flash Sale Builder
  const [flashSaleName, setFlashSaleName] = useState('');
  const [isCreatingFS, setIsCreatingFS] = useState(false);

  useEffect(() => {
      const fetchDashboardData = async () => {
          const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
          try {
              const res = await fetch(`${API_BASE}/admin/dashboard`, {
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                  const result = await res.json();
                  setData(result);
              }
          } catch (error) {
              console.error("Lỗi tải Dashboard:", error);
          } finally {
              setIsLoading(false);
          }
      };
      fetchDashboardData();
  }, []);

  const formatPrice = (p) => Number(p).toLocaleString('vi-VN');

  // 🚨 HÀM KÍCH HOẠT FLASH SALE
  const handleCreateFlashSale = async () => {
      if (!flashSaleName.trim()) {
          toast.warning("Vui lòng nhập tên chiến dịch!");
          return;
      }
      setIsCreatingFS(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      try {
          const res = await fetch(`${API_BASE}/admin/dashboard/flash-sale`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ ten_fs: flashSaleName })
          });
          const result = await res.json();
          if (res.ok) {
              toast.success(result.message);
              setFlashSaleName(''); // Reset ô input
          } else {
              toast.error(result.error);
          }
      } catch (error) {
          toast.error("Lỗi kết nối Server!");
      } finally {
          setIsCreatingFS(false);
      }
  };

  // 🚨 HÀM XUẤT BÁO CÁO NHANH TỪ DASHBOARD
  const handleExportReport = () => {
      if (!data) return;
      toast.info("Đang tạo báo cáo tổng quan...");
      
      const headers = ['CHỈ SỐ', 'GIÁ TRỊ'];
      const csvRows = [
          ['"Doanh thu tháng này (VNĐ)"', data.revenue],
          ['"Tăng trưởng so với tháng trước (%)"', data.growth],
          ['"Đơn hàng mới trong tháng"', data.orders.new],
          ['"Đơn hàng đang chờ xử lý"', data.orders.pending],
          ['"Khách hàng hệ thống"', data.customers],
          ['"Sản phẩm sắp hết hàng"', data.low_stock]
      ];

      const csvContent = "\uFEFF" + headers.join(',') + '\n' + csvRows.map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Vibe_Overview_Report_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      toast.success("Đã tải báo cáo thành công!");
  };

  if (isLoading) {
      return (
          <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-primary animate-pulse">
              <span className="material-symbols-outlined text-5xl">analytics</span>
              <p className="font-['Be_Vietnam_Pro'] font-black tracking-widest uppercase text-sm">Đang tải dữ liệu...</p>
          </div>
      );
  }

  if (!data) return <div className="p-10 text-error font-bold uppercase">Không thể kết nối đến máy chủ.</div>;

  return (
    <>
      <header className="mb-16 flex justify-between items-end">
        <div>
          <span className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.2rem] text-[11px] text-primary">Overview</span>
          <h2 className="text-5xl font-black tracking-tighter text-on-surface mt-2 uppercase">Dashboard</h2>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExportReport} className="cursor-pointer px-8 py-3 bg-white border border-outline-variant/30 text-on-surface font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.15rem] text-[10px] hover:bg-surface-container-low transition-all">
            Xuất báo cáo
          </button>
          <Link to="/admin/products" className="cursor-pointer px-8 py-3 bg-primary text-white font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.15rem] text-[10px] hover:opacity-90 transition-all shadow-xl shadow-primary/10 inline-block text-center">
            Tạo mới +
          </Link>
        </div>
      </header>

      {/* Bento Grid Insights (Giữ nguyên của sếp, Data thật bơm vào) */}
      <div className="grid grid-cols-12 gap-8 mb-16">
        <div className="col-span-12 md:col-span-8 bg-surface-container-low p-10 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <p className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] text-secondary mb-1">Doanh thu tháng này</p>
            <h3 className="text-5xl md:text-6xl font-black tracking-tighter text-on-surface">
              {formatPrice(data.revenue)}<span className="text-xl md:text-2xl ml-2 text-primary">VND</span>
            </h3>
            <div className={`mt-8 flex items-center gap-2 ${data.growth >= 0 ? 'text-emerald-600' : 'text-error'}`}>
              <span className="material-symbols-outlined text-sm">{data.growth >= 0 ? 'trending_up' : 'trending_down'}</span>
              <span className="text-[11px] font-bold uppercase tracking-widest">
                  {data.growth >= 0 ? `+${data.growth}` : data.growth}% so với tháng trước
              </span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[15rem]">payments</span>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-[#1A1C1C] p-10 text-white flex flex-col justify-center">
          <p className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] text-secondary-fixed-dim mb-4">Đơn hàng mới</p>
          <h3 className="text-5xl font-black tracking-tighter">{data.orders.new}</h3>
          <p className="text-[11px] uppercase tracking-widest mt-4 text-primary-container">{data.orders.pending} đơn đang chờ xử lý</p>
        </div>

        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-10 flex flex-col justify-center border border-outline-variant/10">
          <p className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] text-secondary mb-4">Khách hàng hệ thống</p>
          <h3 className="text-4xl font-bold tracking-tighter text-on-surface">{data.customers}</h3>
          <div className="w-full h-1 bg-surface-container mt-6">
            <div className="h-full bg-primary" style={{ width: '65%' }}></div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-primary-container p-10 text-on-primary-container flex flex-col justify-center">
          <p className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] opacity-70 mb-4">Tỉ lệ chuyển đổi</p>
          <h3 className="text-4xl font-bold tracking-tighter">{data.conversion_rate}%</h3>
          <p className="text-[10px] uppercase tracking-widest mt-4 font-bold">+0.5% hôm nay</p>
        </div>

        <div className="col-span-12 md:col-span-4 bg-surface-container-high p-10 flex flex-col justify-center">
          <p className="font-['Be_Vietnam_Pro'] font-medium uppercase tracking-[0.15rem] text-[11px] text-on-surface-variant mb-4">Tồn kho thấp</p>
          <h3 className="text-4xl font-bold tracking-tighter text-error">{data.low_stock} SP</h3>
          <Link to="/admin/inventory" className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline text-left cursor-pointer">Xem danh sách</Link>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-12 gap-12">
        <section className="col-span-12 lg:col-span-8">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.2rem] text-sm">Sản phẩm mới cập nhật</h4>
            <Link to="/admin/products" className="text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors">Xem tất cả</Link>
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
                {data.recent_products && data.recent_products.map(product => (
                    <tr key={product.ma_sp} className="group hover:bg-surface-container-low transition-colors">
                    <td className="py-6 flex items-center gap-4">
                        <div className="w-12 h-16 bg-surface-container relative overflow-hidden">
                        <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={`${STORAGE_URL}/${product.hinh_anh}`} alt={product.ten_sp}/>
                        </div>
                        <div>
                        <p className="text-sm font-bold text-on-surface uppercase tracking-tight line-clamp-1">{product.ten_sp}</p>
                        <p className="text-[10px] text-secondary uppercase tracking-widest mt-1">ID: #{product.ma_sp}</p>
                        </div>
                    </td>
                    <td className="py-6 text-[11px] uppercase tracking-wider text-on-surface-variant">{product.ten_dm}</td>
                    <td className="py-6 text-[11px] font-bold text-right tracking-tighter">{formatPrice(product.gia_ban_thap_nhat)}</td>
                    <td className="py-6 text-center">
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-widest">Hoạt động</span>
                    </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 🚨 THỰC THI FLASH SALE BUILDER */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container-high p-8">
            <h4 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.2rem] text-sm mb-6">Flash Sale Builder</h4>
            <div className="space-y-6">
              <div>
                <label className="block font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.15rem] text-[10px] text-on-surface-variant mb-2">Tên chiến dịch</label>
                <input 
                    className="w-full bg-transparent border-b border-outline-variant py-2 focus:border-primary outline-none text-sm transition-colors" 
                    placeholder="Hanoi Urban Night" 
                    type="text"
                    value={flashSaleName}
                    onChange={(e) => setFlashSaleName(e.target.value)}
                />
              </div>
              <button 
                onClick={handleCreateFlashSale}
                disabled={isCreatingFS}
                className="cursor-pointer w-full py-4 bg-primary text-white font-['Be_Vietnam_Pro'] font-bold uppercase tracking-[0.2rem] text-[10px] hover:opacity-90 transition-all mt-4 disabled:opacity-50"
              >
                {isCreatingFS ? 'Đang kích hoạt...' : 'Kích hoạt Flash Sale'}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Section (Giữ nguyên của sếp) */}
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
          © 2026 Vibe Studio. Built for the Urban Curator.
        </p>
      </footer>
    </>
  );
}