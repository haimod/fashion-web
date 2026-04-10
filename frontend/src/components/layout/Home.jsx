import React, { useState, useEffect } from 'react';

export default function Home() {
    // --- LOGIC ĐẾM NGƯỢC FLASH SALE ---
    const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) seconds--;
                else if (minutes > 0) { seconds = 59; minutes--; }
                else if (hours > 0) { seconds = 59; minutes = 59; hours--; }
                return { hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatNum = (num) => num.toString().padStart(2, '0');

    return (
        <div className="animate-fade-in">
            {/* HERO SECTION */}
            <section className="relative h-[90vh] w-full overflow-hidden flex items-center px-8 md:px-20 bg-surface-container-low">
                <div className="absolute inset-0 z-0">
                    <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVDb1r_JIfBnDQe24YQQom1Tgiqbi3lmxBTykUGM5HamQjeT7zqPg3TrAegA0E5lkqzf3a9687Q44Ffg8y2l0e7GImhrBn4EY45IPHwVThpV_rvH6mudRjQNEy0vcz_j9-Qfh2QNoLBvIsW-Imkb_EWt2F6fHT_YukWmUqjl7qIui4uTBJblTs7VMmA4uAvmK4Il6pnk8593lL7FiFXN-chGxjUztAApBQjA2MPvBgB37vt2aw9lXqWyyR5z3Snk8U_L76X6IC7KSE" alt="hero" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <p className="font-['Be_Vietnam_Pro'] text-[11px] uppercase tracking-[0.4rem] text-primary mb-4">Summer Collection</p>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-on-background uppercase mb-8 leading-[0.9]">
                        Bộ sưu tập<br/>Hè 2025
                    </h1>
                    <button className="bg-primary text-on-primary px-12 py-5 font-bold uppercase tracking-[0.2rem] text-sm hover:bg-black transition-all duration-500 vibe-shadow">
                        Khám phá ngay
                    </button>
                </div>
            </section>

            {/* FLASH SALE */}
            <section className="py-20 px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Flash Sale</h2>
                        <p className="text-on-surface-variant text-sm tracking-widest uppercase font-medium">Ưu đãi giới hạn chỉ trong hôm nay</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        {[{v: timeLeft.hours, l: 'Giờ'}, {v: timeLeft.minutes, l: 'Phút'}, {v: timeLeft.seconds, l: 'Giây'}].map((t, i) => (
                            <div key={i} className="bg-surface-container-highest px-5 py-4 flex flex-col items-center min-w-[80px] vibe-shadow border-b-2 border-primary">
                                <span className="text-3xl font-black leading-none">{formatNum(t.v)}</span>
                                <span className="text-[9px] uppercase tracking-widest text-primary font-bold mt-1">{t.l}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Product Grid (Tạm thời tĩnh - Sau này gọi API Flash Sale) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="group cursor-pointer">
                            <div className="relative aspect-[3/4] overflow-hidden bg-surface-container-low mb-4">
                                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src={`http://googleusercontent.com/profile/picture/${14+i}`} alt="sp" />
                                <div className="absolute top-4 left-4 bg-error text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">SALE</div>
                            </div>
                            <h3 className="text-[12px] uppercase font-bold tracking-widest mb-1 group-hover:text-primary transition-colors">Sản phẩm Vibe Studio #{i}</h3>
                            <div className="flex gap-3 items-center">
                                <span className="text-primary font-black">1.200.000đ</span>
                                <span className="text-on-surface-variant/40 line-through text-[11px]">1.800.000đ</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* BENTO CATEGORIES */}
            <section className="py-20 bg-surface-container-low">
                <div className="max-w-7xl mx-auto px-8">
                    <h2 className="text-4xl font-black tracking-tighter uppercase mb-16 text-center">Danh mục lựa chọn</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 h-[1000px] md:h-[600px]">
                        <div className="col-span-2 row-span-1 relative group overflow-hidden">
                            <img className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2tGs5njCoLg7LQQ2JQB-q9lHFABKI2pFqAym5JQe1pEbnfBEOxOt9m7kTUDH6XpclyeAuYZjKnIPyagyZ5ypR8u_nXAmrDTQikntBIdwoo1X4yFuX8Svd72Fh8yDrbfg3jFnBGT4Fc5MZrKXDO_ojXpqUddewvCVcOUiayxHCxhMRaYr2T6YJsh0uVdsDRLi1Uu8GWhXhJzu6oPPpG195zmOyqTbd4wRRfQN67q68_BO9ArNAVeHHQsyqe3G5MobWyEMR7l5YxCZU" alt="nu" />
                            <div className="absolute bottom-8 left-8"><span className="text-white text-3xl font-black uppercase">Nữ</span></div>
                        </div>
                        <div className="col-span-1 row-span-1 relative group overflow-hidden">
                            <img className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC59AMmEmFhQo9MD9mGcrNp8gQHf-uLaoWHTXKWnzYqPT_Q5Vert0TfEX7jlaRZ4k4FrhEb85W0jO4zpvsEbfbvwq_3c5KtPJAZHh_Ss8yFjC6uDQ-jZdqfpF_2u9Tu3bjq8hoRkH09TBhc8BiICqETs7o27GqZrMg5HswJuL80ev83Bgt9ohE_lKK7NBVunYc6CQeP6dMv4CJTJoq7zup-OPKw04WPA7Fm15vemQEppX9M8uurcnZt0Nu79zYaZiItqAZnkn_DY59r" alt="nam" />
                            <div className="absolute bottom-8 left-8"><span className="text-white text-xl font-black uppercase">Nam</span></div>
                        </div>
                        <div className="col-span-1 row-span-1 bg-primary flex items-center justify-center p-8 text-center text-white cursor-pointer hover:bg-black transition-colors">
                            <div><span className="text-2xl font-black uppercase">Phụ kiện</span><span className="material-symbols-outlined block mt-2">arrow_forward</span></div>
                        </div>
                        {/* Các ô khác tương tự... */}
                    </div>
                </div>
            </section>
        </div>
    );
}