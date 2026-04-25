import { getConnection } from '../../dbConfig.js';

class UserModel {
    static async findByUsername(username) {
        const pool = await getConnection();
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0] || null;
    }

    static async findById(id) {
        const pool = await getConnection();
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    static async create({ username, password, full_name, role = 'STUDENT' }) {
        const pool = await getConnection();
        const result = await pool.query(
            'INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, password, full_name || '', role]
        );
        return result.rows[0];
    }

    static async findAll() {
        const pool = await getConnection();
        const result = await pool.query('SELECT id, username, full_name, role, is_active FROM users ORDER BY id DESC');
        return result.rows;
    }

    static async updateRole(id, role) {
        const pool = await getConnection();
        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role',
            [role, id]
        );
        return result.rows[0] || null;
    }

    static async updateStatus(id, is_active) {
        const pool = await getConnection();
        const result = await pool.query(
            'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, username, is_active',
            [is_active, id]
        );
        return result.rows[0] || null;
    }

    static async updatePassword(id, hashedPassword) {
        const pool = await getConnection();
        const result = await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, username',
            [hashedPassword, id]
        );
        return result.rows[0] || null;
    }
}

export default UserModel;
