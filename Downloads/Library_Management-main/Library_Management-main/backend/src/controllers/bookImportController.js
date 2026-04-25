import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { getConnection } from '../../dbConfig.js';
import CategoryModel from '../models/CategoryModel.js';
import AppError from '../utils/AppError.js';

export const importBooksFromExcel = async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Vui lòng tải lên file Excel.', 400));
    }

    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Security Check: Row Limit
        if (data.length > 500) {
            fs.unlinkSync(req.file.path);
            return next(new AppError('File quá lớn. Vui lòng giới hạn tối đa 500 dòng mỗi lần nhập.', 400));
        }

        const results = {
            successCount: 0,
            failureCount: 0,
            errors: []
        };

        const validBooks = [];
        const pool = await getConnection();

        // Pre-fetch all categories to minimize DB calls
        const catRes = await pool.query('SELECT id, name FROM categories');
        const categoryMap = new Map(catRes.rows.map(c => [c.name.toLowerCase(), c.id]));

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2; // Excel row starts from 1 (header) + 1

            const title = row['Tiêu đề']?.toString().trim();
            const author = row['Tác giả']?.toString().trim();
            const categoryName = row['Thể loại']?.toString().trim();
            const description = row['Mô tả']?.toString().trim() || '';
            const publishedYear = parseInt(row['Năm xuất bản']) || new Date().getFullYear();
            const count = parseInt(row['Số lượng']) || 0;
            const coverImage = row['Ảnh bìa (URL)']?.toString().trim() || '';

            // Validation
            if (!title) {
                results.failureCount++;
                results.errors.push({ row: rowNum, message: 'Thiếu tiêu đề sách.' });
                continue;
            }
            if (!author) {
                results.failureCount++;
                results.errors.push({ row: rowNum, message: 'Thiếu tên tác giả.' });
                continue;
            }
            if (!categoryName) {
                results.failureCount++;
                results.errors.push({ row: rowNum, message: 'Thiếu thể loại.' });
                continue;
            }

            // Resolve Category ID (with cache)
            let categoryId = categoryMap.get(categoryName.toLowerCase());
            if (!categoryId) {
                const newCat = await CategoryModel.create(categoryName);
                categoryId = newCat.id;
                categoryMap.set(categoryName.toLowerCase(), categoryId);
            }

            validBooks.push({
                title, author, category_id: categoryId, description, cover_image: coverImage, 
                available_count: count, total_count: count, published_year: publishedYear, rating: 4.5
            });
        }

        // Bulk Upsert Logic with Soft-Delete Recovery Support
        for (const book of validBooks) {
            try {
                // Check if book exists (including deleted ones)
                const existing = await pool.query(
                    'SELECT id, is_deleted, total_count, available_count FROM books WHERE LOWER(title) = LOWER($1) AND LOWER(author) = LOWER($2) LIMIT 1',
                    [book.title, book.author]
                );

                if (existing.rows.length > 0) {
                    // Update existing (Restore if deleted + Add quantity)
                    await pool.query(`
                        UPDATE books SET 
                            total_count = total_count + $1,
                            available_count = available_count + $2,
                            is_deleted = FALSE,
                            description = $3,
                            published_year = $4,
                            category_id = $5
                        WHERE id = $6
                    `, [book.total_count, book.available_count, book.description, book.published_year, book.category_id, existing.rows[0].id]);
                } else {
                    // Insert new
                    await pool.query(`
                        INSERT INTO books (title, author, category_id, description, cover_image, available_count, total_count, published_year, rating)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    `, [
                        book.title, book.author, book.category_id, book.description, book.cover_image,
                        book.available_count, book.total_count, book.published_year, book.rating
                    ]);
                }
                results.successCount++;
            } catch (err) {
                results.failureCount++;
                results.errors.push({ row: 'DB', message: `Lỗi hệ thống khi xử lý sách "${book.title}": ${err.message}` });
            }
        }

        // Cleanup temp file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            data: results
        });

    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(error);
    }
};

export const downloadTemplate = (req, res) => {
    const templatePath = path.join(process.cwd(), 'public/templates/book_template.xlsx');
    if (fs.existsSync(templatePath)) {
        res.download(templatePath, 'book_template.xlsx');
    } else {
        res.status(404).json({ success: false, message: 'Không tìm thấy file mẫu.' });
    }
};
