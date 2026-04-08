import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function EditProduct() {
    const { id } = useParams(); // Lấy mã SP từ URL
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    
    const [formData, setFormData] = useState({
        ma_sp: '', ten_sp: '', ma_dm: '', gia_ban: '', so_luong: '', mo_ta: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [currentImage, setCurrentImage] = useState(null); // Lưu ảnh cũ để hiển thị

    // 1. Kéo dữ liệu cũ về điền vào Form
    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        ma_sp: data.ma_sp,
                        ten_sp: data.ten_sp,
                        ma_dm: data.ma_dm,
                        gia_ban: data.gia_ban,
                        so_luong: data.so_luong,
                        mo_ta: data.mo_ta || ''
                    });
                    setCurrentImage(data.hinh_anh);
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

    // 2. Xử lý Input
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleImageChange = (e) => setImageFile(e.target.files[0]);

    // 3. Gửi dữ liệu cập nhật lên Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const submitData = new FormData();
        submitData.append('ten_sp', formData.ten_sp);
        submitData.append('ma_dm', formData.ma_dm);
        submitData.append('gia_ban', formData.gia_ban);
        submitData.append('so_luong', formData.so_luong);
        submitData.append('mo_ta', formData.mo_ta);
        
        // Nếu chọn ảnh mới thì mới gửi đi đè lên ảnh cũ
        if (imageFile) {
            submitData.append('hinh_anh', imageFile);
        }

        try {
            // Lưu ý: Dùng POST thay vì PUT vì Laravel xử lý file upload qua PUT rất kén
            const response = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: submitData 
            });

            if (response.ok) {
                toast.success('Cập nhật sản phẩm thành công!'); 
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

    if (isFetching) return <div className="p-10 font-bold text-outline">Đang tải thông tin sản phẩm...</div>;

    return (
        <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-10">
                <Link to="/admin/products" className="p-2 border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight uppercase">Cập Nhật Sản Phẩm</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-10 vibe-shadow grid grid-cols-2 gap-8 relative overflow-hidden">
                {/* Hình nền mờ của ảnh cũ (Trang trí cho Vibe) */}
                {currentImage && (
                    <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
                        <img src={`http://127.0.0.1:8000/storage/${currentImage}`} className="w-full h-full object-cover blur-sm" alt="bg" />
                    </div>
                )}

                {/* Cột trái */}
                <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Mã SP (SKU - Không thể sửa)</label>
                        <input value={formData.ma_sp} readOnly className="bg-surface-container-low border-b border-outline-variant/50 py-3 focus:outline-none font-medium text-sm text-outline-variant cursor-not-allowed" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Tên Sản Phẩm</label>
                        <input required name="ten_sp" value={formData.ten_sp} onChange={handleChange} className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Danh Mục</label>
                        <select required name="ma_dm" value={formData.ma_dm} onChange={handleChange} className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm">
                            <option value="DM_AOKHOAC">Áo Khoác</option>
                            <option value="DM_QUAN">Quần Urban</option>
                            <option value="DM_AOTHUN">Áo Thun</option>
                            <option value="DM_PHUKIEN">Phụ Kiện</option>
                        </select>
                    </div>
                </div>

                {/* Cột phải */}
                <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Giá Bán (VNĐ)</label>
                        <input required type="number" name="gia_ban" value={formData.gia_ban} onChange={handleChange} className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Số lượng tồn kho</label>
                        <input required type="number" name="so_luong" value={formData.so_luong} onChange={handleChange} className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Ảnh Mới (Bỏ trống nếu giữ nguyên ảnh cũ)</label>
                        <input 
                            type="file" accept="image/*" onChange={handleImageChange} 
                            className="bg-transparent border-b border-outline-variant/50 py-2 focus:border-primary outline-none font-medium text-sm file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-surface-container-high file:text-on-surface hover:file:bg-outline-variant transition-all cursor-pointer" 
                        />
                    </div>
                </div>

                <div className="col-span-2 mt-4 flex flex-col gap-2 relative z-10">
                    <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Mô tả ngắn</label>
                    <textarea name="mo_ta" value={formData.mo_ta} onChange={handleChange} rows="2" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm resize-none"></textarea>
                    
                    <button type="submit" disabled={isLoading} className="w-full mt-6 py-4 bg-primary text-on-primary font-bold uppercase tracking-[0.2rem] text-[0.75rem] hover:bg-primary-container hover:text-on-primary-container transition-all">
                        {isLoading ? 'ĐANG LƯU CẬP NHẬT...' : 'CẬP NHẬT SẢN PHẨM'}
                    </button>
                </div>
            </form>
        </div>
    );
}