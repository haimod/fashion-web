import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AddProduct() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    // Danh sách Danh mục để chọn
    const [categories, setCategories] = useState([]);
    
    // State cho Vỏ sản phẩm (Không còn ma_sp vì auto gen ở Backend)
    const [baseInfo, setBaseInfo] = useState({ ten_sp: '', ma_dm: '', mo_ta: '' });
    const [imageFile, setImageFile] = useState(null);

    // State cho Ruột sản phẩm (Mảng các biến thể)
    const [variants, setVariants] = useState([
        { kich_thuoc: 'Freesize', mau_sac: 'Mặc định', gia_ban: 0, so_luong_ton: 0 } // Mặc định có sẵn 1 dòng
    ]);

    // Lấy danh mục từ DB
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/admin/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                // Set sẵn danh mục đầu tiên tránh lỗi rỗng
                if(data.length > 0) {
                    setBaseInfo(prev => ({ ...prev, ma_dm: data[0].ma_dm || data[0].id }));
                }
            })
            .catch(err => toast.error('Lỗi lấy danh mục!'));
    }, []);

    // --- LOGIC XỬ LÝ BIẾN THỂ ---
    const handleAddVariantRow = () => {
        setVariants([...variants, { kich_thuoc: '', mau_sac: '', gia_ban: 0, so_luong_ton: 0 }]);
    };

    const handleRemoveVariantRow = (index) => {
        if(variants.length === 1) { toast.warning('Phải có ít nhất 1 phân loại (size/màu)!'); return; }
        const newVariants = variants.filter((_, i) => i !== index);
        setVariants(newVariants);
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    // --- GỬI API ---
    const handleSaveProduct = async (e) => {
        e.preventDefault();
        
        // Validate
        if(!baseInfo.ten_sp || !baseInfo.ma_dm) { toast.warning('Vui lòng điền tên và danh mục!'); return; }
        const invalidVariant = variants.find(v => !v.kich_thuoc || !v.mau_sac || v.gia_ban <= 0);
        if(invalidVariant) { toast.warning('Kiểm tra lại: Kích thước, Màu sắc và Giá bán (phải > 0) của biến thể!'); return; }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('ten_sp', baseInfo.ten_sp);
        formData.append('mo_ta', baseInfo.mo_ta);
        formData.append('ma_dm', baseInfo.ma_dm);
        if (imageFile) formData.append('hinh_anh', imageFile);
        
        // Ép mảng biến thể thành chuỗi JSON
        formData.append('variants', JSON.stringify(variants));

        try {
            const res = await fetch('http://127.0.0.1:8000/api/admin/products', { 
                method: 'POST', 
                headers: { 'Accept': 'application/json' },
                body: formData 
            });
            
            if (res.ok) {
                toast.success('Lên kệ sản phẩm thành công!');
                navigate('/admin/products'); 
            } else {
                const errorData = await res.json();
                toast.error('Lỗi: ' + (errorData.message || 'Kiểm tra lại dữ liệu!'));
            }
        } catch (error) { 
            toast.error('Lỗi kết nối Server!'); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto w-full space-y-8 animate-fade-in-up">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-4">
                <Link to="/admin/products" className="material-symbols-outlined hover:text-primary transition-colors text-3xl">arrow_back</Link>
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase text-on-background">THÊM SẢN PHẨM MỚI</h2>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-outline mt-1">Tạo mới Vỏ & Phân loại</p>
                </div>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-8">
                {/* 1. THÔNG TIN CHUNG (VỎ) */}
                <div className="bg-surface p-8 vibe-shadow space-y-6">
                    <h3 className="font-['Be_Vietnam_Pro'] uppercase tracking-[0.15rem] text-[0.8rem] font-black text-primary border-b border-outline-variant/20 pb-2">1. THÔNG TIN CƠ BẢN</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Tên Sản Phẩm</label>
                                <input required value={baseInfo.ten_sp} onChange={e => setBaseInfo({...baseInfo, ten_sp: e.target.value})} className="w-full bg-transparent border-b border-outline-variant/50 py-2 text-xl font-bold focus:border-primary outline-none" placeholder="VD: Áo Thun Boxy Signature..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Danh mục</label>
                                <select required value={baseInfo.ma_dm} onChange={e => setBaseInfo({...baseInfo, ma_dm: e.target.value})} className="w-full bg-transparent border-b border-outline-variant/50 py-2 font-bold text-sm focus:border-primary outline-none cursor-pointer">
                                    <option value="" disabled>-- Chọn danh mục --</option>
                                    {categories.map(c => (
                                        <option key={c.ma_dm || c.id} value={c.ma_dm || c.id}>{c.ten_dm || c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Mô tả sản phẩm</label>
                                <textarea value={baseInfo.mo_ta} onChange={e => setBaseInfo({...baseInfo, mo_ta: e.target.value})} rows="4" className="w-full bg-surface-container-lowest border border-outline-variant/30 p-4 text-sm focus:border-primary outline-none custom-scrollbar" placeholder="Chất liệu, form dáng, chi tiết nổi bật..."></textarea>
                            </div>
                        </div>

                        {/* Upload Ảnh Chính */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline text-center">Ảnh Đại Diện</label>
                            <div onClick={() => fileInputRef.current.click()} className="flex-1 border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center bg-surface-container-lowest cursor-pointer group relative min-h-[250px]">
                                {imageFile ? (
                                    <img src={URL.createObjectURL(imageFile)} alt="preview" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                                ) : (
                                    <div className="text-center p-4">
                                        <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 group-hover:text-primary transition-colors">add_photo_alternate</span>
                                        <p className="text-[0.6rem] font-bold uppercase tracking-widest text-outline">Click tải ảnh lên</p>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} onChange={e => setImageFile(e.target.files[0])} accept="image/*" className="hidden" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. CẤU HÌNH BIẾN THỂ (RUỘT) */}
                <div className="bg-surface p-8 vibe-shadow space-y-6">
                    <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                        <h3 className="font-['Be_Vietnam_Pro'] uppercase tracking-[0.15rem] text-[0.8rem] font-black text-primary">2. PHÂN LOẠI & GIÁ BÁN (BIẾN THỂ)</h3>
                        <button type="button" onClick={handleAddVariantRow} className="text-primary text-[0.65rem] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-sm">add_circle</span> Thêm size / màu
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface-container-low">
                                    <th className="px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-outline w-1/4">Kích thước (Size)</th>
                                    <th className="px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-outline w-1/4">Màu sắc</th>
                                    <th className="px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-outline w-1/4">Giá bán (VNĐ)</th>
                                    <th className="px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-outline w-1/5">Tồn kho ban đầu</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20">
                                {variants.map((v, index) => (
                                    <tr key={index} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="px-4 py-3">
                                            <input required type="text" value={v.kich_thuoc} onChange={e => handleVariantChange(index, 'kich_thuoc', e.target.value)} className="w-full bg-transparent border-b border-outline-variant/30 py-1 text-sm font-bold focus:border-primary outline-none" placeholder="S, M, Freesize..."/>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input required type="text" value={v.mau_sac} onChange={e => handleVariantChange(index, 'mau_sac', e.target.value)} className="w-full bg-transparent border-b border-outline-variant/30 py-1 text-sm font-bold focus:border-primary outline-none" placeholder="Đen, Trắng..."/>
                                        </td>
                                        <td className="px-4 py-3 relative">
                                            <input required type="number" min="1" value={v.gia_ban} onChange={e => handleVariantChange(index, 'gia_ban', e.target.value)} className="w-full bg-transparent border-b border-outline-variant/30 py-1 text-sm font-bold focus:border-primary outline-none pr-6 text-primary"/>
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">đ</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input required type="number" min="0" value={v.so_luong_ton} onChange={e => handleVariantChange(index, 'so_luong_ton', e.target.value)} className="w-full bg-transparent border-b border-outline-variant/30 py-1 text-sm font-bold focus:border-primary outline-none text-center"/>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button type="button" onClick={() => handleRemoveVariantRow(index)} className="material-symbols-outlined text-outline-variant hover:text-error transition-colors mt-2" title="Xóa phân loại">delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end gap-6 pt-4">
                    <button type="button" onClick={() => navigate('/admin/products')} className="px-8 py-4 text-[0.7rem] font-bold uppercase tracking-[0.2rem] text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors">HỦY BỎ</button>
                    <button type="submit" disabled={isLoading} className="px-10 py-4 bg-primary text-on-primary text-[0.7rem] font-bold uppercase tracking-[0.2rem] hover:bg-primary/90 transition-colors vibe-shadow active:scale-95 disabled:opacity-50">
                        {isLoading ? 'ĐANG LƯU...' : 'LÊN KỆ SẢN PHẨM'}
                    </button>
                </div>
            </form>
        </div>
    );
}