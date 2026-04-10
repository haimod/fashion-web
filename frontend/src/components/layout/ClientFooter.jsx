import React from 'react';
import { Link } from 'react-router-dom';

export default function ClientFooter() {
    return (
        <footer className="w-full bg-[#F9F9F9] dark:bg-[#1A1C1C] border-t border-[#5F5E5E]/15 mt-20">
            <div className="w-full px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto font-['Be_Vietnam_Pro']">
                <div className="md:col-span-1">
                    <div className="text-xl font-black tracking-widest text-[#1A1C1C] dark:text-[#F9F9F9] uppercase mb-4">Vibe Studio</div>
                    <p className="text-[#5F5E5E] dark:text-[#50453B] text-[13px] leading-relaxed">
                        Vietnamese Heritage x Urban Edge. Chúng tôi định nghĩa lại thời trang đương đại thông qua lăng kính văn hóa Việt.
                    </p>
                </div>
                <div>
                    <h4 className="text-[#7C572D] dark:text-[#D4A574] text-[11px] uppercase tracking-[0.15rem] font-bold mb-6">Liên kết</h4>
                    <ul className="flex flex-col gap-4">
                        <li><Link className="text-[#5F5E5E] dark:text-[#50453B] text-[13px] hover:text-[#1A1C1C] transition-all" to="/about">Về chúng tôi</Link></li>
                        <li><Link className="text-[#5F5E5E] dark:text-[#50453B] text-[13px] hover:text-[#1A1C1C] transition-all" to="/support">Hỗ trợ khách hàng</Link></li>
                        <li><Link className="text-[#5F5E5E] dark:text-[#50453B] text-[13px] hover:text-[#1A1C1C] transition-all" to="/contact">Liên hệ</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-[#7C572D] dark:text-[#D4A574] text-[11px] uppercase tracking-[0.15rem] font-bold mb-6">Theo dõi</h4>
                    <div className="flex gap-4">
                        {['public', 'camera', 'play_circle'].map(icon => (
                            <span key={icon} className="material-symbols-outlined text-[#5F5E5E] cursor-pointer hover:text-[#7C572D] transition-colors">{icon}</span>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-[#7C572D] dark:text-[#D4A574] text-[11px] uppercase tracking-[0.15rem] font-bold mb-6">Newsletter</h4>
                    <div className="flex border-b border-[#5F5E5E]/30 pb-2">
                        <input className="bg-transparent border-none focus:ring-0 text-[13px] w-full placeholder:text-[#5F5E5E]/50" placeholder="Email của bạn" type="email"/>
                        <button className="material-symbols-outlined text-[#7C572D]">arrow_right_alt</button>
                    </div>
                </div>
            </div>
            <div className="px-8 py-8 max-w-7xl mx-auto border-t border-[#5F5E5E]/10 flex justify-between items-center text-[11px] uppercase tracking-widest text-[#5F5E5E]/60">
                <span>© 2026 Vibe Studio. Vietnamese Heritage x Urban Edge.</span>
                <div className="flex gap-8">
                    <span className="cursor-pointer hover:text-primary">VN</span>
                    <span className="cursor-pointer hover:text-primary">EN</span>
                </div>
            </div>
        </footer>
    );
}