import { getConnection } from '../../dbConfig.js';

class StatsModel {
    static async getGlobalSummary() {
        const pool = await getConnection();
        
        // Using separate counts as in original controller
        const queries = {
            total_books: 'SELECT COUNT(*) FROM books',
            active_borrows: "SELECT COUNT(*) FROM borrow_requests WHERE status = 'approved'",
            pending_requests: "SELECT COUNT(*) FROM borrow_requests WHERE status = 'pending'",
            total_students: "SELECT COUNT(*) FROM users WHERE role = 'STUDENT'"
        };

        const [books, active, pending, students] = await Promise.all([
            pool.query(queries.total_books),
            pool.query(queries.active_borrows),
            pool.query(queries.pending_requests),
            pool.query(queries.total_students)
        ]);

        return {
            total_books: parseInt(books.rows[0].count),
            active_borrows: parseInt(active.rows[0].count),
            pending_requests: parseInt(pending.rows[0].count),
            total_students: parseInt(students.rows[0].count)
        };
    }

    static async getUserSummary(userId) {
        const pool = await getConnection();
        
        const queries = {
            borrowed: "SELECT COUNT(*) FROM borrow_requests WHERE user_id = $1 AND status = 'approved'",
            overdue: "SELECT COUNT(*) FROM borrow_requests WHERE user_id = $1 AND status = 'approved' AND due_date < CURRENT_TIMESTAMP",
            history: "SELECT COUNT(*) FROM borrow_requests WHERE user_id = $1",
            unpaid_fines: "SELECT SUM(fine_amount) FROM borrow_requests WHERE user_id = $1 AND is_paid = false"
        };

        const [borrowed, overdue, history, fines] = await Promise.all([
            pool.query(queries.borrowed, [userId]),
            pool.query(queries.overdue, [userId]),
            pool.query(queries.history, [userId]),
            pool.query(queries.unpaid_fines, [userId])
        ]);

        return {
            borrowed_count: parseInt(borrowed.rows[0].count),
            overdue_count: parseInt(overdue.rows[0].count),
            history_count: parseInt(history.rows[0].count),
            unpaid_fines: parseInt(fines.rows[0].sum || 0)
        };
    }
}

export default StatsModel;
