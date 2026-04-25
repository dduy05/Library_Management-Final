import { getConnection } from '../../dbConfig.js';

class BookModel {
    /**
     * Lấy danh sách sách
     * @param {boolean} showDeleted - Nếu true, lấy cả sách đã bị xóa mềm
     */
    static async findAll(showDeleted = false) {
        const pool = await getConnection();
        let query = `
            SELECT b.*, c.name as category_name,
                   (SELECT AVG(rating) FROM book_reviews WHERE book_id = b.id) as display_rating
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
        `;
        
        if (!showDeleted) {
            query += ` WHERE b.is_deleted = FALSE `;
        }
        
        query += ` ORDER BY b.id DESC `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    static async findById(id) {
        const pool = await getConnection();
        const query = `
            SELECT b.*, c.name as category_name,
                   (SELECT AVG(rating) FROM book_reviews WHERE book_id = b.id) as display_rating
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    static async create({ title, author, category_id, description, cover_image, available_count, total_count, published_year, rating }) {
        const pool = await getConnection();
        const result = await pool.query(
            'INSERT INTO books (title, author, category_id, description, cover_image, available_count, total_count, published_year, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [title, author, category_id, description, cover_image, available_count, total_count, published_year, rating]
        );
        return result.rows[0];
    }

    /**
     * Cập nhật thông tin sách sử dụng COALESCE để bảo vệ dữ liệu cũ nếu không truyền giá trị mới
     */
    static async update(id, data) {
        const pool = await getConnection();
        const { title, author, category_id, description, cover_image, available_count, total_count, published_year, rating } = data;
        
        const query = `
            UPDATE books 
            SET title = COALESCE($1, title),
                author = COALESCE($2, author),
                category_id = COALESCE($3, category_id),
                description = COALESCE($4, description),
                cover_image = COALESCE($5, cover_image),
                available_count = COALESCE($6, available_count),
                total_count = COALESCE($7, total_count),
                published_year = COALESCE($8, published_year),
                rating = COALESCE($9, rating)
            WHERE id = $10 
            RETURNING *
        `;
        
        const result = await pool.query(query, [
            title, author, category_id, description, cover_image, 
            available_count, total_count, published_year, rating, id
        ]);
        return result.rows[0] || null;
    }

    /**
     * Xóa vĩnh viễn (Hard Delete)
     */
    static async hardDelete(id) {
        const pool = await getConnection();
        const result = await pool.query(
            'DELETE FROM books WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Xóa mềm (Soft Delete)
     */
    static async softDelete(id) {
        const pool = await getConnection();
        const result = await pool.query(
            'UPDATE books SET is_deleted = TRUE WHERE id = $1 RETURNING *', 
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Khôi phục sách đã xóa (Restore)
     */
    static async restore(id) {
        const pool = await getConnection();
        const result = await pool.query(
            'UPDATE books SET is_deleted = FALSE WHERE id = $1 RETURNING *', 
            [id]
        );
        return result.rows[0] || null;
    }

    static async updateAvailableCount(id, delta, client = null) {
        const executor = client || (await getConnection());
        const result = await executor.query(
            'UPDATE books SET available_count = available_count + $1 WHERE id = $2 RETURNING *',
            [delta, id]
        );
        return result.rows[0] || null;
    }

    /**
     * Kiểm tra xem sách có đang được mượn hay không
     */
    static async getActiveBorrowCount(id) {
        const pool = await getConnection();
        const query = `
            SELECT COUNT(*) FROM borrow_requests 
            WHERE book_id = $1 AND status IN ('pending', 'approved')
        `;
        const result = await pool.query(query, [id]);
        return parseInt(result.rows[0].count);
    }
}

export default BookModel;
