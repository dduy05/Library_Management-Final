import { getConnection } from '../../dbConfig.js';

class CategoryModel {
    static async findAll() {
        const pool = await getConnection();
        const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        return result.rows;
    }

    static async create(name) {
        const pool = await getConnection();
        const result = await pool.query(
            'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *',
            [name]
        );
        return result.rows[0];
    }
}

export default CategoryModel;
