import { getConnection } from '../../dbConfig.js';

class NotificationModel {
    static async create({ user_id, message, type = 'info' }, client = null) {
        const executor = client || (await getConnection());
        const result = await executor.query(
            'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3) RETURNING *',
            [user_id, message, type]
        );
        return result.rows[0];
    }

    static async findByUserId(userId) {
        const pool = await getConnection();
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    static async markAsRead(id) {
        const pool = await getConnection();
        const result = await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0] || null;
    }

    static async markAllAsRead(userId) {
        const pool = await getConnection();
        const result = await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 RETURNING *',
            [userId]
        );
        return result.rows;
    }
}

export default NotificationModel;
