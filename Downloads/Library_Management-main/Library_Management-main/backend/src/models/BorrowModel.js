import { getConnection } from '../../dbConfig.js';

class BorrowModel {
    static async create({ user_id, book_id, due_date }, client = null) {
        const executor = client || (await getConnection());
        const result = await executor.query(
            `INSERT INTO borrow_requests (user_id, book_id, due_date, status)
             VALUES ($1, $2, $3, 'pending') RETURNING *`,
            [user_id, book_id, due_date]
        );
        return result.rows[0];
    }

    static async findById(id, client = null) {
        const executor = client || (await getConnection());
        const result = await executor.query(
            `SELECT br.*, b.title, b.author, u.username, u.full_name
             FROM borrow_requests br
             JOIN books b ON br.book_id = b.id
             JOIN users u ON br.user_id = u.id
             WHERE br.id = $1`, [id]
        );
        return result.rows[0] || null;
    }

    static async findAll() {
        const pool = await getConnection();
        const result = await pool.query(
            `SELECT br.*, b.title, b.author, u.username, u.full_name
             FROM borrow_requests br
             JOIN books b ON br.book_id = b.id
             JOIN users u ON br.user_id = u.id
             ORDER BY br.created_at DESC`
        );
        return result.rows;
    }

    static async findByUserId(userId) {
        const pool = await getConnection();
        const result = await pool.query(
            `SELECT br.*, b.title, b.author 
             FROM borrow_requests br
             JOIN books b ON br.book_id = b.id
             WHERE br.user_id = $1
             ORDER BY br.created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    static async updateStatus(id, { status, borrow_date, return_date, fine_amount, is_paid }, client = null) {
        const executor = client || (await getConnection());
        
        // Build dynamic SET clause to only update provided fields
        const fields = [];
        const values = [];
        let idx = 1;

        if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
        if (borrow_date !== undefined) { fields.push(`borrow_date = $${idx++}`); values.push(borrow_date); }
        if (return_date !== undefined) { fields.push(`return_date = $${idx++}`); values.push(return_date); }
        if (fine_amount !== undefined) { fields.push(`fine_amount = $${idx++}`); values.push(fine_amount); }
        if (is_paid !== undefined) { fields.push(`is_paid = $${idx++}`); values.push(is_paid); }

        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE borrow_requests SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        const result = await executor.query(query, values);
        return result.rows[0] || null;
    }

    static async checkEligibility(userId) {
        const pool = await getConnection();
        const result = await pool.query(
            `SELECT COUNT(*) FROM borrow_requests 
             WHERE user_id = $1 AND (
                 (status = 'approved' AND due_date < CURRENT_TIMESTAMP) OR 
                 (is_paid = false AND fine_amount > 0)
             )`, [userId]
        );
        return parseInt(result.rows[0].count) === 0;
    }
}

export default BorrowModel;
