# 📚 Hệ Thống Quản Lý Thư Viện (Library Management System)

Đây là một Website Quản lý Thư viện Full-stack hiện đại, được thiết kế chuyên nghiệp với các tính năng nâng cao như nhập liệu hàng loạt và thông báo tự động. Hệ thống sử dụng Node.js, Express, JavaScript, Tailwind CSS và PostgreSQL.

## 🌟 Tính Năng Nổi Bật

- **Nhập Sách từ Excel chuyên nghiệp**: Hỗ trợ nhập hàng nghìn đầu sách cùng lúc, tự động nhận diện thể loại và xử lý trùng lặp (Restock).
- **Hệ thống Nhắc nhở Trả sách (Smart Reminders)**: 
    - Tự động gửi thông báo đến sinh viên trước 2 ngày đến hạn trả sách (Sử dụng Cron Job).
    - Hỗ trợ nút bấm 🔔 "Nudge" để Admin gửi lời nhắc thủ công ngay lập tức.
- **Bảo mật JWT & Phân quyền Role-based**: Phân biệt rõ rệt quyền hạn giữa `ADMIN` và `STUDENT`.
- **Giao diện Dashboard trực quan**: Biểu đồ tóm tắt, bảng quản lý yêu cầu thời gian thực.

---

## 🛠 Yêu Cầu Hệ Thống (Prerequisites)

- **Node.js** (Phiên bản 18.x trở lên)
- **PostgreSQL** (Port 5432)
- **pgAdmin 4** để quản lý Cơ sở dữ liệu.

---

## 🚀 Hướng Dẫn Khởi Chạy (Step-by-step)

### Bước 1: Cấu hình Cơ sở Dữ liệu
1. Tạo Database tên là `"LibraryDB"` trong PostgreSQL.
2. Mở tệp `backend/database.sql`, copy toàn bộ nội dung và chạy (Execute) trong Query Tool của pgAdmin để tạo các bảng và dữ liệu mẫu.

### Bước 2: Cài đặt Môi trường
Mở tệp `backend/.env` và cấu hình các thông số kết nối Database của bạn:
```env
DB_USER=postgres
DB_PASSWORD=Mật_Khẩu_Của_Bạn
DB_PORT=5432
DB_NAME=LibraryDB
JWT_SECRET=Key_Bao_Mat_Tuy_Chon
CLOUDINARY_CLOUD_NAME= Cloud_name_của_bạn
CLOUDINARY_API_KEY= API_key_của_bạn
CLOUDINARY_API_SECRET= API_secret_của_bạn
```
lên Cloudinay tạo tạo khoản, chỗ Product Environment chọn go to API sẽ có API KEY với SECRET
### Bước 3: Cài đặt Dependencies
Mở 2 cửa sổ Terminal độc lập:

**Terminal 1 (Frontend):**
```bash
npm install
```

**Terminal 2 (Backend):**
```bash
cd backend
npm install
```

### Bước 4: Chạy Ứng dụng
**Tại Terminal 2 (Backend):**
```bash
npm run dev
```
=> Kiểm tra xem có dòng: "✅ Cron Service đã được kích hoạt" không.

**Tại Terminal 1 (Frontend):**
```bash
npm start
```
=> Sau đó mở trình duyệt tại địa chỉ hiển thị (thường là `http://localhost:5173`).

---

## 🔑 Tài khoản Thử Nghiệm

- **Admin**: User: `admin` | Pass: `123456`
- **Sinh viên**: User: `student1` | Pass: `123456`

---

## 📁 Cấu Trúc Đặc Biệt
- `backend/public/templates/`: Chứa file Excel mẫu để Admin tải về.
- `backend/src/services/cronService.js`: Trái tim của hệ thống nhắc nhở tự động.
- `backend/src/controllers/bookImportController.js`: Xử lý logic nhập liệu Excel phức tạp.

---
_Dự án được phát triển bởi Antigravity AI - Chúc bạn quản lý thư viện hiệu quả!_ 🚀
