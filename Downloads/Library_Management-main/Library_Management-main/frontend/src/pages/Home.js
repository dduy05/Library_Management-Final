export const Home = async () => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const user = userStr ? JSON.parse(userStr) : null;
  const displayName = user ? (user.full_name || user.username) : 'Sinh viên';

  let stats = { borrowed_count: 0, overdue_count: 0, history_count: 0, unpaid_fines: 0 };
  
  if (token) {
    try {
      const res = await fetch('http://localhost:3000/api/stats/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) stats = result.data;
    } catch (error) {
      console.error('🔴 Home Stats Error:', error);
    }
  }

  return `
  <div class="animate-fade-in max-w-6xl mx-auto pb-10">
    <div class="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-navy-900 tracking-tight">Chào mừng, ${displayName}</h1>
        <p class="text-gray-500 mt-1">Nắm bắt hoạt động thư viện cá nhân của bạn.</p>
      </div>
      <a href="#/books" class="inline-flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm shadow-indigo-200 transition-colors gap-2">
        <span>+ Mượn sách ngay</span>
      </a>
    </div>

    <!-- Stats Dashboard -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Đang mượn -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all">
         <div>
            <p class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Đang mượn</p>
            <h3 class="text-4xl font-bold text-navy-900 mt-1">${stats.borrowed_count} <span class="text-lg font-normal text-gray-400">quyển</span></h3>
         </div>
         <div class="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
         </div>
      </div>
      <!-- Quá hạn / Phạt -->
      <div class="${stats.overdue_count > 0 || stats.unpaid_fines > 0 ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 text-white shadow-md hover:shadow-red-500/30' : 'bg-white border-gray-100 text-navy-900'} p-6 rounded-2xl shadow-sm border flex items-center justify-between group cursor-pointer transition-all">
         <div>
            <p class="text-sm font-semibold ${stats.overdue_count > 0 || stats.unpaid_fines > 0 ? 'text-red-100' : 'text-gray-400'} uppercase tracking-wider">Quá hạn & Tiền phạt</p>
            <h3 class="text-4xl font-bold mt-1">${stats.overdue_count} <span class="text-lg font-normal ${stats.overdue_count > 0 || stats.unpaid_fines > 0 ? 'text-red-200' : 'text-gray-400'}">quyển</span></h3>
            ${stats.unpaid_fines > 0 ? `<p class="text-sm font-bold mt-1">Phạt: ${stats.unpaid_fines.toLocaleString()}đ</p>` : ''}
         </div>
         <div class="w-14 h-14 ${stats.overdue_count > 0 || stats.unpaid_fines > 0 ? 'bg-white/20 backdrop-blur-sm shadow-inner' : 'bg-red-50'} rounded-full flex items-center justify-center ${stats.overdue_count > 0 || stats.unpaid_fines > 0 ? 'text-white' : 'text-red-500'} group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
         </div>
      </div>
      <!-- Thành tích -->
      <a href="#/history" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-green-300 hover:shadow-md transition-all">
         <div>
            <p class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Lịch sử đọc</p>
            <h3 class="text-4xl font-bold text-navy-900 mt-1">${stats.history_count} <span class="text-lg font-normal text-gray-400">lần</span></h3>
         </div>
         <div class="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"></path></svg>
         </div>
      </a>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[300px]">
         <div class="text-center">
            <div class="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-navy-900">Khám phá tri thức mới</h3>
            <p class="text-gray-500 mt-2 max-w-xs mx-auto">Hàng ngàn đầu sách đang chờ đón bạn. Hãy bắt đầu hành trình đọc sách ngay hôm nay.</p>
            <a href="#/books" class="mt-6 inline-block bg-navy-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-navy-800 transition shadow-lg">Mở kho sách</a>
         </div>
      </div>

      <!-- Thông báo -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
         <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-navy-800">Thông báo</h2>
         </div>
         <div class="space-y-6 relative before:absolute before:inset-0 before:ml-[7px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent pl-8">
            <div class="relative w-full">
               <div class="absolute w-4 h-4 bg-indigo-600 rounded-full left-[-2rem] top-1 shadow-[0_0_0_4px_#fff]"></div>
               <p class="text-xs font-semibold text-indigo-600 mb-1">Cập nhật hệ thống</p>
               <h4 class="text-sm font-bold text-navy-900 leading-tight">Chế độ chặn mượn sách</h4>
               <p class="text-sm text-gray-500 mt-1">Từ nay, sinh viên có sách quá hạn hoặc chưa nộp phạt sẽ không thể mượn sách mới.</p>
            </div>
            
            <div class="relative w-full">
               <div class="absolute w-4 h-4 bg-red-500 rounded-full left-[-2rem] top-1 shadow-[0_0_0_4px_#fff]"></div>
               <p class="text-xs font-semibold text-red-500 mb-1">Lưu ý</p>
               <h4 class="text-sm font-bold text-navy-900 leading-tight">Phạt trả muộn</h4>
               <p class="text-sm text-gray-500 mt-1">Mức phạt 5,000 VND / ngày được áp dụng tự động cho mọi đầu sách.</p>
            </div>
         </div>
      </div>
    </div>
  </div>
  `;
};
