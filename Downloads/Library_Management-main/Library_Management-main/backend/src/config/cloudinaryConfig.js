import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Cấu hình SDK Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Thiết lập Storage cho Multer trên Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'library_books', // Thư mục sẽ lưu ảnh trên Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 750, crop: 'limit' }] // Tự động tối ưu kích thước ảnh bìa
    }
});

// 3. Khởi tạo Middleware
const imageUpload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // Giới hạn ảnh 2MB cho nhẹ
});

export { cloudinary, imageUpload };
