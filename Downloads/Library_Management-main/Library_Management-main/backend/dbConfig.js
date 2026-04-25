import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const poolConnection = new Pool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'LibraryDB',
    // Giới hạn connection pool để tránh treo (treo khi query quá nhiều)
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

poolConnection.on('error', (err) => {
    console.error('❌ Lỗi Database ngầm định:', err.message);
});

export const getConnection = async () => {
    try {
        const client = await poolConnection.connect();
        client.release();
        return poolConnection;
    } catch (error) {
        console.error("❌ Lỗi kết nối PostgreSQL (Vui lòng kiểm tra lại file .env): ", error.message);
        throw error;
    }
};
