import { getConnection } from '../../dbConfig.js';

class ReviewModel {
    static async create({ book_id, user_id, rating, comment }) {
        const pool = await getConnection();
        const result = await pool.query(
            'INSERT INTO book_reviews (book_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [book_id, user_id, rating, comment]
        );
        return result.rows[0];
    }

    static async findByBookId(bookId) {
        const pool = await getConnection();
        const result = await pool.query(
            `SELECT br.*, u.username, u.full_name 
             FROM book_reviews br
             JOIN users u ON br.user_id = u.id
             WHERE br.book_id = $1
             ORDER BY br.created_at DESC`,
            [bookId]
        );
        return result.rows;
    }

    static async checkUserCanReview(userId, bookId) {
        const pool = await getConnection();
        const result = await pool.query(
            `SELECT COUNT(*) FROM borrow_requests 
             WHERE user_id = $1 AND book_id = $2 AND status IN ('approved', 'returned')`,
            [userId, bookId]
        );
        return parseInt(result.rows[0].count) > 0;
    }
}

export default ReviewModel;
