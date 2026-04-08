import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify'; 

export default function AddProduct() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    // 1. Khai báo State
    const [formData, setFormData] = useState({
        ma_sp: '', 
        ten_sp: '', 
        ma_dm: '', // Khởi tạo rỗng, sẽ được set khi gọi API lấy danh mục
        gia_ban: '', 
        so_luong: '', 
        mo_ta: ''
    });
    const [imageFile, setImageFile] = useState(null); 
    const [categories, setCategories] = useState([]); // State lưu danh sách danh mục

    // 2. Kéo danh sách danh mục từ DB khi trang vừa load
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/admin/categories');
                const data = await response.json();
                setCategories(data);
                
                // Nếu có danh mục, tự động set cái đầu tiên làm mặc định để Select không bị lỗi
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, ma_dm: data[0].id }));
                }
            } catch (error) {
                console.error('Lỗi tải danh mục', error);
                toast.error('Lỗi tải danh mục sản phẩm!');
            }
        };
        fetchCategories();
    }, []);

    // 3. Các hàm xử lý thay đổi Input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    // 4. Hàm Submit gửi dữ liệu
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Kiểm tra xem đã có danh mục nào được chọn chưa
        if (!formData.ma_dm) {
            toast.warning('Vui lòng chọn danh mục cho sản phẩm!');
            return;
        }

        setIsLoading(true);

        const submitData = new FormData();
        submitData.append('ma_sp', formData.ma_sp);
        submitData.append('ten_sp', formData.ten_sp);
        submitData.append('ma_dm', formData.ma_dm);
        submitData.append('gia_ban', formData.gia_ban);
        submitData.append('so_luong', formData.so_luong);
        submitData.append('mo_ta', formData.mo_ta);
        
        if (imageFile) {
            submitData.append('hinh_anh', imageFile);
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/products', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
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
                        <input required name="ma_sp" onChange={handleChange} placeholder="VD: VS-JK-001" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm uppercase" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Tên Sản Phẩm</label>
                        <input required name="ten_sp" onChange={handleChange} placeholder="VD: Áo Da Biker Moto" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Danh Mục</label>
                        <select 
                            required 
                            name="ma_dm" 
                            value={formData.ma_dm} 
                            onChange={handleChange} 
                            className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm cursor-pointer"
                        >
                            {/* Render danh sách danh mục từ DB */}
                            {categories.length === 0 ? (
                                <option value="" disabled>Chưa có danh mục nào</option>
                            ) : (
                                categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                {/* Cột phải */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Giá Bán (VNĐ)</label>
                        <input required type="number" min="0" name="gia_ban" onChange={handleChange} placeholder="VD: 1500000" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Số lượng tồn kho</label>
                        <input required type="number" min="0" name="so_luong" onChange={handleChange} placeholder="VD: 50" className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] font-bold tracking-[0.2rem] uppercase text-outline">Ảnh Sản Phẩm</label>
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
                    <textarea name="mo_ta" onChange={handleChange} rows="3" placeholder="Chất liệu, form dáng, chi tiết nổi bật..." className="bg-transparent border-b border-outline-variant/50 py-3 focus:border-primary outline-none font-medium text-sm resize-none"></textarea>
                    
                    <button type="submit" disabled={isLoading} className="w-full mt-6 py-4 bg-primary text-on-primary font-bold uppercase tracking-[0.2rem] text-[0.75rem] hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? 'ĐANG XỬ LÝ...' : 'LƯU SẢN PHẨM VÀO KHO'}
                    </button>
                </div>
            </form>
        </div>
    );
}