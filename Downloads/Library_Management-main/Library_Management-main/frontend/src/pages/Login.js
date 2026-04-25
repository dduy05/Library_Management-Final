
window.togglePassword = () => {
   const input = document.getElementById('login-password');
   const icon = document.getElementById('eye-icon');
   if (input.type === 'password') {
      input.type = 'text';
      icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />`;
   } else {
      input.type = 'password';
      icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
   }
};

window.handleLogin = async (event) => {
   event.preventDefault();
   const username = document.getElementById('login-username').value;
   const password = document.getElementById('login-password').value;

   try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
         // Lưu thông tin vào storage
         localStorage.setItem('token', data.token);
         localStorage.setItem('user', JSON.stringify(data.user));

         // Chuyển hướng
         if (data.user.role === 'ADMIN') {
            window.location.hash = '#/admin';
         } else {
            window.location.hash = '#/books';
         }
      } else {
         alert('❌ ' + (data.message || 'Sai thông tin đăng nhập!'));
      }
   } catch (error) {
      console.error(error);
      alert('❌ Lỗi kết nối máy chủ!');
   }
};

export const Login = () => `
  <div class="h-screen w-full flex bg-white absolute inset-0 z-50">
    <!-- Left Column (Form) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white relative">
       <!-- Nút Back tạm thời (Vì SPA routing) -->
       <a href="#/" class="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <span class="text-sm font-medium">Trang chủ</span>
       </a>
       
       <div class="max-w-md w-full animate-fade-in">
          <div class="flex items-center gap-3 mb-8">
             <span class="text-indigo-600 text-3xl">📚</span>
             <span class="text-2xl font-bold text-navy-900">Library App</span>
          </div>
          
          <h2 class="text-3xl font-bold text-navy-900 mb-2">Đăng nhập tài khoản</h2>
          <p class="text-gray-500 mb-8">Chào mừng bạn quay lại hệ thống quản lý thư viện.</p>
          
          <form class="space-y-5" onsubmit="window.handleLogin(event)">
             <div>
                <label class="block text-sm font-medium text-navy-700 mb-1">Mã sinh viên / Username</label>
                <input id="login-username" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" placeholder="Ví dụ: student1 hoặc admin" required>
             </div>
             <div>
                <div class="flex justify-between items-center mb-1">
                   <label class="block text-sm font-medium text-navy-700">Mật khẩu</label>
                </div>
                <div class="relative">
                   <input id="login-password" type="password" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition pr-12" placeholder="••••••••" required>
                   <button type="button" onclick="window.togglePassword()" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors">
                      <svg id="eye-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                   </button>
                </div>
             </div>
             
             <div class="flex items-center">
                <input type="checkbox" id="remember" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <label for="remember" class="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</label>
             </div>
             
             <button type="submit" class="w-full bg-navy-900 text-white font-medium py-3 rounded-lg hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-600/20 mt-4">
                Đăng nhập
             </button>
          </form>
          
          <p class="text-center text-gray-500 mt-8 text-sm">
             Chưa có tài khoản? <a href="#/register" class="text-indigo-600 font-semibold hover:underline">Đăng ký thành viên</a>
          </p>
       </div>
    </div>
    
    <!-- Right Column (Image/Branding) -->
    <div class="hidden lg:flex w-1/2 bg-navy-50 relative items-center justify-center overflow-hidden">
       <div class="absolute inset-0 bg-indigo-600 opacity-5 pattern-diagonal-lines"></div>
       <div class="relative z-10 max-w-lg p-12 text-center">
          <div class="w-80 h-80 mx-auto bg-white rounded-3xl shadow-xl flex items-center justify-center p-4 mb-8 rotate-3 hover:rotate-0 transition-transform duration-500 border border-gray-100">
             <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop" alt="Library Illustration" class="w-full h-full object-cover rounded-2xl">
          </div>
          <h3 class="text-2xl font-bold text-navy-900 mb-3">Thư viện Hiện đại</h3>
          <p class="text-gray-600">Truy cập hàng ngàn đầu sách kỹ thuật, văn học và tài liệu học thuật hoàn toàn miễn phí.</p>
       </div>
    </div>
    
  </div>
`;
