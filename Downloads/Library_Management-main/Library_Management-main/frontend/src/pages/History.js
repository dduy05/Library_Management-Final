export const History = async () => {
    const token = localStorage.getItem('token');
    let historyHtml = '';

    try {
        const response = await fetch('http://localhost:3000/api/borrows/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            historyHtml = result.data.map(req => {
                let statusBadge = '';
                if (req.status === 'pending') statusBadge = '<span class="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Chờ duyệt</span>';
                if (req.status === 'approved') statusBadge = '<span class="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Đang mượn</span>';
                if (req.status === 'rejected') statusBadge = '<span class="bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Từ chối</span>';
                if (req.status === 'returned') statusBadge = '<span class="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Đã trả</span>';

                const fineText = req.fine_amount > 0 
                    ? `<span class="text-red-600 font-bold block mt-1">${req.fine_amount.toLocaleString()}đ ${req.is_paid ? '(Đã nộp)' : '(Chưa nộp)'}</span>` 
                    : '<span class="text-gray-400 text-xs">Không có</span>';

                return `
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md hover:border-indigo-100">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-16 bg-navy-900 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg">
                            <span class="text-[10px] font-bold text-center px-1">BOOK #ID${req.book_id}</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-navy-900 text-lg leading-tight line-clamp-1">${req.title}</h3>
                            <p class="text-gray-500 text-sm">${req.author}</p>
                            <div class="mt-2 flex flex-wrap gap-4 text-xs text-gray-400">
                                <span>📅 Mượn: ${new Date(req.created_at).toLocaleDateString()}</span>
                                <span>⌛ Hạn: ${new Date(req.due_date).toLocaleDateString()}</span>
                                ${req.return_date ? `<span>✅ Trả: ${new Date(req.return_date).toLocaleDateString()}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-gray-50">
                        <div class="text-center md:text-right">
                           <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trạng thái</p>
                           ${statusBadge}
                        </div>
                        <div class="text-center md:text-right">
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tiền phạt</p>
                            ${fineText}
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        } else {
            historyHtml = `
            <div class="bg-white p-12 rounded-2xl shadow-sm border-2 border-dashed border-gray-100 text-center">
                <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <h3 class="text-lg font-bold text-navy-900">Chưa có lịch sử mượn sách</h3>
                <p class="text-gray-500 mt-2">Bạn chưa thực hiện yêu cầu mượn sách nào trong hệ thống.</p>
                <a href="#/books" class="mt-6 inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg">Khám phá ngay</a>
            </div>
            `;
        }
    } catch (error) {
        console.error("🔴 History Fetch Error:", error);
        historyHtml = `<div class="p-10 text-center text-red-500 bg-red-50 rounded-2xl border border-red-200">Lỗi kết nối máy chủ.</div>`;
    }

    return `
    <div class="animate-fade-in max-w-4xl mx-auto pb-10">
        <div class="mb-8 border-b border-gray-200 pb-6 flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-navy-900 tracking-tight">Lịch sử Mượn trả</h1>
                <p class="text-gray-500 mt-1">Theo dõi hành trình đọc sách và quản lý các khoản phạt của bạn.</p>
            </div>
            <a href="#/" class="text-navy-900 font-bold flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-xl transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Trang chủ
            </a>
        </div>

        <div class="space-y-4">
            ${historyHtml}
        </div>
    </div>
    `;
};
