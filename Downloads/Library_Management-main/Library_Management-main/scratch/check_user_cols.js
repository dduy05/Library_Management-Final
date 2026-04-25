import { getConnection } from '../backend/dbConfig.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

async function checkUserTable() {
    const pool = await getConnection();
    try {
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('--- Columns in "users" table ---');
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkUserTable();
