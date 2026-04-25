
-- 1. Tạo Bảng Thể loại (categories)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 2. Tạo Bảng Kho Sách (books)
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category_id INT REFERENCES categories(id),
    cover_image VARCHAR(500),
    description TEXT,
    available_count INT DEFAULT 0,
    total_count INT DEFAULT 0,
    published_year INT,
    rating DECIMAL(3,1),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Xóa ràng buộc Unique cũ nếu có và tạo Partial Index để hỗ trợ Soft Delete
-- Ràng buộc này đảm bảo: Chỉ có 1 cuốn sách (tên + tác giả) đang hoạt động (không bị xóa) tại một thời điểm.
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_unique_active 
ON books (title, author) 
WHERE (is_deleted = FALSE);

-- 3. Tạo Bảng Người Dùng (users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'STUDENT'
);

-- 4. Tạo Bảng Phiếu Mượn (borrow_requests)
CREATE TABLE IF NOT EXISTS borrow_requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    book_id INT REFERENCES books(id),
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, returned
    fine_amount DECIMAL(10,2) DEFAULT 0,
    is_paid BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE, -- Cờ đánh dấu đã gửi thông báo giục trả
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tạo Bảng Thông Báo (notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- info, success, warning, danger
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tạo Bảng Đánh Giá Sách (book_reviews)
CREATE TABLE IF NOT EXISTS book_reviews (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books(id),
    user_id INT REFERENCES users(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-----------------------------------------------------------
-- DỮ LIỆU MẪU (SEED DATA)
-----------------------------------------------------------

-- Thêm Thể loại
INSERT INTO categories (name) VALUES ('Lập trình'), ('Kỹ năng'), ('Kiến trúc'), ('Văn học') ON CONFLICT DO NOTHING;

-- Thêm Người dùng mẫu (Mật khẩu mặc định là: 123456)
INSERT INTO users (username, password, full_name, role)
VALUES 
('admin', '$2b$10$/uAfE3CSzINufehL.jnkduy4y/VjvUOFiWqS8SMgtQKnUzz1Vuk3m', 'Administrator', 'ADMIN'),
('student1', '$2b$10$/uAfE3CSzINufehL.jnkduy4y/VjvUOFiWqS8SMgtQKnUzz1Vuk3m', 'Nguyễn Văn A', 'STUDENT')
ON CONFLICT DO NOTHING;

-- Thêm Sách mẫu
INSERT INTO books (title, author, category_id, cover_image, description, available_count, total_count, published_year, rating)
VALUES 
('Clean Code', 'Robert C. Martin', 1, 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=2000', 'Cẩm nang tạo ra mã sạch, viết code chuyên nghiệp.', 3, 5, 2008, 4.8),
('The Pragmatic Programmer', 'David Thomas', 1, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2000', 'Lời khuyên của Lập trình viên Thực dụng, kinh nghiệm dắt túi', 12, 15, 1999, 4.7)
ON CONFLICT DO NOTHING;
