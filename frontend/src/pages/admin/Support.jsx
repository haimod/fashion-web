import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function Support() {
    // State quản lý việc đóng/mở câu hỏi thường gặp (FAQ)
    const [openFaqId, setOpenFaqId] = useState(1); // Mặc định mở câu đầu tiên

    // Dữ liệu FAQ tĩnh (Không cần gọi API cho phần này)
    const faqs = [
        { 
            id: 1, 
            q: 'Làm thế nào để cập nhật trạng thái tồn kho hàng loạt?', 
            a: 'Bạn có thể sử dụng chức năng "Import CSV" trong menu Inventory. Tải file mẫu, điền mã SKU và số lượng mới, sau đó tải lên để hệ thống tự động đồng bộ.' 
        },
        { 
            id: 2, 
            q: 'Tôi có thể hoàn tiền cho khách hàng trực tiếp trên Admin không?', 
            a: 'Có, trong chi tiết đơn hàng, chọn "Hoàn tiền". Hệ thống sẽ kết nối với cổng thanh toán để xử lý giao dịch trả lại tiền cho khách hàng theo phương thức thanh toán ban đầu.' 
        },
        { 
            id: 3, 
            q: 'Làm sao để thiết lập mã giảm giá cho một bộ sưu tập cụ thể?', 
            a: 'Trong menu Khuyến mãi (Vouchers), khi tạo mã mới, ở mục "Điều kiện áp dụng", bạn chọn "Chỉ áp dụng cho Bộ sưu tập" và tick chọn BST mong muốn.' 
        },
        { 
            id: 4, 
            q: 'Quy trình xử lý đơn hàng bị trả lại là gì?', 
            a: 'Khi nhận được hàng hoàn, vào menu Đơn hàng, tìm đơn tương ứng và chuyển trạng thái sang "Đã hoàn trả". Kho sẽ tự động cộng lại số lượng sản phẩm.' 
        },
        { 
            id: 5, 
            q: 'Làm thế nào để thêm nhân viên mới vào hệ thống quản trị?', 
            a: 'Vui lòng liên hệ với Super Admin hoặc gửi email về support@vibe-studio.vn để được cấp quyền tạo tài khoản nhân sự mới (Phân quyền Role).' 
        }
    ];

    const toggleFaq = (id) => {
        setOpenFaqId(openFaqId === id ? null : id);
    };

    const handleLiveChat = () => {
        toast.info('Hệ thống Live Chat đang được kết nối với đội ngũ kỹ thuật...');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full animate-fade-in-up">
            {/* Header / Hero Section: System Status */}
            <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-surface-container-low p-10 flex flex-col justify-between relative overflow-hidden vibe-shadow border-l-4 border-primary">
                    <div className="relative z-10">
                        <p className="text-[0.7rem] uppercase tracking-[0.2rem] font-bold text-primary mb-4">Hệ Thống Trực Tuyến</p>
                        <h3 className="text-4xl font-black tracking-tight mb-6 uppercase leading-none">Chào mừng trở lại,<br/>Admin</h3>
                        <p className="text-on-surface-variant max-w-md">Tất cả các dịch vụ cốt lõi đang hoạt động bình thường. Chúng tôi đang xử lý ?? đơn hàng trong 24h qua.</p>
                    </div>
                    <div className="mt-8 flex items-center gap-4 relative z-10">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white vibe-shadow rounded-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-emerald-700">API: 99.9%</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white vibe-shadow rounded-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-emerald-700">Thanh Toán: OK</span>
                        </div>
                    </div>
                    {/* Icon nền chìm trang trí */}
                    <div className="absolute -right-10 -bottom-10 opacity-[0.03] pointer-events-none">
                        <span className="material-symbols-outlined text-[15rem]">verified_user</span>
                    </div>
                </div>

                {/* Quick Contact Card */}
                <div className="bg-primary p-10 text-on-primary flex flex-col justify-between vibe-shadow">
                    <div>
                        <h4 className="text-lg font-bold uppercase tracking-wider mb-2">Cần hỗ trợ ngay?</h4>
                        <p className="text-on-primary/80 text-sm">Đội ngũ kỹ thuật của Vibe luôn sẵn sàng hỗ trợ bạn 24/7 qua Live Chat.</p>
                    </div>
                    <div className="space-y-4 mt-8">
                        <button onClick={handleLiveChat} className="w-full bg-white text-primary py-4 text-[0.75rem] font-black uppercase tracking-[0.15rem] hover:bg-primary-container hover:text-on-primary-container transition-colors active:scale-95 shadow-lg">
                            Bắt đầu Live Chat
                        </button>
                        <button onClick={() => window.location.href = 'mailto:support@vibe-studio.vn'} className="w-full border border-white/30 text-white py-4 text-[0.75rem] font-black uppercase tracking-[0.15rem] hover:bg-white/10 transition-colors active:scale-95">
                            Gửi Email
                        </button>
                    </div>
                </div>
            </section>

            {/* Documentation Bento Grid */}
            <section className="mb-20">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Tài liệu hướng dẫn</h3>
                        <div className="h-1 w-12 bg-primary mt-2"></div>
                    </div>
                    <button className="text-[0.7rem] font-bold uppercase tracking-widest text-primary border-b border-primary/30 pb-1 hover:border-primary transition-colors">Xem tất cả tài liệu</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Box lớn nổi bật */}
                    <div className="md:col-span-2 md:row-span-2 bg-surface-container-highest group cursor-pointer relative overflow-hidden min-h-[400px] vibe-shadow">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C1C]/90 via-[#1A1C1C]/20 to-transparent z-10"></div>
                        <img 
                            alt="Docs Cover" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoycoLnidj1wDtgxNL6wxqLZC1p9Yp7h794ohZzVzuiBDr68unVnaYJR8zxhTgkd6-ngSPipyidq49-ki8_ZvJlp50rUFKv6oJfP3Lpaf8tlNNAePrrG9vL8OSAvPlViEkV-p9qxN_WGxa17w62qWa5p9-cQBSRTUTqLU6VHc2FuLvn4aHsJ36kd6yITyXKns-am6fqgJig1NSq5HbHfE6ei3KjlgKKuN1y9k4oDv1JxuPRH45XLYDd79COUYo9sVsaBlAAu43Th39"
                        />
                        <div className="absolute bottom-0 left-0 p-8 z-20">
                            <span className="text-[0.6rem] font-bold uppercase tracking-[0.2rem] text-primary-container mb-2 block drop-shadow-md">Bắt đầu</span>
                            <h4 className="text-2xl font-bold text-white uppercase tracking-tight leading-tight">Hướng dẫn Quản lý<br/>Bộ sưu tập Mới</h4>
                            <p className="text-white/80 text-xs mt-4 max-w-xs font-medium">Tìm hiểu cách tối ưu hóa hình ảnh và mô tả sản phẩm theo chuẩn Vibe.</p>
                        </div>
                    </div>

                    {/* Các Box nhỏ */}
                    {[
                        { icon: 'analytics', title: 'Báo cáo & Phân tích', desc: 'Cách đọc dữ liệu tăng trưởng.' },
                        { icon: 'payments', title: 'Cổng Thanh toán', desc: 'Cấu hình ví và đối soát.' },
                        { icon: 'local_shipping', title: 'Vận chuyển Nội đô', desc: 'Tích hợp đơn vị vận chuyển.' },
                        { icon: 'security', title: 'Bảo mật Admin', desc: 'Thiết lập 2FA và phân quyền.' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-surface-container-low p-8 flex flex-col justify-between hover:bg-surface-container transition-colors cursor-pointer border-l-4 border-transparent hover:border-primary vibe-shadow">
                            <span className="material-symbols-outlined text-primary mb-4 text-3xl">{item.icon}</span>
                            <div>
                                <h5 className="font-bold uppercase text-[0.8rem] tracking-wider mb-2">{item.title}</h5>
                                <p className="text-on-surface-variant text-[0.7rem]">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section: Editorial Style */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-4 sticky top-28">
                    <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Câu hỏi<br/>thường gặp</h3>
                    <p className="mt-6 text-on-surface-variant text-sm leading-relaxed">
                        Tìm câu trả lời nhanh chóng cho các vấn đề thường gặp nhất trong quá trình vận hành hệ thống Vibe Studio.
                    </p>
                    <div className="mt-8 space-y-3">
                        {['Quản lý Đơn hàng', 'Sản phẩm & Tồn kho', 'Tài chính & Thuế'].map((cat, i) => (
                            <div key={i} className="flex items-center gap-2 group cursor-pointer">
                                <div className={`h-[1px] transition-all ${i === 1 ? 'w-8 bg-primary' : 'w-4 bg-outline-variant group-hover:w-8 group-hover:bg-primary'}`}></div>
                                <span className={`text-[0.65rem] uppercase tracking-widest font-bold transition-colors ${i === 1 ? 'text-primary' : 'text-secondary group-hover:text-primary'}`}>{cat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-4">
                    {faqs.map((faq) => (
                        <div 
                            key={faq.id} 
                            onClick={() => toggleFaq(faq.id)}
                            className={`border-b border-outline-variant/20 pb-6 pt-4 cursor-pointer transition-colors hover:bg-surface-container-lowest px-4 -mx-4 ${openFaqId === faq.id ? 'bg-surface-container-lowest' : ''}`}
                        >
                            <h4 className={`text-sm md:text-base font-bold uppercase tracking-tight flex justify-between items-center transition-colors ${openFaqId === faq.id ? 'text-primary' : 'text-on-surface'}`}>
                                {faq.q}
                                <span className={`material-symbols-outlined transition-transform duration-300 ${openFaqId === faq.id ? 'rotate-45 text-primary' : 'text-outline-variant'}`}>
                                    add
                                </span>
                            </h4>
                            <div className={`grid transition-all duration-300 ease-in-out ${openFaqId === faq.id ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                                <p className="text-on-surface-variant text-sm leading-relaxed overflow-hidden font-medium">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer Section (Status/Info) */}
            <footer className="mt-20 bg-surface-container-low border-t border-outline-variant/10 py-12 px-8 vibe-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <h5 className="text-[0.7rem] uppercase tracking-[0.2rem] font-bold text-primary mb-2">Vibe Studio Core</h5>
                        <p className="text-[0.65rem] text-on-surface-variant font-medium">Phiên bản 2.4.0 (Build 2026.4) • Máy chủ: Asia-East (SG)</p>
                    </div>
                    <div className="flex gap-12">
                        <div>
                            <p className="text-[0.6rem] uppercase tracking-widest text-secondary font-bold mb-2">Liên hệ Kỹ thuật</p>
                            <p className="text-[0.7rem] font-bold">support@vibe-studio.vn</p>
                        </div>
                        <div>
                            <p className="text-[0.6rem] uppercase tracking-widest text-secondary font-bold mb-2">Hotline Ưu Tiên</p>
                            <p className="text-[0.7rem] font-bold">1900 88 99 XX</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}