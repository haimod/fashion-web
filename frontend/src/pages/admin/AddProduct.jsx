import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify'; 

export default function AddProduct() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    // 1. Khai báo State chuẩn chỉnh (Không bị lặp)
    const [formData, setFormData] = useState({
        ma_sp: '', 
        ten_sp: '', 
        ma_dm: 'DM_AOKHOAC', 
        gia_ban: '', 
        so_luong: '', 
        mo_ta: ''
    });
    const [imageFile, setImageFile] = useState(null); 

    // 2. Các hàm xử lý thay đổi Input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    // 3. Hàm Submit xịn sò dùng FormData để gửi File
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Đóng gói dữ liệu thành "Kiện hàng" FormData
        const submitData = new FormData();
        submitData.append('ma_sp', formData.ma_sp);
        submitData.append('ten_sp', formData.ten_sp);
        submitData.append('ma_dm', formData.ma_dm);
        submitData.append('gia_ban', formData.gia_ban);
        submitData.append('so_luong', formData.so_luong);
        submitData.append('mo_ta', formData.mo_ta);
        
        // Nhét file ảnh vào kiện hàng (nếu có chọn)
        if (imageFile) {
            submitData.append('hinh_anh', imageFile);
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/products', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                    // LƯU Ý: Tuyệt đối không dùng 'Content-Type': 'application/json' ở đây
                },
                body: submitData 
            });

            if (response.ok) {
                toast.success('Thêm sản phẩm và tải ảnh thành công!'); 
                navigate('/admin/products'); 
            } else {
                const errorData = await response.json();
                toast.error('Lỗi: ' + (errorData.message || 'Kiểm tra lại dữ liệu'));
            }
        } catch (error) {
            toast.error('Lỗi kết nối đến Server!');
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Giao diện Form
    return (
        <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-10">
                <Link to="/admin/products" className="p-2 border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight uppercase">Thêm Sản Phẩm Mới</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-10 vibe-shadow grid grid-cols-2 gap-8">
                {/* Cột trái */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Mã SP (SKU)</label>
                        <input required name="ma_sp" onChange={handleChange} placeholder="VD: VS-JK-001" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Tên Sản Phẩm</label>
                        <input required name="ten_sp" onChange={handleChange} placeholder="VD: Áo Da Biker Moto" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Danh Mục</label>
                        <select required name="ma_dm" onChange={handleChange} className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm">
                            <option value="DM_AOKHOAC">Áo Khoác</option>
                            <option value="DM_QUAN">Quần Urban</option>
                        </select>
                    </div>
                </div>

                {/* Cột phải */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Giá Bán (VNĐ)</label>
                        <input required type="number" name="gia_ban" onChange={handleChange} placeholder="VD: 1500000" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Số lượng tồn kho</label>
                        <input required type="number" name="so_luong" onChange={handleChange} placeholder="VD: 50" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Ảnh Sản Phẩm</label>
                        {/* Đã thêm lại Input chọn File chuẩn Tailwind */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none font-medium text-sm file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-surface-container-high file:text-on-surface hover:file:bg-outline-variant transition-all cursor-pointer" 
                        />
                    </div>
                </div>

                {/* Nút Submit full width */}
                <div className="col-span-2 mt-4 flex flex-col gap-2">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Mô tả ngắn</label>
                    <textarea name="mo_ta" onChange={handleChange} rows="2" placeholder="Chất liệu, form dáng..." className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm resize-none"></textarea>
                    
                    <button type="submit" disabled={isLoading} className="w-full mt-6 py-4 bg-primary text-on-primary font-bold uppercase tracking-[0.2rem] text-[0.75rem] hover:bg-primary-container hover:text-on-primary-container transition-all">
                        {isLoading ? 'ĐANG TẢI ẢNH VÀ LƯU...' : 'LƯU SẢN PHẨM VÀO KHO'}
                    </button>
                </div>
            </form>
        </div>
    );
}