import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    
    // State Modal Thông tin
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileForm, setProfileForm] = useState({ tenkh: '', sodt: '', matkhau: '' });

    // State Modal Địa Chỉ
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        ten_nguoi_nhan: '', sdt_nguoi_nhan: '', dia_chi_ct: '', thanh_pho: '', quan_huyen: '', mac_dinh: false
    });

    // State Modal Xác Nhận Xóa
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, idToDelete: null });

    const navigate = useNavigate();

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        try {
            const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
            const [profileRes, addressRes] = await Promise.all([
                fetch(`${API_BASE}/client/profile`, { headers }),
                fetch(`${API_BASE}/client/addresses`, { headers })
            ]);

            if (profileRes.ok) {
                const userData = await profileRes.json();
                setUser(userData);
                setProfileForm({ tenkh: userData.tenkh, sodt: userData.sodt, matkhau: '' });
            } else { localStorage.removeItem('token'); navigate('/login'); }

            if (addressRes.ok) setAddresses(await addressRes.json());

        } catch (error) { console.error("Lỗi:", error); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

    // Lấy chữ cái đầu của tên cuối cùng làm Avatar
    const getInitial = (fullName) => {
        if (!fullName) return 'V';
        const parts = fullName.trim().split(' ');
        return parts[parts.length - 1].charAt(0).toUpperCase();
    };

    // --- LOGIC XỬ LÝ PROFILE ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/client/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(profileForm)
            });
            if (res.ok) {
                toast.success('Cập nhật hồ sơ thành công!', { position: 'bottom-right' });
                setIsProfileModalOpen(false);
                fetchData();
            } else toast.error('Có lỗi xảy ra!');
        } catch (error) { toast.error('Lỗi kết nối!'); }
    };

    // --- LOGIC XỬ LÝ ĐỊA CHỈ ---
    const openAddAddress = () => {
        setEditingAddressId(null);
        setAddressForm({ ten_nguoi_nhan: '', sdt_nguoi_nhan: '', dia_chi_ct: '', thanh_pho: '', quan_huyen: '', mac_dinh: false });
        setIsAddressModalOpen(true);
    };

    const openEditAddress = (addr) => {
        setEditingAddressId(addr.ma_dc);
        setAddressForm({
            ten_nguoi_nhan: addr.ten_nguoi_nhan, sdt_nguoi_nhan: addr.sdt_nguoi_nhan,
            dia_chi_ct: addr.dia_chi_ct, thanh_pho: addr.thanh_pho, quan_huyen: addr.quan_huyen,
            mac_dinh: addr.mac_dinh === 1
        });
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = editingAddressId 
            ? `${API_BASE}/client/addresses/${editingAddressId}` 
            : `${API_BASE}/client/addresses`;
        const method = editingAddressId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(addressForm)
            });
            if (res.ok) {
                toast.success(editingAddressId ? 'Cập nhật địa chỉ thành công!' : 'Đã thêm địa chỉ mới!', { position: 'bottom-right' });
                setIsAddressModalOpen(false);
                fetchData();
            } else toast.error('Có lỗi xảy ra!');
        } catch (error) { toast.error('Lỗi kết nối!'); }
    };

    const confirmDeleteAddress = (id) => {
        setConfirmModal({ isOpen: true, idToDelete: id });
    };

    const executeDeleteAddress = async () => {
        const id = confirmModal.idToDelete;
        if (!id) return;
        
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/client/addresses/${id}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) { 
                toast.success('Đã xóa địa chỉ thành công!', { position: 'bottom-right' }); 
                fetchData(); 
            }
        } catch (error) { 
            toast.error('Lỗi kết nối!'); 
        } finally {
            setConfirmModal({ isOpen: false, idToDelete: null });
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#7c572d] border-t-transparent rounded-full animate-spin"></div></div>;
    if (!user) return null;

    return (
        <div className="bg-[#f4fafd] text-[#161d1f] font-['Be_Vietnam_Pro'] antialiased animate-fade-in selection:bg-[#fecb97]">
            <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto min-h-screen relative">
                
                <header className="mb-20">
                    <p className="text-[0.75rem] uppercase tracking-[0.2em] text-[#7c572d] mb-4 font-medium">Tài khoản thành viên</p>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#161d1f] leading-none">
                        {user.tenkh}<span className="text-[#7c572d]">.</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-32">
                        <div className="space-y-4">
                            <h3 className="text-[0.75rem] uppercase tracking-[0.15em] text-[#827569] font-bold">Quản lý</h3>
                            <nav className="flex flex-col space-y-2">
                                <Link to="/profile" className="text-[#161d1f] font-semibold flex items-center gap-3 py-2 border-l-2 border-[#7c572d] pl-4">Hồ sơ cá nhân</Link>
                                <Link to="/orders" className="text-[#586062] hover:text-[#161d1f] transition-colors flex items-center gap-3 py-2 pl-4">Lịch sử đơn hàng</Link>
                                <Link to="/sale" className="text-[#586062] hover:text-[#161d1f] transition-colors flex items-center gap-3 py-2 pl-4">Mã giảm giá</Link>
                            </nav>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[0.75rem] uppercase tracking-[0.15em] text-[#827569] font-bold">Thiết lập</h3>
                            <nav className="flex flex-col space-y-2">
                                <button onClick={handleLogout} className="text-[#ba1a1a] font-medium hover:opacity-70 transition-all flex items-center gap-3 py-2 pl-4 text-left w-full">Đăng xuất</button>
                            </nav>
                        </div>
                    </aside>

                    <div className="lg:col-span-9 space-y-16">
                        
                        {/* 1. THÔNG TIN CÁ NHÂN */}
                        <section>
                            <div className="flex items-end justify-between mb-8">
                                <h2 className="text-3xl font-bold tracking-tight text-[#161d1f]">Thông tin cá nhân</h2>
                                <button onClick={() => setIsProfileModalOpen(true)} className="text-[0.75rem] uppercase tracking-[0.1em] text-[#7c572d] font-bold hover:underline">Chỉnh sửa</button>
                            </div>
                            <div className="bg-[#eef5f7] p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
                                <div className="relative group">
                                    <div className="w-40 h-52 bg-[#dde4e6] overflow-hidden flex items-center justify-center">
                                        <div className="text-6xl font-['Be_Vietnam_Pro'] font-light text-[#827569]">
                                            {getInitial(user.tenkh)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                    <div className="space-y-1">
                                        <p className="text-[0.7rem] uppercase tracking-widest text-[#827569]">Họ và tên</p>
                                        <p className="text-xl font-medium text-[#161d1f]">{user.tenkh}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[0.7rem] uppercase tracking-widest text-[#827569]">Email</p>
                                        <p className="text-xl font-medium text-[#161d1f] truncate">{user.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[0.7rem] uppercase tracking-widest text-[#827569]">Số điện thoại</p>
                                        <p className="text-xl font-medium text-[#161d1f]">{user.sodt || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. SỔ ĐỊA CHỈ */}
                        <section>
                            <div className="flex items-end justify-between mb-8">
                                <h2 className="text-3xl font-bold tracking-tight text-[#161d1f]">Sổ địa chỉ</h2>
                                <button onClick={openAddAddress} className="flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.1em] text-[#7c572d] font-bold hover:underline">
                                    <span className="material-symbols-outlined text-sm">add</span> Thêm địa chỉ mới
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {addresses.length > 0 ? (
                                    addresses.map((addr) => (
                                        <div key={addr.ma_dc} className={`bg-white p-8 shadow-sm relative group ${addr.mac_dinh === 1 ? 'border-l-4 border-[#7c572d]' : 'border-l border-[#d4c4b7] hover:bg-[#e8eff1] transition-colors'}`}>
                                            <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditAddress(addr)} className="material-symbols-outlined text-[#827569] hover:text-[#7c572d]">edit</button>
                                                <button onClick={() => confirmDeleteAddress(addr.ma_dc)} className="material-symbols-outlined text-[#827569] hover:text-[#ba1a1a]">delete</button>
                                            </div>
                                            {addr.mac_dinh === 1 && (
                                                <div className="mb-6 flex items-center gap-3">
                                                    <span className="bg-[#7c572d] text-white text-[0.65rem] px-3 py-1 uppercase tracking-widest font-bold">Mặc định</span>
                                                </div>
                                            )}
                                            <p className="font-bold text-lg mb-2">{addr.ten_nguoi_nhan}</p>
                                            <p className="text-[#586062] leading-relaxed mb-4 text-sm">{addr.dia_chi_ct}, {addr.quan_huyen}, {addr.thanh_pho}</p>
                                            <p className="text-sm font-medium text-[#161d1f]">{addr.sdt_nguoi_nhan}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-10 border-2 border-dashed border-[#827569]/30 text-[#586062] text-sm">Bạn chưa có địa chỉ giao hàng nào.</div>
                                )}
                            </div>
                        </section>

                        {/* 3. EDITORIAL INSPIRATION */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 bg-[#161d1f] text-[#f4fafd] p-12 flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c572d]/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-1000 group-hover:scale-150"></div>
                                <div className="relative z-10">
                                    <p className="text-[0.7rem] uppercase tracking-widest text-[#ffdcbc] mb-4">The Vibe Community</p>
                                    <h3 className="text-4xl font-bold tracking-tighter mb-4 italic">Bản Sắc Độc Bản</h3>
                                    <p className="text-[#d4c4b7] text-sm max-w-md leading-relaxed">
                                        Cảm ơn bạn đã trở thành một phần của Vibe Studio. Cùng chúng tôi khám phá kho lưu trữ thời trang và định hình phong cách cá nhân qua những thiết kế vượt thời gian.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 relative z-10 mt-8">
                                    <div className="w-12 h-[1px] bg-[#7c572d]"></div>
                                    <span className="text-[0.7rem] uppercase tracking-widest text-[#827569] font-bold">Quiet Luxury Aesthetic</span>
                                </div>
                            </div>
                            
                            <div className="bg-[#7c572d] p-12 flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[#161d1f]/0 group-hover:bg-[#161d1f]/10 transition-colors duration-500"></div>
                                <span className="material-symbols-outlined text-5xl text-white font-light group-hover:-translate-y-1 transition-transform">auto_stories</span>
                                <div className="relative z-10">
                                    <p className="text-2xl font-bold text-white tracking-tight uppercase">Lookbook</p>
                                    <p className="text-[0.7rem] uppercase tracking-widest text-white/80 mt-2">Cảm hứng thời trang</p>
                                </div>
                                <button onClick={() => navigate('/shop')} className="relative z-10 bg-transparent border border-white text-white text-[0.65rem] px-8 py-3 uppercase tracking-widest font-bold hover:bg-white hover:text-[#7c572d] transition-colors">
                                    Khám Phá
                                </button>
                            </div>
                        </section>

                    </div>
                </div>

                {/* --- MODAL SỬA THÔNG TIN CÁ NHÂN --- */}
                {isProfileModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#161d1f]/60 backdrop-blur-sm p-4">
                        <form onSubmit={handleUpdateProfile} className="bg-white p-8 md:p-12 w-full max-w-lg shadow-2xl animate-fade-in-up">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-[#161d1f] border-b border-[#827569]/20 pb-4 mb-6">Chỉnh sửa hồ sơ</h2>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-[#827569] uppercase tracking-widest mb-2">Họ và Tên</label>
                                <input required type="text" value={profileForm.tenkh} onChange={e => setProfileForm({...profileForm, tenkh: e.target.value})} className="w-full bg-[#f4fafd] border border-[#827569]/30 px-4 py-3 focus:outline-none focus:border-[#7c572d]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-[#827569] uppercase tracking-widest mb-2">Số điện thoại</label>
                                <input required type="text" value={profileForm.sodt || ''} onChange={e => setProfileForm({...profileForm, sodt: e.target.value})} className="w-full bg-[#f4fafd] border border-[#827569]/30 px-4 py-3 focus:outline-none focus:border-[#7c572d]" />
                            </div>
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-[#827569] uppercase tracking-widest mb-2">Mật khẩu mới (Để trống nếu không đổi)</label>
                                <input type="password" value={profileForm.matkhau} onChange={e => setProfileForm({...profileForm, matkhau: e.target.value})} className="w-full bg-[#f4fafd] border border-[#827569]/30 px-4 py-3 focus:outline-none focus:border-[#7c572d]" placeholder="Nhập mật khẩu mới..." />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#586062] hover:bg-[#e8eff1] transition-colors">Hủy</button>
                                <button type="submit" className="bg-[#7c572d] text-white px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#161d1f] transition-colors">LƯU HỒ SƠ</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* --- MODAL THÊM/SỬA ĐỊA CHỈ --- */}
                {isAddressModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#161d1f]/60 backdrop-blur-sm p-4">
                        <form onSubmit={handleSaveAddress} className="bg-white p-8 md:p-12 w-full max-w-2xl shadow-2xl animate-fade-in-up">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-[#161d1f] border-b border-[#827569]/20 pb-4 mb-6">
                                {editingAddressId ? 'Sửa địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng'}
                            </h2>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-[#827569] uppercase tracking-widest mb-2">Người nhận</label>
                                    <input required type="text" value={addressForm.ten_nguoi_nhan} onChange={e => setAddressForm({...addressForm, ten_nguoi_nhan: e.target.value})} className="w-full bg-[#f4fafd] border border-[#827569]/30 px-4 py-3 focus:outline-none focus:border-[#7c572d]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#827569] uppercase tracking-widest mb-2">Số điện thoại</label>
                                    <input required type="text" value={addressForm.sdt_nguoi_nhan} onChange={e => setAddressForm({...addressForm, sdt_nguoi_nhan: e.target.value})} className="w-full bg-[#f4fafd] border border-[#827569]/30 px-4 py-3 focus:outline-none focus:border-[#7c572d]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-[#827569] uppercase tracking-widest mb-2">Tỉnh / Thành phố</label>
                                    <input required type="text" value={addressForm.thanh_pho} onChange={e => setAddressForm({...addressForm, thanh_pho: e.target.value})} className="w-full bg-[#f4fafd] border border-[#827569]/30 px-4 py-3 focus:outline-none focus:border-[#7c572d]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#827569] uppercase tracking-widest mb-2">Quận / Huyện</label>
                                    <input required type="text" value={addressForm.quan_huyen} onChange={e => setAddressForm({...addressForm, quan_huyen: e.target.value})} className="w-full bg-[#f4fafd] border border-[#827569]/30 px-4 py-3 focus:outline-none focus:border-[#7c572d]" />
                                </div>
                            </div>
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-[#827569] uppercase tracking-widest mb-2">Địa chỉ cụ thể</label>
                                <textarea required rows="2" value={addressForm.dia_chi_ct} onChange={e => setAddressForm({...addressForm, dia_chi_ct: e.target.value})} className="w-full bg-[#f4fafd] border border-[#827569]/30 px-4 py-3 focus:outline-none focus:border-[#7c572d]" />
                            </div>
                            <div className="flex items-center gap-3 mb-8">
                                <input type="checkbox" id="mac_dinh" checked={addressForm.mac_dinh} onChange={e => setAddressForm({...addressForm, mac_dinh: e.target.checked})} className="w-5 h-5 accent-[#7c572d]" />
                                <label htmlFor="mac_dinh" className="text-sm font-bold cursor-pointer">Đặt làm địa chỉ mặc định</label>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#586062] hover:bg-[#e8eff1] transition-colors">Hủy</button>
                                <button type="submit" className="bg-[#7c572d] text-white px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#161d1f] transition-colors">LƯU ĐỊA CHỈ</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* --- MODAL CONFIRM XÓA ĐỊA CHỈ --- */}
                {confirmModal.isOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#161d1f]/60 backdrop-blur-sm p-4">
                        <div className="bg-white p-8 max-w-sm w-full shadow-2xl flex flex-col gap-6 border-t-4 border-[#ba1a1a] animate-fade-in-up">
                            <h3 className="text-lg font-black uppercase tracking-widest text-[#ba1a1a] mb-2">Cảnh báo xóa</h3>
                            <p className="text-[0.8rem] font-medium text-[#586062] leading-relaxed">
                                Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex justify-end gap-4 mt-2">
                                <button onClick={() => setConfirmModal({ isOpen: false, idToDelete: null })} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] text-[#827569] hover:bg-[#e8eff1] transition-colors">Hủy</button>
                                <button onClick={executeDeleteAddress} className="px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2rem] bg-[#ba1a1a] text-white hover:bg-[#93000a] transition-colors">Xóa Ngay</button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}