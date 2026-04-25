window.handleBorrowActionDetail = async (requestId, action) => {
    console.log(`📋 handleBorrowActionDetail: ID=${requestId}, Action=${action}`);
    const token = localStorage.getItem('token');
    let status = '';
    if (action === 'approve') status = 'approved';
    if (action === 'reject') status = 'rejected';
    if (action === 'return') status = 'returned';

    try {
        const res = await fetch(`http://localhost:3000/api/borrows/${requestId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Cập nhật phiếu mượn thành công!');
            location.reload();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('🔴 BorrowActionDetail Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};

window.handlePaidActionDetail = async (requestId) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:3000/api/borrows/${requestId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ is_paid: true })
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Đã xác nhận nộp tiền phạt!');
            location.reload();
        }
    } catch (error) {
        console.error('🔴 PaidActionDetail Error:', error);
    }
};

export const BorrowRequests = async () => {
    const token = localStorage.getItem('token');
    let requestsHtml = '';

    try {
        const res = await fetch('http://localhost:3000/api/borrows/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reqsData = await res.json();
        
        if (reqsData.success && reqsData.data.length > 0) {
            requestsHtml = reqsData.data.map(req => {
                let statusBadge = '';
                let borderClass = 'border-l-gray-300';
                
                if (req.status === 'pending') {
                    statusBadge = '<span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">Chờ duyệt</span>';
                    borderClass = 'border-l-yellow-400';
                } else if (req.status === 'approved') {
                    statusBadge = '<span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">Đang mượn</span>';
                    borderClass = 'border-l-indigo-600';
                } else if (req.status === 'returned') {
                    statusBadge = '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Đã trả</span>';
                    borderClass = 'border-l-green-500';
                } else {
                    statusBadge = '<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Từ chối</span>';
                    borderClass = 'border-l-red-500';
                }

                const borrowDate = new Date(req.created_at || req.borrow_date).toLocaleDateString('vi-VN');
                const dueDate = req.due_date ? new Date(req.due_date).toLocaleDateString('vi-VN') : '---';
                
                const fineInfo = req.fine_amount > 0 
                    ? `<div class="font-bold text-red-600">${req.fine_amount.toLocaleString()}đ <span class="text-[10px]">${req.is_paid ? '(Đã nộp)' : '(Nợ)'}</span></div>`
                    : '<span class="text-gray-300">-</span>';

                return `
                    <tr class="hover:bg-gray-50/50">
                        <td class="px-6 py-4 font-bold text-navy-900 border-l-4 ${borderClass}">#BR${req.id}</td>
                        <td class="px-6 py-4">
                            <div class="font-medium text-navy-900">${req.full_name || req.username}</div>
                            <div class="text-xs text-gray-500">${req.username}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="font-medium text-navy-900 truncate max-w-[200px]">${req.title}</div>
                        </td>
                        <td class="px-6 py-4 text-gray-500 text-xs">${borrowDate}</td>
                        <td class="px-6 py-4 text-gray-900 font-medium text-xs">${dueDate}</td>
                        <td class="px-6 py-4">${statusBadge}</td>
                        <td class="px-6 py-4">${fineInfo}</td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                ${req.status === 'pending' ? `
                                    <button onclick="window.handleBorrowActionDetail(${req.id}, 'approve')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm">Duyệt</button>
                                    <button onclick="window.handleBorrowActionDetail(${req.id}, 'reject')" class="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium transition">Từ chối</button>
                                ` : ''}
                                ${req.status === 'approved' ? `
                                    <button onclick="window.handleBorrowActionDetail(${req.id}, 'return')" class="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm">Xác nhận Trả</button>
                                ` : ''}
                                ${req.fine_amount > 0 && !req.is_paid ? `
                                    <button onclick="window.handlePaidActionDetail(${req.id})" class="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm">Thu tiền phạt</button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            requestsHtml = `<tr><td colspan="8" class="px-6 py-12 text-center text-gray-500 bg-gray-50">Không tìm thấy phiếu mượn nào trong hệ thống.</td></tr>`;
        }
    } catch (error) {
        console.error("🔴 BorrowRequests Error:", error);
    }

    return `
    <div class="animate-fade-in max-w-7xl mx-auto pb-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-5">
            <div>
                <h1 class="text-3xl font-bold text-navy-900 tracking-tight flex items-center gap-3">
                    <a href="#/admin" class="text-gray-400 hover:text-indigo-600 transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </a>
                    Quản lý Phiếu mượn
                </h1>
                <p class="text-gray-500 mt-1 ml-9">Danh sách toàn bộ yêu cầu mượn và trả sách của sinh viên.</p>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto min-h-[400px]">
                <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead class="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                        <tr>
                            <th class="px-6 py-4">Mã Phiếu</th>
                            <th class="px-6 py-4">Sinh viên</th>
                            <th class="px-6 py-4">Ấn phẩm</th>
                            <th class="px-6 py-4">Ngày mượn</th>
                            <th class="px-6 py-4">Hạn trả</th>
                            <th class="px-6 py-4">Trạng thái</th>
                            <th class="px-6 py-4">Phạt</th>
                            <th class="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${requestsHtml}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;
};
