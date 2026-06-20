# HUIT-Shop - Nền tảng Thương mại Điện tử

Chào mừng bạn đến với **HUIT-Shop**, một dự án thương mại điện tử hiện đại được xây dựng với Next.js và Node.js.

## Cấu trúc Dự án

- `/frontend`: Chứa mã nguồn giao diện (Next.js 15+, Tailwind CSS v4).
- `/backend`: Chứa mã nguồn máy chủ (Express, MongoDB, TypeScript).

## Hướng dẫn Chạy Dự án

Để chạy toàn bộ hệ thống, bạn cần thực hiện theo các bước sau:

### 1. Khởi động Backend

Máy chủ Backend xử lý các API về xác thực, sản phẩm và giỏ hàng.

1. Mở terminal và di chuyển vào thư mục backend:

   ```bash
   cd backend
   ```

2. Cài đặt các thư viện cần thiết:

   ```bash
   npm install
   ```

3. Tạo file `.env` trong thư mục `backend/` và cấu hình các biến môi trường:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. Chạy backend ở chế độ phát triển:

   ```bash
   npm run dev
   ```

   *Máy chủ sẽ chạy tại: <http://localhost:5000>*

### 2. Khởi động Frontend

Giao diện người dùng được xây dựng để tương tác trực tiếp với API từ Backend.

1. Mở một terminal mới tại thư mục gốc của dự án.
2. Cài đặt các thư viện:

   ```bash
   npm install
   ```

3. Chạy giao diện ở chế độ phát triển:

   ```bash
   npm run dev
   ```

   *Giao diện sẽ chạy tại: <http://localhost:3000>*

## Các Tính năng Đã Hoàn thiện

- [x] Giao diện Trang chủ hiện đại, responsive.
- [x] Hệ thống xác thực (Đăng ký, Đăng nhập) kết nối Backend.
- [x] Hiển thị danh sách sản phẩm thực tế từ Database.
- [x] Tìm kiếm sản phẩm thời gian thực.
- [x] Xem chi tiết sản phẩm và Giỏ hàng (Giao diện).

## Công nghệ Sử dụng

- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Lucide React, Shadcn UI patterns.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, TypeScript.

---
Dự án được thực hiện bởi Nhóm Đồ án HUIT.

# TMDT
