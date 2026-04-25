window.toggleRegisterPassword = (inputId, iconId) => {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />`;
    } else {
        input.type = 'password';
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
    }
};

window.handleRegister = async (event) => {
    event.preventDefault();
    const fullname = document.getElementById('reg-fullname').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('❌ Mật khẩu xác nhận không khớp!');
        return;
    }
    
    try {
        // Gọi API Backend đăng ký tài khoản (sẽ được thêm bên server.js)
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, full_name: fullname })
        });
        const data = await res.json();
        
        if (data.success) {
            alert('✅ Đăng ký thành công! Đang chuyển hướng đến trang Đăng Nhập...');
            window.location.hash = '#/login';
        } else {
            alert('❌ ' + (data.message || 'Lỗi khi đăng ký khoản!'));
        }
    } catch (error) {
        console.error(error);
        alert('❌ Lỗi kết nối đến máy chủ API!');
    }
};

export const Register = () => `
  <div class="h-screen w-full flex bg-white absolute inset-0 z-50 overflow-y-auto">
    <!-- Left Column (Form) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white relative my-auto">
       <a href="#/" class="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <span class="text-sm font-medium">Trang chủ</span>
       </a>
       
       <div class="max-w-md w-full animate-fade-in mt-16 md:mt-0">
          <div class="flex items-center gap-3 mb-6">
             <span class="text-indigo-600 text-3xl">📝</span>
             <span class="text-2xl font-bold text-navy-900">Tạo tài khoản mới</span>
          </div>
          
          <p class="text-gray-500 mb-8">Gia nhập cộng đồng sinh viên yêu sách ngay hôm nay.</p>
          
          <form class="space-y-4" onsubmit="window.handleRegister(event)">
             <div>
                <label class="block text-sm font-medium text-navy-700 mb-1">Họ và Tên</label>
                <input id="reg-fullname" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" placeholder="Ví dụ: Nguyễn Văn A" required>
             </div>
             
             <div>
                <label class="block text-sm font-medium text-navy-700 mb-1">Tài khoản (Mã sinh viên)</label>
                <input id="reg-username" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" placeholder="Ví dụ: 2026xxxx" required>
             </div>
             
             <div>
                <label class="block text-sm font-medium text-navy-700 mb-1">Mật khẩu</label>
                <div class="relative">
                   <input id="reg-password" type="password" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition pr-12" placeholder="••••••••" required>
                   <button type="button" onclick="window.toggleRegisterPassword('reg-password', 'reg-eye-1')" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors">
                      <svg id="reg-eye-1" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                   </button>
                </div>
             </div>
             
             <div>
                <label class="block text-sm font-medium text-navy-700 mb-1">Xác nhận mật khẩu</label>
                <div class="relative">
                   <input id="reg-confirm-password" type="password" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition pr-12" placeholder="••••••••" required>
                   <button type="button" onclick="window.toggleRegisterPassword('reg-confirm-password', 'reg-eye-2')" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors">
                      <svg id="reg-eye-2" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                   </button>
                </div>
             </div>
             
             <button type="submit" class="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 mt-6 block">
                Đăng ký ngay
             </button>
          </form>
          
          <p class="text-center text-gray-500 mt-8 text-sm">
             Đã có tài khoản? <a href="#/login" class="text-indigo-600 font-semibold hover:underline">Về trang đăng nhập</a>
          </p>
       </div>
    </div>
    
    <!-- Right Column (Image/Branding) -->
    <div class="hidden lg:flex w-1/2 bg-indigo-50 relative items-center justify-center overflow-hidden">
       <div class="absolute inset-0 bg-indigo-600 opacity-5 pattern-dots"></div>
       <div class="relative z-10 max-w-lg p-12 text-center">
          <div class="w-80 h-80 mx-auto bg-white rounded-3xl shadow-xl flex items-center justify-center p-4 mb-8 hover:scale-105 transition-transform duration-500 border border-indigo-100">
             <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000&auto=format&fit=crop" alt="Register Illustration" class="w-full h-full object-cover rounded-2xl">
          </div>
          <h3 class="text-2xl font-bold text-navy-900 mb-3">Chìa khoá tri thức</h3>
          <p class="text-gray-600">Thủ tục siêu tốc để tiếp cận ngay hàng ngàn tư liệu số độc quyền đang chờ đón bạn.</p>
       </div>
    </div>
  </div>
`;
