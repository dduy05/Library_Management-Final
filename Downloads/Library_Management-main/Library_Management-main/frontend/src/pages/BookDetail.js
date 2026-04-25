window.handleReviewSubmit = async (event, bookId) => {
    event.preventDefault();
    console.log('📝 handleReviewSubmit');
    const token = localStorage.getItem('token');
    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;

    try {
        const res = await fetch('http://localhost:3000/api/reviews', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ book_id: bookId, rating: parseInt(rating), comment })
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Cảm ơn bạn đã đóng góp đánh giá!');
            location.reload();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('🔴 Review Submit Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};

export const BookDetail = async (bookId) => {
    let book = null;
    let reviews = [];
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    try {
        const [bookRes, reviewsRes] = await Promise.all([
            fetch(`http://localhost:3000/api/books/${bookId}`).then(r => r.json()),
            fetch(`http://localhost:3000/api/reviews/${bookId}`).then(r => r.json())
        ]);
        if (bookRes.success) book = bookRes.data;
        if (reviewsRes.success) reviews = reviewsRes.data;
    } catch (error) {
        console.error("🔴 Book Detail Fetch Error:", error);
    }

    if (!book) {
        return `<div class="p-10 text-center text-red-500 font-medium bg-red-50 rounded-2xl border border-red-100">Không tìm thấy thông tin sách hoặc lỗi kết nối máy chủ.</div>`;
    }

    const avgRating = parseFloat(book.display_rating || 0).toFixed(1);

    // Xây dựng danh sách Review
    const reviewsHtml = reviews.length > 0 
        ? reviews.map(r => `
            <div class="p-5 bg-gray-50/50 rounded-xl border border-gray-100 mb-4 animate-fade-in">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <img src="https://ui-avatars.com/api/?name=${r.full_name || r.username}&background=random" class="w-8 h-8 rounded-full shadow-sm" />
                        <div>
                            <p class="text-sm font-bold text-navy-900">${r.full_name || r.username}</p>
                            <p class="text-[10px] text-gray-400">${new Date(r.created_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>
                    <div class="flex text-yellow-400">
                        ${Array.from({length: 5}, (_, i) => i < r.rating ? '★' : '☆').join('')}
                    </div>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed pl-10">"${r.comment}"</p>
            </div>
        `).join('')
        : '<p class="text-center text-gray-400 py-10 italic text-sm">Chưa có đánh giá nào cho cuốn sách này. Hãy là người đầu tiên!</p>';

    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);
    const dateStr = defaultDueDate.toISOString().split('T')[0];

    return `
      <div class="animate-fade-in max-w-6xl mx-auto pb-10">
        <nav class="flex text-sm text-gray-500 mb-6">
           <ol class="flex items-center space-x-2">
              <li><a href="#/" class="hover:text-indigo-600 transition">Trang chủ</a></li>
              <li><span>/</span></li>
              <li><a href="#/books" class="hover:text-indigo-600 transition">Sách & Ấn phẩm</a></li>
              <li><span>/</span></li>
              <li class="text-navy-900 font-medium">${book.title}</li>
           </ol>
        </nav>
        
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
           <div class="grid grid-cols-1 md:grid-cols-12">
              <div class="md:col-span-4 bg-gray-50 p-8 flex flex-col items-center border-r border-gray-100">
                 <div class="w-full max-w-[240px] shadow-2xl aspect-[2/3] ${book.cover_image && !book.cover_image.startsWith('http') ? book.cover_image : 'bg-teal-700'} rounded-2xl border border-gray-200 flex items-center justify-center p-6 text-center overflow-hidden relative mb-8 group">
                    ${book.cover_image && book.cover_image.startsWith('http') 
                        ? `<img src="${book.cover_image}" class="absolute inset-0 w-full h-full object-cover" />`
                        : `<span class="text-white font-bold text-3xl z-10 drop-shadow-md leading-tight">${book.title}</span>`
                    }
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                 </div>
                 
                 <div class="w-full space-y-3">
                    <button onclick="window.openBorrowModal()" 
                            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none"
                            ${book.available_count <= 0 ? 'disabled' : ''}>
                       <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                       ${book.available_count > 0 ? 'Mượn cuốn sách này' : 'Hiện đã hết sách'}
                    </button>
                 </div>
              </div>
              
              <div class="md:col-span-8 p-10">
                 <div class="flex flex-wrap items-center gap-3 mb-6">
                    <span class="bg-indigo-100 text-indigo-700 font-bold text-[10px] px-3 py-1 rounded-lg uppercase tracking-widest">${book.category_name || 'Học thuật'}</span>
                    <span class="${book.available_count > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} font-bold text-[10px] px-3 py-1 rounded-lg uppercase tracking-widest">
                        ${book.available_count > 0 ? `Còn ${book.available_count} cuốn trong kho` : 'Tất cả đã được mượn'}
                    </span>
                 </div>
                 
                 <h1 class="text-5xl font-black text-navy-900 leading-tight mb-4 tracking-tight">${book.title}</h1>
                 <div class="flex items-center gap-4 mb-8">
                    <p class="text-lg text-gray-500">Bởi <span class="text-indigo-600 font-bold hover:underline cursor-pointer">${book.author}</span></p>
                    <div class="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    <div class="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
                        <span class="text-sm font-bold text-yellow-700">${avgRating}</span>
                        <span class="text-yellow-400">★</span>
                        <span class="text-xs text-gray-400">(${reviews.length} đánh giá)</span>
                    </div>
                 </div>
                 
                 <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-gray-100 mb-8">
                    <div>
                        <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Xuất bản</p>
                        <p class="font-bold text-navy-900">${book.published_year || '2024'}</p>
                    </div>
                    <div>
                        <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Mã Lưu Kho</p>
                        <p class="font-bold text-navy-900 italic">BK-${book.id.toString().padStart(4, '0')}</p>
                    </div>
                    <div>
                        <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Ngôn ngữ</p>
                        <p class="font-bold text-navy-900">Vietnamese</p>
                    </div>
                    <div>
                        <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Tổng bản</p>
                        <p class="font-bold text-navy-900">${book.total_count} cuốn</p>
                    </div>
                 </div>
                 
                 <div class="mb-10">
                    <h3 class="text-xl font-black text-navy-900 mb-4 flex items-center gap-2">
                        <svg class="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                        Tóm tắt nội dung
                    </h3>
                    <p class="text-gray-600 leading-relaxed text-lg">
                       ${book.description || 'Cuốn sách này cung cấp cái nhìn sâu sắc về chủ đề chuyên môn, giúp độc giả nắm vững định hướng và kỹ năng cần thiết.'}
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div class="lg:col-span-2">
                <h3 class="text-2xl font-black text-navy-900 mb-6 flex items-center gap-2">
                    <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                    Đánh giá từ độc giả
                </h3>
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    ${reviewsHtml}
                </div>
            </div>

            <div>
                <h3 class="text-2xl font-black text-navy-900 mb-6 flex items-center gap-2">Gửi đánh giá</h3>
                ${token ? `
                    <div class="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl shadow-indigo-100">
                        <p class="text-sm mb-4 text-indigo-200">Chia sẻ cảm nhận của bạn về cuốn sách để giúp người đọc sau nhé!</p>
                        <form onsubmit="window.handleReviewSubmit(event, ${book.id})" class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold uppercase text-indigo-300 mb-2">Số sao (1-5)</label>
                                <select id="review-rating" class="w-full bg-navy-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500">
                                    <option value="5">★★★★★ (5 sao)</option>
                                    <option value="4">★★★★☆ (4 sao)</option>
                                    <option value="3">★★★☆☆ (3 sao)</option>
                                    <option value="2">★★☆☆☆ (2 sao)</option>
                                    <option value="1">★☆☆☆☆ (1 sao)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase text-indigo-300 mb-2">Bình luận</label>
                                <textarea id="review-comment" rows="4" placeholder="Viết cảm nghĩ của bạn tại đây... (Tối thiểu 10 ký tự)" class="w-full bg-navy-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 text-sm"></textarea>
                            </div>
                            <button type="submit" class="w-full bg-white text-indigo-900 font-black py-4 rounded-xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95">Gửi đánh giá</button>
                        </form>
                    </div>
                ` : `
                    <div class="bg-gray-100 p-8 rounded-3xl text-center border-2 border-dashed border-gray-200">
                        <p class="text-gray-500 text-sm">Vui lòng đăng nhập và đã từng mượn sách để gửi đánh giá.</p>
                        <a href="#/login" class="inline-block mt-4 text-indigo-600 font-bold hover:underline">Đăng nhập ngay ➔</a>
                    </div>
                `}
            </div>
        </div>
        
        <!-- Modal Xác nhận Mượn -->
        <div id="borrow-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/40 backdrop-blur-sm hidden animate-fade-in p-4">
           <div class="bg-white max-w-sm w-full rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div class="px-6 py-5 bg-indigo-50/50 flex items-center justify-between">
                 <h3 class="text-lg font-black text-indigo-700">Đăng ký mượn</h3>
                 <button onclick="window.closeBorrowModal()" class="text-gray-400 hover:text-gray-600 transition">✕</button>
              </div>
              <div class="p-8">
                 <div class="mb-6">
                    <label class="block text-[10px] font-black uppercase text-gray-400 mb-2">Ngày dự kiến trả sách</label>
                    <input type="date" id="borrow-due-date" value="${dateStr}" class="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition text-sm font-bold">
                 </div>
                 <div class="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-xs leading-relaxed border border-indigo-100 mb-8">
                    📌 <strong>Lưu ý:</strong> Bạn có 24H để đến lấy sách trực tiếp tại quầy thư viện sau khi yêu cầu được duyệt.
                 </div>
                 <button onclick="window.handleConfirmBorrow(${book.id})" class="w-full bg-indigo-600 text-white py-4 rounded-xl text-sm font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-200">Xác nhận Đăng ký</button>
              </div>
           </div>
        </div>
      </div>
    `;
};
