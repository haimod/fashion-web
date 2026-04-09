import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function EditProduct() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [categories, setCategories] = useState([]);

    // State cho Vỏ sản phẩm
    const [baseInfo, setBaseInfo] = useState({ ma_sp: '', ten_sp: '', ma_dm: '', mo_ta: '' });
    const [imageFile, setImageFile] = useState(null);
    const [currentImage, setCurrentImage] = useState(null); 

    // State cho Ruột sản phẩm (Mảng các biến thể)
    const [variants, setVariants] = useState([]);

    // 1. Kéo danh mục từ DB
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/admin/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => toast.error('Lỗi tải danh mục!'));
    }, []);

    // 2. Kéo dữ liệu Sản phẩm & Biến thể cũ về điền vào Form
    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    // Set Vỏ
                    setBaseInfo({
                        ma_sp: data.ma_sp,
                        ten_sp: data.ten_sp,
                        ma_dm: data.ma_dm,
                        mo_ta: data.mo_ta || ''
                    });
                    setCurrentImage(data.hinh_anh);
                    
                    // Set Ruột (Variants) từ DB
                    if (data.variants && data.variants.length > 0) {
                        setVariants(data.variants);
                    } else {
                        setVariants([{ kich_thuoc: '', mau_sac: '', gia_ban: 0, so_luong_ton: 0 }]);
                    }
                } else {
                    toast.error('Không tìm thấy sản phẩm!');
                    navigate('/admin/products');
                }
            } catch (error) {
                toast.error('Lỗi kết nối server!');
            } finally {
                setIsFetching(false);
            }
        };
        fetchProductData();
    }, [id, navigate]);

    // --- LOGIC XỬ LÝ BIẾN THỂ ---
    const handleAddVariantRow = () => {
        setVariants([...variants, { kich_thuoc: '', mau_sac: '', gia_ban: 0, so_luong_ton: 0 }]);
    };

    const handleRemoveVariantRow = (index) => {
        if(variants.length === 1) { toast.warning('Phải có ít nhất 1 biến thể!'); return; }
        const newVariants = variants.filter((_, i) => i !== index);
        setVariants(newVariants);
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    // --- XỬ LÝ GỬI API ---
   // --- XỬ LÝ GỬI API ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(!baseInfo.ten_sp || !baseInfo.ma_dm) { toast.warning('Vui lòng điền tên và danh mục!'); return; }
        const invalidVariant = variants.find(v => !v.kich_thuoc || !v.mau_sac || v.gia_ban <= 0);
        if(invalidVariant) { toast.warning('Kiểm tra lại: Kích thước, Màu sắc và Giá bán (phải > 0) của biến thể!'); return; }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('ten_sp', baseInfo.ten_sp);
        formData.append('ma_dm', baseInfo.ma_dm);
        formData.append('mo_ta', baseInfo.mo_ta);
        
        if (imageFile) {
            formData.append('hinh_anh', imageFile);
        }

        formData.append('variants', JSON.stringify(variants));

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' }, // Bắt buộc trả về JSON
                body: formData 
            });

            if (response.ok) {
                toast.success('Cập nhật sản phẩm thành công!'); 
                navigate('/admin/products'); 
            } else {
                // ĐỌC LỖI THẬT TỪ SERVER
                const errorData = await response.json();
                toast.error('Lỗi Server: ' + (errorData.message || 'Kiểm tra lại dữ liệu!'));
                console.error("Chi tiết lỗi từ Laravel:", errorData);
            }
        } catch (error) {
            toast.error('Lỗi kết nối đến Server!');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <div className="p-10 font-bold text-outline">Đang tải thông tin sản phẩm...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto w-full space-y-8 animate-fade-in-up">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-4">
                <Link to="/admin/products" className="material-symbols-outlined hover:text-primary transition-colors text-3xl">arrow_back</Link>
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase text-on-background">CẬP NHẬT SẢN PHẨM</h2>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-outline mt-1">SKU: {baseInfo.ma_sp}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. THÔNG TIN CHUNG (VỎ) */}
                <div className="bg-surface p-8 vibe-shadow space-y-6 relative overflow-hidden">
                    {currentImage && (
                        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
                            <img src={`http://127.0.0.1:8000/storage/${currentImage}`} className="w-full h-full object-cover blur-sm" alt="bg" />
                        </div>
                    )}
                    
                    <h3 className="font-['Be_Vietnam_Pro'] uppercase tracking-[0.15rem] text-[0.8rem] font-black text-primary border-b border-outline-variant/20 pb-2 relative z-10">1. THÔNG TIN CƠ BẢN</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <div className="md:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Tên Sản Phẩm</label>
                                <input required value={baseInfo.ten_sp} onChange={e => setBaseInfo({...baseInfo, ten_sp: e.target.value})} className="w-full bg-transparent border-b border-outline-variant/50 py-2 text-xl font-bold focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Danh mục</label>
                                <select required value={baseInfo.ma_dm} onChange={e => setBaseInfo({...baseInfo, ma_dm: e.target.value})} className="w-full bg-transparent border-b border-outline-variant/50 py-2 font-bold text-sm focus:border-primary outline-none cursor-pointer">
                                    <option value="" disabled>-- Chọn danh mục --</option>
                                    {categories.map(c => (
                                        // ĐÃ CẬP NHẬT KEY Ở ĐÂY ĐỂ TRÁNH LỖI ĐỎ
                                        <option key={c.ma_dm || c.id} value={c.ma_dm || c.id}>{c.ten_dm || c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Mô tả sản phẩm</label>
                                <textarea value={baseInfo.mo_ta} onChange={e => setBaseInfo({...baseInfo, mo_ta: e.target.value})} rows="4" className="w-full bg-surface-container-lowest border border-outline-variant/30 p-4 text-sm focus:border-primary outline-none custom-scrollbar"></textarea>
                            </div>
                        </div>

                        {/* Upload Ảnh */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline text-center">Ảnh Đại Diện (Bỏ trống giữ nguyên)</label>
                            <div onClick={() => fileInputRef.current.click()} className="flex-1 border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center bg-surface-container-lowest cursor-pointer group relative min-h-[250px]">
                                {imageFile ? (
                                    <img src={URL.createObjectURL(imageFile)} alt="preview" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                                ) : currentImage ? (
                                    <img src={`http://127.0.0.1:8000/storage/${currentImage}`} alt="current" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
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
                                    <th className="px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-outline">Mã BT (Auto)</th>
                                    <th className="px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-outline">Kích thước</th>
                                    <th className="px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-outline">Màu sắc</th>
                                    <th className="px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-outline">Giá bán (VNĐ)</th>
                                    <th className="px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-outline">Tồn kho</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20">
                                {variants.map((v, index) => (
                                    <tr key={index} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="px-4 py-3 text-[0.6rem] font-mono text-outline-variant">
                                            {v.ma_bien_the ? 'Đã lưu' : 'Mới tạo'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <input required type="text" value={v.kich_thuoc} onChange={e => handleVariantChange(index, 'kich_thuoc', e.target.value)} className="w-full bg-transparent border-b border-outline-variant/30 py-1 text-sm font-bold focus:border-primary outline-none" placeholder="S, M..."/>
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
                                            <button type="button" onClick={() => handleRemoveVariantRow(index)} className="material-symbols-outlined text-outline-variant hover:text-error transition-colors mt-2">delete</button>
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
                        {isLoading ? 'ĐANG LƯU...' : 'CẬP NHẬT SẢN PHẨM'}
                    </button>
                </div>
            </form>
        </div>
    );
}