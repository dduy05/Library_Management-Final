window.handleUserRoleChange = async (userId) => {
    console.log(`👤 handleUserRoleChange: UserID=${userId}`);
    const role = document.getElementById(`role-select-${userId}`).value;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`http://localhost:3000/api/auth/users/${userId}/role`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role })
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Cập nhật quyền hạn thành công!');
            location.reload();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('🔴 RoleChange Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};

window.handleUserStatusToggle = async (userId, currentStatus) => {
    console.log(`🔒 handleUserStatusToggle: UserID=${userId}, Status=${currentStatus}`);
    const token = localStorage.getItem('token');
    const newStatus = !currentStatus;

    if (!confirm(`Bạn có chắc muốn ${newStatus ? 'MỞ KHÓA' : 'KHÓA'} tài khoản này?`)) return;

    try {
        const res = await fetch(`http://localhost:3000/api/auth/users/${userId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ is_active: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Cập nhật trạng thái thành công!');
            location.reload();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('🔴 StatusToggle Error:', error);
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

window.handleUserSearch = (event) => {
    const query = event.target.value.toLowerCase();
    const userRows = document.querySelectorAll('.user-row');
    
    userRows.forEach(row => {
        const name = row.getAttribute('data-name').toLowerCase();
        const username = row.getAttribute('data-username').toLowerCase();
        
        if (name.includes(query) || username.includes(query)) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden', 'antigravity-hidden-row'); // Adding helper class
        }
    });

    const hiddenRows = document.querySelectorAll('.user-row.hidden').length;
    const totalRows = userRows.length;
    const noResults = document.getElementById('no-results-row');
    
    if (hiddenRows === totalRows && totalRows > 0) {
        noResults?.classList.remove('hidden');
    } else {
        noResults?.classList.add('hidden');
    }
};

export const UserManagement = async () => {
    const token = localStorage.getItem('token');
    let usersHtml = '';

    try {
        const response = await fetch('http://localhost:3000/api/auth/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            usersHtml = result.data.map(user => `
                <tr class="user-row hover:bg-gray-50/50 transition-colors" data-name="${user.full_name || ''}" data-username="${user.username}">
                    <td class="px-6 py-4 font-medium text-navy-900 flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                            ${user.full_name ? user.full_name.substring(0, 2) : '??'}
                        </div>
                        <span class="truncate max-w-[150px]">${user.full_name || 'Chưa cập nhật'}</span>
                    </td>
                    <td class="px-6 py-4 text-gray-700 font-mono text-xs">${user.username}</td>
                    <td class="px-6 py-4">
                        <select id="role-select-${user.id}" onchange="window.handleUserRoleChange(${user.id})" class="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200">
                            <option value="STUDENT" ${user.role === 'STUDENT' ? 'selected' : ''}>STUDENT</option>
                            <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
                        </select>
                    </td>
                    <td class="px-6 py-4">
                        ${user.is_active 
                            ? `<span class="text-green-600 flex items-center gap-1.5 text-sm font-medium"><div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Hoạt động</span>`
                            : `<span class="text-red-500 flex items-center gap-1.5 text-sm font-medium"><div class="w-1.5 h-1.5 rounded-full bg-red-400"></div> Đang Khóa</span>`
                        }
                    </td>
                    <td class="px-6 py-4 text-right flex justify-end gap-1">
                        <button onclick="window.handleUserPasswordReset(${user.id}, '${user.username}')" 
                                class="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Đặt lại mật khẩu">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                        </button>
                        <button onclick="window.handleUserStatusToggle(${user.id}, ${user.is_active})" 
                                class="p-2 rounded-lg transition-all ${user.is_active ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-green-400 hover:bg-green-50 hover:text-green-600'}" title="${user.is_active ? 'Khóa tài khoản' : 'Mở khóa'}">
                            ${user.is_active 
                                ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>'
                                : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>'
                            }
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            usersHtml = `<tr><td colspan="5" class="px-6 py-12 text-center text-gray-500 bg-gray-50">Hệ thống chưa có người dùng khác.</td></tr>`;
        }
    } catch (error) {
        console.error("🔴 UserManagement Error:", error);
    }

    return `
    <style>
        .antigravity-hidden-row { display: none !important; }
    </style>
    <div class="animate-fade-in max-w-7xl mx-auto pb-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-5">
            <div>
                <h1 class="text-3xl font-bold text-navy-900 tracking-tight">Quản lý Bạn đọc & Quyền</h1>
                <p class="text-gray-500 mt-1">Quản trị trạng thái hoạt động và quyền hạn của toàn bộ tài khoản.</p>
            </div>
            <div class="flex gap-3">
                <a href="#/admin" class="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Quay lại Dashboard
                </a>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between gap-4">
                <div class="relative flex-1 max-w-sm">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input type="text" oninput="window.handleUserSearch(event)" placeholder="Tìm kiếm theo Tên hoặc Tài khoản..." class="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm">
                </div>
                <div class="text-xs text-gray-400 font-medium">
                    🔍 Đang theo dõi thời gian thực
                </div>
            </div>

            <div class="overflow-x-auto min-h-[300px]">
                <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead class="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                        <tr>
                            <th class="px-6 py-4">Họ và Tên</th>
                            <th class="px-6 py-4">Tài khoản (Mã SV)</th>
                            <th class="px-6 py-4">Vai trò (Role)</th>
                            <th class="px-6 py-4">Trạng thái</th>
                            <th class="px-6 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100" id="users-table-body">
                        ${usersHtml}
                        <tr id="no-results-row" class="hidden">
                            <td colspan="5" class="px-6 py-12 text-center text-gray-500 bg-gray-50">
                                🚫 Không tìm thấy sinh viên nào khớp với từ khóa tìm kiếm.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;
};
