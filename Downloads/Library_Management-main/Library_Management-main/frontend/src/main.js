import './style.css';

// Global Event Handler Error Catching
window.addEventListener('error', (event) => {
    console.error('🔴 Global Error:', event.error);
});

window.handleLogout = () => {
    console.log('🚪 handleLogout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.hash = '#/login';
};

// Import Pages
import { Home } from './pages/Home.js';
import { Login } from './pages/Login.js';
import { Books } from './pages/Books.js';
import { Profile } from './pages/Profile.js';
import { BookDetail } from './pages/BookDetail.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { Register } from './pages/Register.js';
import { UserManagement } from './pages/UserManagement.js';
import { BorrowRequests } from './pages/BorrowRequests.js';
import { History } from './pages/History.js';

// 1. Pages HTML Map
const Pages = {
  '/': Home,
  '/login': Login,
  '/register': Register,
  '/books': Books,
  '/profile': Profile,
  '/admin': AdminDashboard,
  '/admin/users': UserManagement,
  '/admin/requests': BorrowRequests,
  '/history': History
};

// 2. Routing Menu
const menuItems = [
  { text: 'Trang chủ', path: '/', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>' },
  { text: 'Sách & Ấn phẩm', path: '/books', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>' },
  { text: 'Đăng nhập', path: '/login', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>' },
  { text: 'Hồ sơ cá nhân', path: '/profile', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>' },
  { text: 'Quản trị (Admin)', path: '/admin', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>' }
];

// 3. Hệ thống JS Router
function renderMenu(currentPath) {
  try {
    const menuContainer = document.getElementById('sidebar-menu');
    if (!menuContainer) return;

    const sidebarEl = document.querySelector('aside');
    const headerEl = document.querySelector('header');
    const mainWrapperEl = document.getElementById('app-content');

    const userStr = localStorage.getItem('user');
    let user = null;
    try { 
        user = userStr ? JSON.parse(userStr) : null; 
    } catch(e) { 
        console.error('🔴 Storage parse error:', e); 
    }
    
    const userRole = user ? (user.role || 'GUEST') : 'GUEST';
    const isAuthPage = currentPath === '/login' || currentPath === '/register';

    if (isAuthPage) {
       if(sidebarEl) sidebarEl.style.display = 'none';
       if(headerEl) headerEl.style.display = 'none';
       if(mainWrapperEl) {
           mainWrapperEl.classList.remove('p-6', 'md:p-8');
           mainWrapperEl.classList.add('px-0', 'py-0');
       }
    } else {
       if(sidebarEl) sidebarEl.style.display = 'flex';
       if(headerEl) headerEl.style.display = 'flex';
       if(mainWrapperEl) {
           mainWrapperEl.classList.add('p-6', 'md:p-8');
           mainWrapperEl.classList.remove('px-0', 'py-0');
       }

       // --- FIX: Cập nhật thông tin User trên Topbar ---
       const userNameEl = document.querySelector('header .text-sm.font-semibold');
       const userRoleEl = document.querySelector('header .text-xs.text-gray-400');
       const profileImgEl = document.querySelector('header img');

       if (user) {
           if (userNameEl) userNameEl.innerText = user.full_name || user.username;
           if (userRoleEl) userRoleEl.innerText = user.role === 'ADMIN' ? 'Quản trị viên' : 'Sinh viên/Bạn đọc';
           if (profileImgEl) profileImgEl.src = `https://ui-avatars.com/api/?name=${user.full_name || user.username}&background=2E3192&color=fff`;
       } else {
           // Nếu là Khách (Guest), reset về mặc định
           if (userNameEl) userNameEl.innerText = 'Khách';
           if (userRoleEl) userRoleEl.innerText = 'Vui lòng đăng nhập';
           if (profileImgEl) profileImgEl.src = `https://ui-avatars.com/api/?name=Guest&background=E2E8F0&color=475569`;
       }
    }

    // --- FIX: Lọc menu theo role & trạng thái đăng nhập ---
    const allowedMenuItems = menuItems.filter(item => {
        // Ẩn Admin nếu không phải ADMIN
        if (item.path === '/admin' && userRole !== 'ADMIN') return false;
        // Ẩn Đăng nhập nếu đã login
        if (item.path === '/login' && userRole !== 'GUEST') return false;
        // Ẩn Hồ sơ & Lịch sử nếu chưa login (Guest)
        if ((item.path === '/profile' || item.path === '/history') && userRole === 'GUEST') return false;
        return true;
    });

    menuContainer.innerHTML = allowedMenuItems.map(item => {
      const isActive = currentPath === item.path;
      return `
        <a href="#${item.path}" 
           class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                    : 'text-navy-300 hover:bg-navy-800 hover:text-white group'}">
          <span class="${isActive ? 'text-indigo-200' : 'text-navy-400 group-hover:text-white'}">${item.icon}</span>
          <span class="font-medium text-sm">${item.text}</span>
        </a>
      `;
    }).join('');

    // Nút đăng xuất (Logout) cuối sidebar
    if (userRole !== 'GUEST') {
        menuContainer.innerHTML += `
          <div class="mt-auto pt-4 border-t border-navy-800">
              <a href="#" onclick="window.handleLogout()" class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-red-400 hover:bg-navy-800 hover:text-red-300 group">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  <span class="font-medium text-sm">Đăng xuất (${user.username})</span>
              </a>
          </div>
        `;
    }
  } catch (err) {
    console.error('🔴 Menu Render Error:', err);
  }
}

// --- Notification Global Handlers ---
window.toggleNotifications = () => {
    const popover = document.getElementById('notification-popover');
    if (popover) popover.classList.toggle('hidden');
    if (!popover.classList.contains('hidden')) {
        window.fetchNotifications();
    }
};

window.fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch('http://localhost:3000/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
            const list = document.getElementById('notification-list');
            const dot = document.getElementById('notification-dot');
            
            const unreadCount = result.data.filter(n => !n.is_read).length;
            if (unreadCount > 0) {
                dot.classList.remove('hidden');
            } else {
                dot.classList.add('hidden');
            }

            if (result.data.length === 0) {
                list.innerHTML = '<div class="p-8 text-center text-gray-400 text-xs">Bạn chưa có thông báo nào.</div>';
            } else {
                list.innerHTML = result.data.map(n => `
                    <div class="p-4 hover:bg-gray-50 border-l-4 ${n.is_read ? 'border-transparent' : 'border-indigo-600 bg-indigo-50/30'} cursor-pointer transition-colors"
                         onclick="window.markNotificationRead(${n.id})">
                        <p class="text-xs text-gray-700 leading-snug">${n.message}</p>
                        <span class="text-[9px] text-gray-400 block mt-1">${new Date(n.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error('🔴 Notification Fetch Error:', err);
    }
};

window.markNotificationRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
        await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        window.fetchNotifications();
    } catch (err) {
        console.error('🔴 Mark Read Error:', err);
    }
};

window.markAllNotificationsRead = async () => {
    const token = localStorage.getItem('token');
    try {
        await fetch('http://localhost:3000/api/notifications/read-all', {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        window.fetchNotifications();
    } catch (err) {
        console.error('🔴 Mark All Read Error:', err);
    }
};

async function router() {
  const contentArea = document.getElementById('app-content');
  if(!contentArea) return;

  const path = (window.location.hash.slice(1) || '/').trim();
  console.log('🧭 Routing to:', path);
  
  const userStr = localStorage.getItem('user');
  let user = null;
  try { user = userStr ? JSON.parse(userStr) : null; } catch(e) {}
  const userRole = user ? user.role : 'GUEST';

  // [NOTIFICATION POLL] Kiểm tra thông báo mỗi khi đổi trang
  if (userRole !== 'GUEST') window.fetchNotifications();

  // Guard tuyến đường
  if (path.startsWith('/admin') && userRole !== 'ADMIN') {
      window.location.hash = '#/';
      return;
  }
  if (path === '/profile' && userRole === 'GUEST') {
      window.location.hash = '#/login';
      return;
  }
  
  let PageFactory;
  let params = null;

  if (path.startsWith('/book/')) {
      params = path.split('/')[2];
      PageFactory = BookDetail;
  } else {
      PageFactory = Pages[path];
  }
  
  try {
    if (PageFactory) {
        contentArea.innerHTML = '<div class="flex items-center justify-center h-48"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>';
        const html = await PageFactory(params);
        contentArea.innerHTML = html;
    } else {
        contentArea.innerHTML = `
          <div class="flex flex-col items-center justify-center py-20 text-center">
              <h2 class="text-6xl font-bold text-navy-200 mb-2">404</h2>
              <p class="text-gray-500 text-lg mb-6">Trang "${path}" không tồn tại.</p>
              <a href="#/" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium">Về Trang chủ</a>
          </div>
        `;
    }
  } catch (err) {
    console.error('🔴 Router execution error:', err);
    contentArea.innerHTML = `<div class="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">Đã xảy ra lỗi khi tải trang: ${err.message}</div>`;
  }
  
  renderMenu(path);
}

// 4. Bắt sự kiện
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => {
    router();
    // Gắn sự kiện cho chuông thông báo
    const bell = document.getElementById('notification-bell');
    if (bell) bell.addEventListener('click', (e) => {
        e.stopPropagation();
        window.toggleNotifications();
    });
    
    // Đóng popover khi click ra ngoài
    document.addEventListener('click', () => {
        const popover = document.getElementById('notification-popover');
        if (popover) popover.classList.add('hidden');
    });
});
router(); // Chạy ngay lần đầu
