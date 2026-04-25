import cron from 'node-cron';
import BorrowModel from '../models/BorrowModel.js';
import NotificationModel from '../models/NotificationModel.js';
import { getConnection } from '../../dbConfig.js';

class CronService {
    static initCronJobs() {
        cron.schedule('0 0 * * *', async () => {
            console.log('--- 🤖 CRON JOB: ĐANG QUÉT CÁC SÁCH SẮP HẾT HẠN ---');
            await this.checkAndNotifyUpcomingDueDates();
        });

        console.log('✅ Cron Service đã được kích hoạt (Lịch chạy: 00:00 hàng ngày)');
    }

    static async checkAndNotifyUpcomingDueDates() {
        const pool = await getConnection();
        try {
            const query = `
                SELECT br.*, b.title, u.full_name, u.username
                FROM borrow_requests br
                JOIN books b ON br.book_id = b.id
                JOIN users u ON br.user_id = u.id
                WHERE br.status = 'approved' 
                AND br.reminder_sent = false
                AND br.due_date <= (CURRENT_DATE + INTERVAL '2 days')
                AND br.due_date > CURRENT_DATE
            `;

            const { rows } = await pool.query(query);
            console.log(`🔍 Tìm thấy ${rows.length} phiếu mượn cần nhắc nhở.`);

            for (const row of rows) {
                const message = `⏰ Nhắc nhở tự động: Bạn còn 2 ngày nữa là đến hạn trả sách "**${row.title}**". Vui lòng sắp xếp thời gian trả sách cho thư viện nhé!`;

                // 1. Tạo thông báo cho sinh viên
                await NotificationModel.create({
                    user_id: row.user_id,
                    message: message,
                    type: 'warning'
                });

                // 2. Đánh dấu là đã gửi nhắc nhở để không gửi lại vào ngày mai
                await pool.query(
                    'UPDATE borrow_requests SET reminder_sent = true WHERE id = $1',
                    [row.id]
                );

                console.log(`✅ Đã gửi nhắc nhở cho sinh viên ${row.username} (ID: ${row.id})`);
            }
        } catch (error) {
            console.error('🔴 Cron Job Error:', error);
        }
    }
}

export default CronService;
