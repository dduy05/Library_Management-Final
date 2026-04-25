window.handleBorrowAction = async (requestId, action) => {
    console.log(`📑 handleBorrowAction: ID=${requestId}, Action=${action}`);
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
            alert('✅ Cập nhật trạng thái thành công!');
            location.reload();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('🔴 BorrowAction Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};

window.handlePaidAction = async (requestId) => {
    console.log(`💰 handlePaidAction: ID=${requestId}`);
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
        console.error('🔴 PaidAction Error:', error);
    }
};

window.handleAddBook = async (event) => {
    event.preventDefault();
    console.log('📚 handleAddBook (Multipart) called');
    const token = localStorage.getItem('token');
    const formData = new FormData(event.target);

    try {
        const res = await fetch('http://localhost:3000/api/books', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Thêm sách mới thành công!');
            if (window.loadAdminBookList) window.loadAdminBookList();
            window.closeAddBookModal();
            event.target.reset();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('🔴 AddBook Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};

window.handleUpdateBook = async (event, bookId) => {
    event.preventDefault();
    console.log(`🆙 handleUpdateBook: ID=${bookId}`);
    const token = localStorage.getItem('token');
    const formData = new FormData(event.target);

    try {
        const res = await fetch(`http://localhost:3000/api/books/${bookId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Cập nhật thông tin sách thành công!');
            if (window.loadAdminBookList) window.loadAdminBookList();
            window.closeEditBookModal();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('🔴 UpdateBook Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};

window.handleDeleteBook = async (id) => {
    if (!confirm('❓ Bạn có chắc chắn muốn ẩn (xóa mềm) cuốn sách này khỏi hệ thống?')) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:3000/api/books/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Đã ẩn sách thành công!');
            if (window.loadAdminBookList) window.loadAdminBookList();
        } else {
            alert('❌ Lỗi: ' + data.message);
        }
    } catch (error) {
        console.error('🔴 DeleteBook Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};

window.handleRestoreBook = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:3000/api/books/${id}/restore`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Đã khôi phục sách thành công!');
            if (window.loadAdminBookList) window.loadAdminBookList();
        }
    } catch (error) {
        console.error('🔴 RestoreBook Error:', error);
    }
};

window.handleHardDeleteBook = async (id) => {
    if (!confirm('⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa VĨNH VIỄN sách này khỏi hệ thống? Hành động này không thể khôi phục!')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:3000/api/books/${id}/hard`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Đã xóa vĩnh viễn sách thành công!');
            if (window.loadAdminBookList) window.loadAdminBookList();
        } else {
            alert('❌ ' + (data.message || 'Lỗi xóa sách'));
        }
    } catch (error) {
        console.error('🔴 HardDeleteBook Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};

// --- BOOK LIST MANAGEMENT ---
window.adminShowDeleted = false;
window.loadAdminBookList = async () => {
    const tableBody = document.getElementById('admin-book-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center">⏳ Đang tải kho sách...</td></tr>';

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/books?show_deleted=${window.adminShowDeleted}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();

        if (result.success) {
            if (result.data.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-gray-500 italic">📭 Kho sách trống.</td></tr>`;
                return;
            }

            tableBody.innerHTML = result.data.map(book => `
                <tr class="hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <td class="px-6 py-4 font-bold text-gray-400 text-xs">#${book.id}</td>
                    <td class="px-6 py-4">
                        ${book.cover_image && book.cover_image.startsWith('http')
                    ? `<img src="${book.cover_image}" alt="cover" class="w-10 h-14 object-cover rounded shadow-sm border border-gray-100">`
                    : `<div class="${book.cover_image || 'bg-navy-900'} w-10 h-14 rounded shadow-sm flex items-center justify-center text-[10px] text-white font-bold border border-gray-200">
                                ${book.title.charAt(0)}
                               </div>`
                }
                    </td>
                    <td class="px-6 py-4">
                        <div class="font-bold text-navy-900 text-sm truncate max-w-[200px]">${book.title}</div>
                        <div class="text-[10px] text-gray-400">${book.author}</div>
                    </td>
                    <td class="px-6 py-4 text-xs text-gray-600">${book.category_name || 'N/A'}</td>
                    <td class="px-6 py-4">
                        <div class="text-xs font-bold ${book.available_count > 0 ? 'text-green-600' : 'text-red-500'}">
                            ${book.available_count} / ${book.total_count}
                        </div>
                    </td>
                    <td class="px-6 py-4 flex gap-2">
                        ${!book.is_deleted ? `
                            <button onclick="window.openEditBookModal(${book.id})" class="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition" title="Sửa thông tin">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            </button>
                            <button onclick="window.handleDeleteBook(${book.id})" class="text-red-400 hover:bg-red-50 p-1.5 rounded transition" title="Xóa sách">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        ` : `
                            <button onclick="window.handleRestoreBook(${book.id})" class="bg-green-50 text-green-600 px-2 py-1 rounded text-[10px] font-bold hover:bg-green-100 transition">Khôi phục</button>
                            <button onclick="window.handleHardDeleteBook(${book.id})" class="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-bold hover:bg-red-100 transition ml-2">Xóa vĩnh viễn</button>
                        `}
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('🔴 LoadAdminBookList Error:', error);
    }
};

window.toggleShowDeleted = () => {
    window.adminShowDeleted = !window.adminShowDeleted;
    const btn = document.getElementById('toggle-deleted-btn');
    if (btn) {
        btn.innerText = window.adminShowDeleted ? '📂 Hiện sách đang bán' : '🗑️ Hiện sách đã ẩn';
        btn.classList.toggle('bg-red-50', window.adminShowDeleted);
        btn.classList.toggle('text-red-600', window.adminShowDeleted);
    }
    window.loadAdminBookList();
};

window.openEditBookModal = async (id) => {
    try {
        const res = await fetch(`http://localhost:3000/api/books/${id}`);
        const result = await res.json();
        if (result.success) {
            const book = result.data;
            const modal = document.getElementById('edit-book-modal');
            const form = document.getElementById('edit-book-form');

            // Điền dữ liệu vào form
            form.title.value = book.title;
            form.author.value = book.author;
            form.published_year.value = book.published_year;
            form.available_count.value = book.available_count;
            form.total_count.value = book.total_count;
            form.description.value = book.description || '';
            form.dataset.bookId = book.id;

            // Load category và chọn đúng
            await window.loadCategoryOptions(book.category_id, 'edit-category-id-select');

            // Preview ảnh hiện tại
            const previewImg = document.getElementById('edit-cover-preview');
            const previewFallback = document.getElementById('edit-cover-fallback');

            if (book.cover_image && book.cover_image.startsWith('http')) {
                previewImg.src = book.cover_image;
                previewImg.classList.remove('hidden');
                previewFallback.classList.add('hidden');
                document.getElementById('edit-cover-name').innerText = 'Ảnh hiện tại (Nhấn để thay đổi)';
            } else {
                previewImg.classList.add('hidden');
                previewFallback.classList.remove('hidden');
                previewFallback.className = `w-12 h-16 rounded shadow-sm flex items-center justify-center text-xs text-white font-bold border border-gray-200 ${book.cover_image || 'bg-navy-900'}`;
                previewFallback.innerText = book.title.charAt(0);
                document.getElementById('edit-cover-name').innerText = 'Chưa có ảnh (Nhấn để tải lên)';
            }

            modal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('🔴 OpenEditModal Error:', error);
    }
};

window.closeRemindInfo = () => document.getElementById('remind-info-modal').classList.add('hidden');

// Unified Image Preview Handler
window.handleImagePreview = (input, previewId, fallbackId, nameId) => {
    const file = input.files[0];
    const preview = document.getElementById(previewId);
    const fallback = document.getElementById(fallbackId);
    const nameText = document.getElementById(nameId);

    if (file) {
        const url = URL.createObjectURL(file);
        preview.src = url;
        preview.classList.remove('hidden');
        if (fallback) fallback.classList.add('hidden');
        if (nameText) nameText.innerText = '📷 ' + file.name;
    }
};

// --- CATEGORY DYNAMIC MANAGEMENT ---

window.loadCategoryOptions = async (selectedId = null, selectId = 'category-id-select') => {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">⏳ Đang tải loại...</option>';

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();

        if (result.success) {
            let options = '<option value="">-- Chọn thể loại --</option>';
            result.data.forEach(cat => {
                options += `<option value="${cat.id}" ${cat.id == selectedId ? 'selected' : ''}>${cat.name}</option>`;
            });
            select.innerHTML = options;
        } else {
            select.innerHTML = '<option value="">❌ Lỗi tải dữ liệu</option>';
        }
    } catch (error) {
        console.error('🔴 LoadCategoryOptions Error:', error);
        select.innerHTML = '<option value="">❌ Lỗi kết nối</option>';
    }
};

window.handleAddCategory = async () => {
    const categoryName = prompt('Nhập tên thể loại mới:');
    if (!categoryName || !categoryName.trim()) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:3000/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: categoryName.trim() })
        });
        const data = await res.json();

        if (data.success) {
            alert(`✅ Đã thêm thể loại: ${categoryName}`);
            await window.loadCategoryOptions(data.data.id);
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('🔴 AddCategory Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};

// --- EXCEL IMPORT MANAGEMENT ---

window.handleExcelFileChange = (event) => {
    const file = event.target.files[0];
    const fileNameEl = document.getElementById('excel-file-name');
    if (file && fileNameEl) {
        fileNameEl.innerText = `📄 ${file.name}`;
        fileNameEl.classList.add('text-indigo-600', 'font-bold');
    }
};

window.handleExcelUpload = async (event) => {
    event.preventDefault();
    const fileInput = document.getElementById('excel-file-input');
    const statusArea = document.getElementById('excel-import-status');
    const resultArea = document.getElementById('excel-import-results');
    const errorLogArea = document.getElementById('excel-error-log');

    if (!fileInput.files[0]) {
        alert('Vui lòng chọn file Excel.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    statusArea.classList.remove('hidden');
    resultArea.classList.add('hidden');

    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:3000/api/books/import-excel', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const result = await res.json();

        statusArea.classList.add('hidden');
        resultArea.classList.remove('hidden');

        if (result.success) {
            const { successCount, failureCount, errors } = result.data;
            document.getElementById('success-count').innerText = successCount;
            document.getElementById('failure-count').innerText = failureCount;

            if (errors.length > 0) {
                errorLogArea.innerHTML = errors.map(err =>
                    `<div class="text-red-500 mb-1">Dòng ${err.row}: ${err.message}</div>`
                ).join('');
                document.getElementById('error-log-container').classList.remove('hidden');
            } else {
                document.getElementById('error-log-container').classList.add('hidden');
            }

            if (successCount > 0) {
                setTimeout(() => {
                    alert('✅ Đã hoàn tất việc nhập dữ liệu!');
                    location.reload();
                }, 2000);
            }
        } else {
            alert('❌ Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('🔴 Excel Upload Error:', error);
        alert('❌ Lỗi kết nối server!');
        statusArea.classList.add('hidden');
    }
};

window.handleRemindAction = async (requestId) => {
    console.log(`🔔 handleRemindAction: ID=${requestId}`);
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:3000/api/borrows/${requestId}/remind`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Đã gửi thông báo nhắc nhở thành công!');
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('🔴 RemindAction Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};

// --- MODALS ---

window.openExcelModal = () => document.getElementById('excel-modal')?.classList.remove('hidden');
window.closeExcelModal = () => {
    document.getElementById('excel-modal')?.classList.add('hidden');
    const fileNameEl = document.getElementById('excel-file-name');
    if (fileNameEl) {
        fileNameEl.innerText = 'Chọn file Excel của bạn';
        fileNameEl.classList.remove('text-indigo-600', 'font-bold');
    }
};
window.openMailModal = () => alert('Tính năng "Giục trả sách" đang được phát triển. Sẽ sớm có ở phiên bản tới! 🚀');
window.openAddBookModal = () => {
    document.getElementById('add-book-modal')?.classList.remove('hidden');
    window.loadCategoryOptions();
};
window.closeAddBookModal = () => document.getElementById('add-book-modal')?.classList.add('hidden');
window.closeEditBookModal = () => document.getElementById('edit-book-modal')?.classList.add('hidden');
window.openReportModal = () => document.getElementById('report-modal')?.classList.remove('hidden');
window.closeReportModal = () => document.getElementById('report-modal')?.classList.add('hidden');

window.handleExportReport = async (type) => {
    console.log(`📊 handleExportReport: Type=${type}`);
    const token = localStorage.getItem('token');
    const typeLabel = type === 'inventory' ? 'Kho sách' : 'Mượn trả';

    try {
        const res = await fetch(`http://localhost:3000/api/reports/${type}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Không thể tải báo cáo');

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `Bao_cao_${type === 'inventory' ? 'Kho_sach' : 'Muon_tra'}_${date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert(`✅ Đã xuất báo cáo ${typeLabel} thành công!`);
        window.closeReportModal();
    } catch (error) {
        console.error('🔴 ExportReport Error:', error);
        alert('❌ Lỗi khi xuất báo cáo. Vui lòng thử lại.');
    }
};
window.openRemindInfo = () => alert('💡 Mẹo: Để giục trả sách, hãy nhấn vào biểu tượng Chuông (🔔) cạnh các cuốn sách "Đang mượn".');

export const AdminDashboard = async () => {
    const token = localStorage.getItem('token');
    let stats = { total_books: 0, active_borrows: 0, pending_requests: 0, total_students: 0 };
    let requestsHtml = '';

    try {
        const statsRes = await fetch('http://localhost:3000/api/stats/summary', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        if (statsData.success) stats = statsData.data;

        const reqsRes = await fetch('http://localhost:3000/api/borrows/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reqsData = await reqsRes.json();

        if (reqsData.success && reqsData.data.length > 0) {
            const activeReqs = reqsData.data.filter(r => r.status === 'pending' || r.status === 'approved');
            if (activeReqs.length === 0) {
                requestsHtml = `<tr><td colspan="6" class="px-6 py-10 text-center text-gray-500 italic">🎉 Không còn yêu cầu nào cần xử lý.</td></tr>`;
            } else {
                requestsHtml = activeReqs.map(req => {
                    let statusBadge = req.status === 'pending'
                        ? '<span class="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold">Chờ duyệt</span>'
                        : '<span class="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">Đang mượn</span>';

                    const fineInfo = req.fine_amount > 0
                        ? `<div class="text-xs font-bold text-red-600">${req.fine_amount.toLocaleString()}đ ${req.is_paid ? '✅' : '❌'}</div>`
                        : '<div class="text-xs text-gray-300">-</div>';

                    return `
                        <tr class="hover:bg-gray-50/50">
                            <td class="px-6 py-4 font-medium text-navy-900">#BR${req.id}</td>
                            <td class="px-6 py-4 text-gray-700">
                                <div class="font-semibold text-xs">${req.full_name || req.username}</div>
                                <div class="text-[10px] text-gray-400">${req.username}</div>
                            </td>
                            <td class="px-6 py-4 text-xs truncate max-w-[150px]">${req.title}</td>
                            <td class="px-6 py-4">${statusBadge}</td>
                            <td class="px-6 py-4">${fineInfo}</td>
                            <td class="px-6 py-4 flex gap-1">
                                ${req.status === 'pending' ? `
                                    <button onclick="window.handleBorrowAction(${req.id}, 'approve')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-[10px] font-bold">Duyệt</button>
                                    <button onclick="window.handleBorrowAction(${req.id}, 'reject')" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-[10px] font-bold">Từ chối</button>
                                ` : ''}
                                ${req.status === 'approved' ? `
                                    <button onclick="window.handleRemindAction(${req.id})" class="bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-1 rounded text-[10px] font-bold">🔔 Nhắc</button>
                                    <button onclick="window.handleBorrowAction(${req.id}, 'return')" class="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded text-[10px] font-bold">Đã trả</button>
                                ` : ''}
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
        setTimeout(() => window.loadAdminBookList(), 50);
    } catch (error) {
        console.error("🔴 Dashboard Error:", error);
    }

    return `
    <div class="animate-fade-in max-w-7xl mx-auto pb-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-5">
            <div>
                <h1 class="text-3xl font-bold text-navy-900 tracking-tight">Quản trị Hệ thống (Admin)</h1>
                <p class="text-gray-500 mt-1">Tổng quan thông số và hoạt động của bạn đọc.</p>
            </div>
            <div class="flex gap-3">
                <button onclick="window.openReportModal()" class="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">Xuất Báo cáo</button>
                <button onclick="window.openAddBookModal()" class="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 shadow-sm flex items-center gap-2"><span>+ Thêm Sách mới</span></button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div class="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">📊</div>
                <div><p class="text-sm font-semibold text-gray-400">Tổng đầu sách</p><h3 class="text-3xl font-bold text-navy-900">${stats.total_books}</h3></div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div class="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600">👥</div>
                <div><p class="text-sm font-semibold text-gray-400">Tổng Sinh viên</p><h3 class="text-3xl font-bold text-navy-900">${stats.total_students}</h3></div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div class="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">🔄</div>
                <div><p class="text-sm font-semibold text-gray-400">Đang mượn</p><h3 class="text-3xl font-bold text-navy-900">${stats.active_borrows}</h3></div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div class="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">⏳</div>
                <div><p class="text-sm font-semibold text-gray-400">Chờ duyệt</p><h3 class="text-3xl font-bold text-navy-900">${stats.pending_requests}</h3></div>
            </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div class="xl:col-span-2 space-y-8">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div class="p-6 border-b border-gray-100 flex items-center justify-between"><h2 class="text-xl font-bold text-navy-800 italic">🎟️ Yêu cầu Mượn</h2></div>
                    <div class="overflow-x-auto"><table class="w-full text-left text-sm whitespace-nowrap"><thead class="bg-gray-50 text-gray-500 font-semibold uppercase text-xs"><tr><th class="px-6 py-4">Mã</th><th class="px-6 py-4">Sinh viên</th><th class="px-6 py-4">Tên Sách</th><th class="px-6 py-4">Trạng thái</th><th class="px-6 py-4">Phạt</th><th class="px-6 py-4">Hành động</th></tr></thead><tbody class="divide-y divide-gray-100">${requestsHtml}</tbody></table></div>
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div class="p-6 border-b border-gray-100 flex items-center justify-between"><h2 class="text-xl font-bold text-navy-800 italic">📚 Quản lý Kho Sách</h2><button id="toggle-deleted-btn" onclick="window.toggleShowDeleted()" class="text-xs font-bold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition">🗑️ Hiện sách đã ẩn</button></div>
                    <div class="overflow-x-auto"><table class="w-full text-left text-sm whitespace-nowrap"><thead class="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider"><tr><th class="px-6 py-3">ID</th><th class="px-6 py-3">Bìa</th><th class="px-6 py-3">Thông tin sách</th><th class="px-6 py-3">Thể loại</th><th class="px-6 py-3">Tồn kho / Tổng</th><th class="px-6 py-3">Thao tác</th></tr></thead><tbody id="admin-book-table-body" class="divide-y divide-gray-50"></tbody></table></div>
                </div>
            </div>
            
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col self-start">
                <h2 class="text-xl font-bold text-navy-800 mb-6 font-serif">Tình trạng Kho Sách</h2>
                <div class="space-y-6">
                    <div>
                        <div class="flex justify-between items-end mb-2">
                            <p class="font-medium text-navy-900">Tính sẵn sàng</p>
                            <p class="text-xl font-bold ${stats.total_books > 0 && (stats.total_books - stats.active_borrows) / stats.total_books < 0.3 ? 'text-red-500' : 'text-green-500'}">
                                ${stats.total_books > 0 ? ( (stats.total_books - stats.active_borrows) / stats.total_books > 0.7 ? 'Tốt' : 'Trung bình' ) : 'Chưa có dữ liệu'}
                            </p>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2.5">
                            <div class="bg-green-500 h-2.5 rounded-full transition-all duration-1000" 
                                 style="width: ${stats.total_books > 0 ? Math.round(((stats.total_books - stats.active_borrows) / stats.total_books) * 100) : 100}%">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-auto bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 class="font-bold text-navy-900 mb-2 border-b border-gray-200 pb-2">Hành động Nhanh</h4>
                    <ul class="space-y-2 mt-3 text-sm">
                        <li><button onclick="window.openExcelModal()" class="text-indigo-600 hover:underline">Nhập sách (Excel)</button></li>
                        <li><button onclick="window.openRemindInfo()" class="text-indigo-600 hover:underline">Giục trả sách</button></li>
                        <li><a href="#/admin/requests" class="text-indigo-600 hover:underline font-bold">Quản lý Phiếu mượn</a></li>
                        <li><a href="#/admin/users" class="text-indigo-600 hover:underline">Quản lý bạn đọc</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <div id="excel-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/40 backdrop-blur-sm hidden animate-fade-in p-4"><div class="bg-white max-w-lg w-full rounded-2xl p-8 relative shadow-2xl"><button onclick="window.closeExcelModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">✕</button><div><h3 class="text-2xl font-bold text-navy-900 mb-1">Nhập sách từ Excel</h3><p class="text-xs text-gray-500 mb-6">Đảm bảo file của bạn đúng định dạng. <a href="http://localhost:3000/api/books/template" class="text-indigo-600 font-bold hover:underline" download>Tải file mẫu tại đây</a></p><form onsubmit="window.handleExcelUpload(event)"><div class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-6 relative"><input type="file" id="excel-file-input" accept=".xlsx, .xls" onchange="window.handleExcelFileChange(event)" class="absolute inset-0 opacity-0 cursor-pointer" required /><p id="excel-file-name" class="text-sm font-bold text-gray-700">Chọn file Excel của bạn</p></div><button type="submit" class="w-full bg-navy-900 text-white font-bold py-3 rounded-xl hover:bg-navy-800 transition shadow-lg">Bắt đầu nhập</button>
                    <!-- Missing Status & Results UI -->
                    <div id="excel-import-status" class="hidden mt-6 text-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                        <p class="text-xs text-gray-400">Đang xử lý yêu cầu...</p>
                    </div>
                    <div id="excel-import-results" class="hidden mt-6">
                        <div class="grid grid-cols-2 gap-2 mb-4">
                            <div class="bg-green-50 p-2 rounded text-center"><p class="text-[9px] text-green-600 font-bold">SUCCESS</p><p id="success-count" class="text-lg font-bold text-green-700">0</p></div>
                            <div class="bg-red-50 p-2 rounded text-center"><p class="text-[9px] text-red-600 font-bold">FAIL</p><p id="failure-count" class="text-lg font-bold text-red-700">0</p></div>
                        </div>
                        <div id="error-log-container" class="hidden max-h-32 overflow-y-auto border border-red-100 rounded p-2 bg-red-50/50">
                            <div id="excel-error-log" class="text-[9px] text-red-600 font-mono"></div>
                        </div>
                    </div>
                </form></div></div></div>

    <div id="add-book-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/40 backdrop-blur-md hidden animate-fade-in p-4 overflow-y-auto"><div class="bg-white max-w-2xl w-full rounded-2xl shadow-3xl overflow-hidden my-auto"><div class="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/30"><h3 class="text-xl font-bold text-indigo-900">Thêm Sách mới</h3><button onclick="window.closeAddBookModal()" class="text-gray-400 hover:text-gray-600 transition">✕</button></div><form onsubmit="window.handleAddBook(event)" class="p-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Tên sách</label><input name="title" required type="text" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none shadow-sm"></div><div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Tác giả</label><input name="author" required type="text" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none shadow-sm"></div><div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Thể loại</label><div class="flex gap-2"><select id="category-id-select" name="category_id" required class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none shadow-sm"></select><button type="button" onclick="window.handleAddCategory()" class="bg-gray-100 text-gray-600 w-11 rounded-xl flex items-center justify-center transition">+</button></div></div><div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Năm xuất bản</label><input name="published_year" type="number" value="2024" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none shadow-sm"></div><div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Sẵn có</label><input name="available_count" required type="number" value="10" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none shadow-sm"></div><div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Tổng cộng</label><input name="total_count" required type="number" value="10" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none shadow-sm"></div>                    <div class="md:col-span-2">
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Ảnh bìa</label>
                        <div class="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-3 relative">
                            <img id="add-cover-preview" src="" class="w-10 h-14 object-cover rounded shadow-sm hidden">
                            <input name="cover_image" type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" 
                                onchange="window.handleImagePreview(this, 'add-cover-preview', null, 'add-cover-name')">
                            <span id="add-cover-name" class="text-sm text-gray-500 font-medium font-serif">Nhấn để chọn ảnh bìa...</span>
                        </div>
                    </div>
<div class="md:col-span-2"><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Mô tả</label><textarea name="description" rows="3" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none shadow-sm"></textarea></div></div><div class="mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-6"><button type="button" onclick="window.closeAddBookModal()" class="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Hủy</button><button type="submit" class="bg-indigo-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg">Lưu</button></div></form></div></div>

    <div id="edit-book-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/40 backdrop-blur-md hidden animate-fade-in p-4 overflow-y-auto"><div class="bg-white max-w-2xl w-full rounded-2xl shadow-3xl overflow-hidden my-auto"><div class="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-amber-50/30"><h3 class="text-xl font-bold text-amber-900">✏️ Sửa thông tin Sách</h3><button onclick="window.closeEditBookModal()" class="text-gray-400 hover:text-gray-600 transition">✕</button></div><form id="edit-book-form" onsubmit="window.handleUpdateBook(event, this.dataset.bookId)" class="p-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Tên sách</label><input name="title" required type="text" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none shadow-sm"></div><div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Tác giả</label><input name="author" required type="text" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none shadow-sm"></div><div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Thể loại</label><select id="edit-category-id-select" name="category_id" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none shadow-sm"></select></div><div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Năm xuất bản</label><input name="published_year" type="number" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none shadow-sm"></div><div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Tồn kho</label><input name="available_count" required type="number" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none shadow-sm"></div><div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Tổng bản</label><input name="total_count" required type="number" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none shadow-sm"></div>                    <div class="md:col-span-2">
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Ảnh bìa</label>
                        <div class="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                            <img id="edit-cover-preview" src="" class="w-12 h-16 object-cover rounded shadow-sm">
                            <div id="edit-cover-fallback" class="w-12 h-16 rounded shadow-sm flex items-center justify-center text-xs text-white font-bold border border-gray-200 hidden"></div>
                            <input name="cover_image" type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" 
                                onchange="window.handleImagePreview(this, 'edit-cover-preview', 'edit-cover-fallback', 'edit-cover-name')">
                            <span id="edit-cover-name" class="text-xs text-gray-500 font-medium italic font-serif">Nhấn để thay đổi ảnh...</span>
                        </div>
                    </div>
<div class="md:col-span-2"><label class="block text-xs font-bold text-gray-400 uppercase mb-1">Mô tả</label><textarea name="description" rows="3" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none shadow-sm"></textarea></div></div><div class="mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-6"><button type="button" onclick="window.closeEditBookModal()" class="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl font-serif">Hủy</button><button type="submit" class="bg-amber-500 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-600 transition shadow-lg">Cập nhật</button></div></form></div></div>

    <!-- Modal Xuất Báo Cáo -->
    <div id="report-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/40 backdrop-blur-sm hidden animate-fade-in p-4">
        <div class="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-gray-100 mx-4">
            <div class="p-8">
                <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6 mx-auto">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m32-2v-2a4 4 0 00-4-4h-0.5a4 4 0 00-4 4v2m-24-4h24M12 3v18"></path></svg>
                </div>
                <h3 class="text-xl font-bold text-navy-900 text-center mb-2">Trung tâm Báo cáo</h3>
                <p class="text-sm text-gray-500 text-center mb-8">Chọn loại dữ liệu bạn muốn kết xuất ra tệp Excel chuyên nghiệp.</p>
                
                <div class="space-y-3">
                    <button onclick="window.handleExportReport('inventory')" class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-100 rounded-xl transition group">
                        <div class="flex items-center gap-3">
                            <span class="text-xl">📚</span>
                            <div class="text-left">
                                <p class="font-bold text-navy-900 text-sm">Báo cáo Kho sách</p>
                                <p class="text-[10px] text-gray-400 font-medium italic">Tồn kho, thể loại, thông tin sách</p>
                            </div>
                        </div>
                        <svg class="w-5 h-5 text-gray-300 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>

                    <button onclick="window.handleExportReport('borrows')" class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-100 rounded-xl transition group">
                        <div class="flex items-center gap-3">
                            <span class="text-xl">🔄</span>
                            <div class="text-left">
                                <p class="font-bold text-navy-900 text-sm">Báo cáo Mượn trả</p>
                                <p class="text-[10px] text-gray-400 font-medium italic">Lịch sử mượn, quá hạn, phí phạt</p>
                            </div>
                        </div>
                        <svg class="w-5 h-5 text-gray-300 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    
                    <button onclick="window.closeReportModal()" class="w-full text-sm font-bold text-gray-400 py-3 mt-4 hover:text-gray-600 transition">Đóng</button>
                </div>
            </div>
        </div>
    </div>
    `;
};
