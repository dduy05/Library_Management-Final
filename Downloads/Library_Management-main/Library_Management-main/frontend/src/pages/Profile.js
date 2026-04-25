window.openPasswordModal = () => document.getElementById('password-modal')?.classList.remove('hidden');
window.closePasswordModal = () => document.getElementById('password-modal')?.classList.add('hidden');

export const Profile = async () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = localStorage.getItem('token');

    let historyHtml = '';
    let totalCount = 0;

    try {
        const res = await fetch('http://localhost:3000/api/borrows/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (result.success && result.data.length > 0) {
            totalCount = result.data.length;
            historyHtml = result.data.map(req => {
                let statusBadge = '';
                let borderClass = 'border-l-gray-300';
                
                if (req.status === 'pending') {
                    statusBadge = '<span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Chờ duyệt</span>';
                    borderClass = 'border-l-yellow-400';
                } else if (req.status === 'approved') {
                    statusBadge = '<span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">Đang mượn</span>';
                    borderClass = 'border-l-indigo-600';
                } else if (req.status === 'returned') {
                    statusBadge = '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Đã trả</span>';
                    borderClass = 'border-l-green-500';
                } else {
                    statusBadge = '<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Từ chối</span>';
                    borderClass = 'border-l-red-500';
                }

                const borrowDate = new Date(req.borrow_date).toLocaleDateString('vi-VN');
                const dueDate = req.due_date ? new Date(req.due_date).toLocaleDateString('vi-VN') : '---';

                return `
                    <tr class="hover:bg-gray-50/50">
                        <td class="px-8 py-4 font-medium text-navy-900 border-l-4 ${borderClass}">${req.title}</td>
                        <td class="px-6 py-4 text-gray-500">${borrowDate}</td>
                        <td class="px-6 py-4 text-gray-900 font-medium">${dueDate}</td>
                        <td class="px-8 py-4 text-right">${statusBadge}</td>
                    </tr>
                `;
            }).join('');
        } else {
            historyHtml = `<tr><td colspan="4" class="px-8 py-10 text-center text-gray-500">Bạn chưa mượn cuốn sách nào.</td></tr>`;
        }
    } catch (error) {
        console.error("Profile Fetch Error:", error);
    }

    return `
    <div class="animate-fade-in max-w-4xl mx-auto pb-10">
        <h1 class="text-3xl font-bold text-navy-900 tracking-tight mb-8">Hồ sơ Cá nhân</h1>
        
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div class="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div class="px-8 pb-8 relative">
                <div class="absolute -top-16 border-4 border-white rounded-full bg-white shadow-md">
                   <img src="https://ui-avatars.com/api/?name=${user?.full_name || user?.username}&background=1E293B&color=fff&size=128" alt="Profile" class="w-28 h-28 rounded-full">
                </div>
                <div class="pt-16 pb-4 flex justify-between items-start">
                   <div>
                      <h2 class="text-2xl font-bold text-navy-900 flex items-center gap-2">${user?.full_name || user?.username} <span class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">${user?.role === 'ADMIN' ? 'Quản trị viên' : 'Sinh viên'}</span></h2>
                      <p class="text-gray-500 mt-1">Username: <span class="font-medium text-gray-800">${user?.username}</span></p>
                   </div>
                   <button onclick="window.openPasswordModal()" class="px-5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-navy-800 rounded-lg text-sm font-medium transition-colors shadow-sm">
                      Đổi mật khẩu
                   </button>
                </div>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                <p class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Sách đang mượn</p>
                <p class="text-3xl font-black text-indigo-600">${totalCount}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                <p class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Cảnh báo trễ hạn</p>
                <p class="text-3xl font-black text-red-500">0</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                <p class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Xếp hạng bạn đọc</p>
                <p class="text-3xl font-black text-green-500">A+</p>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <h3 class="text-lg font-bold text-navy-800">Lịch sử Mượn & Trả sách</h3>
                <span class="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">Tổng: ${totalCount} cuốn</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead class="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                        <tr>
                            <th class="px-8 py-4">Tên Sách</th>
                            <th class="px-6 py-4">Ngày Mượn</th>
                            <th class="px-6 py-4">Hạn Trả</th>
                            <th class="px-8 py-4 text-right">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${historyHtml}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <!-- Modal Đổi Mật Khẩu -->
    <div id="password-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/40 backdrop-blur-sm hidden animate-fade-in p-4">
        <div class="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div class="p-8">
                <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6 mx-auto">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                </div>
                <h3 class="text-xl font-bold text-navy-900 text-center mb-6">Đổi mật khẩu tài khoản</h3>
                
                <form onsubmit="window.handleChangePassword(event)" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Mật khẩu hiện tại</label>
                        <input id="current-password" type="password" required class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Mật khẩu mới</label>
                        <input id="new-password" type="password" required class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Xác nhận mật khẩu mới</label>
                        <input id="confirm-password" type="password" required class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition">
                    </div>
                    
                    <div class="pt-4 flex flex-col gap-2">
                        <button type="submit" class="w-full bg-navy-900 text-white font-bold py-3 rounded-xl hover:bg-navy-800 transition shadow-lg">Xác nhận Đổi</button>
                        <button type="button" onclick="window.closePasswordModal()" class="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition">Hủy bỏ</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
};

window.handleChangePassword = async (event) => {
    event.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const token = localStorage.getItem('token');

    if (newPassword !== confirmPassword) {
        alert('❌ Mật khẩu mới không khớp!');
        return;
    }

    if (newPassword.length < 6) {
        alert('❌ Mật khẩu phải có ít nhất 6 ký tự!');
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/auth/change-password', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Đổi mật khẩu thành công!');
            window.closePasswordModal();
            // Reset form
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('🔴 ChangePassword Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};

window.handleUserPasswordReset = async (userId, username) => {
    const token = localStorage.getItem('token');
    const newPassword = prompt(`Nhập mật khẩu mới cho tài khoản "${username}":`, "123456");
    
    if (newPassword === null) return;
    if (newPassword.trim().length < 6) {
        alert('❌ Mật khẩu phải có ít nhất 6 ký tự!');
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/auth/users/${userId}/reset-password`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newPassword })
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Đã đặt lại mật khẩu thành công!');
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('🔴 ResetPassword Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};
