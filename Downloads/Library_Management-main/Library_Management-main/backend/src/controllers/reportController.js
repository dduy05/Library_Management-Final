import XLSX from 'xlsx';
import BookModel from '../models/BookModel.js';
import BorrowModel from '../models/BorrowModel.js';

/**
 * Format date to DD/MM/YYYY
 */
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Handle null/undefined values
 */
const cleanData = (val) => val === null || val === undefined ? '' : val;

export const exportInventoryReport = async (req, res, next) => {
    try {
        const books = await BookModel.findAll(true); // Include deleted if needed, or just active
        
        // Map to Vietnamese Headers & Format Data
        const reportData = books.map(book => ({
            'Mã Sách': book.id,
            'Tên Sách': cleanData(book.title),
            'Tác giả': cleanData(book.author),
            'Thể loại': cleanData(book.category_name),
            'Năm XB': cleanData(book.published_year),
            'Tồn kho': cleanData(book.available_count),
            'Tổng cộng': cleanData(book.total_count),
            'Trạng thái': book.is_deleted ? 'Đã ẩn' : 'Đang bán'
        }));

        const worksheet = XLSX.utils.json_to_sheet(reportData);
        
        // Auto-width adjustment
        const wscols = [
            { wch: 10 }, // Mã Sách
            { wch: 40 }, // Tên Sách
            { wch: 25 }, // Tác giả
            { wch: 20 }, // Thể loại
            { wch: 10 }, // Năm XB
            { wch: 10 }, // Tồn kho
            { wch: 10 }, // Tổng cộng
            { wch: 15 }  // Trạng thái
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Kho Sach');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        const date = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Bao_cao_Kho_sach_${date}.xlsx`);
        res.send(buffer);
    } catch (error) {
        next(error);
    }
};

export const exportBorrowReport = async (req, res, next) => {
    try {
        const borrows = await BorrowModel.findAll();
        
        // Map to Vietnamese Headers & Format Data
        const reportData = borrows.map(req => ({
            'Mã Phiếu': `BR${req.id}`,
            'Sinh viên': cleanData(req.full_name || req.username),
            'Mã SV': cleanData(req.username),
            'Tên Sách': cleanData(req.title),
            'Ngày mượn': formatDate(req.borrow_date),
            'Hạn trả': formatDate(req.due_date),
            'Ngày trả thực': formatDate(req.return_date),
            'Trạng thái': cleanData(req.status),
            'Tiền phạt': cleanData(req.fine_amount),
            'Thanh toán': req.is_paid ? 'Đã nộp' : (req.fine_amount > 0 ? 'Chưa nộp' : '-')
        }));

        const worksheet = XLSX.utils.json_to_sheet(reportData);
        
        // Auto-width adjustment
        const wscols = [
            { wch: 12 }, // Mã Phiếu
            { wch: 25 }, // Sinh viên
            { wch: 15 }, // Mã SV
            { wch: 35 }, // Tên Sách
            { wch: 15 }, // Ngày mượn
            { wch: 15 }, // Hạn trả
            { wch: 15 }, // Ngày trả thực
            { wch: 15 }, // Trạng thái
            { wch: 12 }, // Tiền phạt
            { wch: 12 }  // Thanh toán
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Muon Tra');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        const date = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Bao_cao_Muon_tra_${date}.xlsx`);
        res.send(buffer);
    } catch (error) {
        next(error);
    }
};
