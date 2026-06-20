import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/usersModel'
import Category from './models/categoryModel'
import Product from './models/productsModel'

dotenv.config({ override: true })

const seedData = async () => {
    try {
        const uri = process.env.MONGODB_URI
        if (!uri) {
            console.error('Không tìm thấy MONGODB_URI trong file .env')
            process.exit(1)
        }

        console.log('Đang kết nối MongoDB...')
        await mongoose.connect(uri)
        console.log('Kết nối thành công!')

        // 1. Tạo tài khoản mẫu
        console.log('Đang khởi tạo tài khoản...')
        
        // Tạo Admin
        const adminExists = await User.findOne({ taiKhoan: 'admin' })
        if (!adminExists) {
            const hashedAdminPassword = await bcrypt.hash('adminpassword', 10)
            await User.create({
                hoTen: 'HUIT Admin',
                taiKhoan: 'admin',
                matKhau: hashedAdminPassword,
                email: 'admin@huit.edu.vn',
                sdt: '0987654321',
                diaChi: '140 Lê Trọng Tấn, Tân Phú, TP.HCM',
                vaiTro: 'admin'
            })
            console.log('-> Đã tạo tài khoản Admin thành công!')
            console.log('   Tài khoản: admin')
            console.log('   Mật khẩu: adminpassword')
        } else {
            console.log('-> Tài khoản Admin đã tồn tại.')
        }

        // Tạo User thường
        const userExists = await User.findOne({ taiKhoan: 'user' })
        if (!userExists) {
            const hashedUserPassword = await bcrypt.hash('userpassword', 10)
            await User.create({
                hoTen: 'HUIT Customer',
                taiKhoan: 'user',
                matKhau: hashedUserPassword,
                email: 'user@huit.edu.vn',
                sdt: '0123456789',
                diaChi: 'Phường Tây Thạnh, Quận Tân Phú, TP.HCM',
                vaiTro: 'user'
            })
            console.log('-> Đã tạo tài khoản User mẫu thành công!')
            console.log('   Tài khoản: user')
            console.log('   Mật khẩu: userpassword')
        } else {
            console.log('-> Tài khoản User đã tồn tại.')
        }

        // 2. Tạo Danh mục và Sản phẩm mẫu nếu chưa có
        try {
            await mongoose.connection.collection('categories').dropIndex('tenLoai_1')
            console.log('-> Đã dọn dẹp index tenLoai_1 cũ trong DB.')
        } catch (e) {
            // Không có index này, bỏ qua
        }

        console.log('Đang dọn dẹp dữ liệu cũ để seed mới...')
        await Category.deleteMany({})
        await Product.deleteMany({})

        console.log('Đang khởi tạo danh mục mẫu...')
            const categories = [
                { tenDM: 'Smartphones', moTa: 'Điện thoại thông minh các hãng Apple, Samsung, Xiaomi...' },
                { tenDM: 'Laptops', moTa: 'Laptop học tập, văn phòng, gaming...' },
                { tenDM: 'Accessories', moTa: 'Tai nghe, bàn phím, chuột và các phụ kiện công nghệ...' },
                { tenDM: 'Watches', moTa: 'Đồng hồ thông minh và vòng đeo tay sức khỏe...' },
                { tenDM: 'Cameras', moTa: 'Máy ảnh DSLR, máy ảnh không gương lật...' }
            ]

            const createdCategories = await Category.insertMany(categories)
            console.log('-> Đã tạo xong danh mục mẫu!')

            console.log('Đang khởi tạo sản phẩm mẫu...')
            const catMap = new Map(createdCategories.map(c => [c.tenDM, c._id]))

            const products = [
                {
                    tenSP: 'iPhone 15 Pro Max 256GB Titanium',
                    moTa: 'Siêu phẩm iPhone 15 Pro Max với khung viền Titanium siêu bền, camera zoom 5x quang học và chip xử lý A17 Pro mạnh mẽ nhất hiện nay.',
                    gia: 29990000,
                    giaCu: 34990000,
                    soLuong: 15,
                    hinhAnh: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80'],
                    loai: catMap.get('Smartphones'),
                    danhGiaTB: 4.8,
                    tongDanhGia: 1,
                    trangThai: 'active'
                },
                {
                    tenSP: 'ASUS ROG Zephyrus G14 Gaming Laptop',
                    moTa: 'Laptop Gaming mỏng nhẹ hàng đầu với bộ xử lý Ryzen 9 và đồ họa RTX 4060, màn hình ROG Nebula 120Hz siêu đẹp.',
                    gia: 42500000,
                    giaCu: 48500000,
                    soLuong: 8,
                    hinhAnh: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80'],
                    loai: catMap.get('Laptops'),
                    danhGiaTB: 4.9,
                    tongDanhGia: 1,
                    trangThai: 'active'
                },
                {
                    tenSP: 'Sony WH-1000XM5 Noise Cancelling Headphones',
                    moTa: 'Tai nghe chụp tai chống ồn chủ động tốt nhất thế giới, thiết kế sang trọng, thời lượng pin lên đến 30 tiếng liên tục.',
                    gia: 8490000,
                    giaCu: 9990000,
                    soLuong: 20,
                    hinhAnh: ['https://images.unsplash.com/photo-1618366712277-728ed2f19702?w=800&q=80'],
                    loai: catMap.get('Accessories'),
                    danhGiaTB: 4.7,
                    tongDanhGia: 0,
                    trangThai: 'active'
                },
                {
                    tenSP: 'Apple Watch Ultra 2 GPS + Cellular',
                    moTa: 'Đồng hồ thể thao chuyên nghiệp với thiết kế vỏ Titanium siêu bền, màn hình siêu sáng 3000 nits và thời lượng pin vượt trội.',
                    gia: 21990000,
                    giaCu: 25990000,
                    soLuong: 12,
                    hinhAnh: ['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80'],
                    loai: catMap.get('Watches'),
                    danhGiaTB: 4.6,
                    tongDanhGia: 0,
                    trangThai: 'active'
                }
            ]

            await Product.insertMany(products)
            console.log('-> Đã khởi tạo sản phẩm mẫu thành công!')

        console.log('--- Hoàn tất quá trình Seed Dữ Liệu! ---')
        process.exit(0)
    } catch (error) {
        console.error('Lỗi khi seed dữ liệu:', error)
        process.exit(1)
    }
}

seedData()
