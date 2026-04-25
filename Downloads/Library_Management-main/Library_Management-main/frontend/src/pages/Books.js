window.handleBorrow = async (bookId) => {
    console.log(`📚 handleBorrow called: ID=${bookId}`);
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để mượn sách!');
        window.location.hash = '#/login';
        return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    try {
        const res = await fetch('http://localhost:3000/api/borrows', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ book_id: bookId, due_date: dueDate.toISOString() })
        });
        const data = await res.json();
        
        if (data.success) {
            alert('✅ Đã gửi yêu cầu mượn thành công! Vui lòng chờ Admin duyệt.');
            location.reload();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('🔴 handleBorrow Error:', error);
        alert('❌ Lỗi kết nối!');
    }
};

window.handleBookSearch = (event) => {
    const query = event.target.value.toLowerCase();
    const activeCategory = document.querySelector('.category-btn.active')?.getAttribute('data-id') || 'all';
    
    const bookCards = document.querySelectorAll('.book-card');
    bookCards.forEach(card => {
        const title = card.getAttribute('data-title').toLowerCase();
        const author = card.getAttribute('data-author').toLowerCase();
        const categoryId = card.getAttribute('data-category-id');
        
        const matchesQuery = title.includes(query) || author.includes(query);
        const matchesCategory = activeCategory === 'all' || categoryId === activeCategory;
        
        if (matchesQuery && matchesCategory) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
};

window.filterByCategory = (catId, btn) => {
    // Update active UI
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active', 'bg-indigo-600', 'text-white'));
    document.querySelectorAll('.category-btn').forEach(b => b.classList.add('text-gray-600', 'hover:bg-gray-50'));
    
    btn.classList.add('active', 'bg-indigo-600', 'text-white');
    btn.classList.remove('text-gray-600', 'hover:bg-gray-50');

    // Trigger filter
    const searchInput = document.querySelector('input[type="text"]');
    window.handleBookSearch({ target: searchInput });
};

export const Books = async () => {
    let booksHtml = '';
    let categoriesHtml = '';
    
    try {
       // Fetch Books and Categories in parallel
       const [booksRes, catsRes] = await Promise.all([
           fetch('http://localhost:3000/api/books').then(r => r.json()),
           fetch('http://localhost:3000/api/categories').then(r => r.json())
       ]);
       
       if (catsRes.success) {
           categoriesHtml = `
            <button onclick="window.filterByCategory('all', this)" class="category-btn active px-4 py-2 rounded-xl text-sm font-medium transition-all bg-indigo-600 text-white shadow-sm" data-id="all">Tất cả</button>
            ${catsRes.data.map(cat => `
                <button onclick="window.filterByCategory('${cat.id}', this)" class="category-btn px-4 py-2 rounded-xl text-sm font-medium transition-all text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200" data-id="${cat.id}">${cat.name}</button>
            `).join('')}
           `;
       }

       if (booksRes.success && booksRes.data.length > 0) {
          booksHtml = booksRes.data.map(book => {
             const rating = parseFloat(book.display_rating || 0).toFixed(1);
             const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) 
                ? '<svg class="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>'
                : '<svg class="w-3.5 h-3.5 text-gray-300 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>'
             ).join('');

             return `
             <div class="book-card bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all group flex flex-col h-full"
                  data-title="${book.title}" data-author="${book.author}" data-category-id="${book.category_id || ''}">
                <a href="#/book/${book.id}" class="block">
                    <div class="${book.cover_image && !book.cover_image.startsWith('http') ? book.cover_image : 'bg-teal-700'} h-52 rounded-xl mb-4 w-full flex items-center justify-center p-3 text-center overflow-hidden relative shadow-inner">
                       ${book.cover_image && book.cover_image.startsWith('http') 
                          ? `<img src="${book.cover_image}" class="absolute inset-0 w-full h-full object-cover" alt="${book.title}" />`
                          : `<h3 class="text-white font-bold text-lg z-10 drop-shadow-md text-balance">${book.title}</h3>`
                       }
                       <div class="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0"></div>
                       <div class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                          <span class="text-indigo-600 font-bold text-[10px]">${rating}</span>
                          ${stars}
                       </div>
                    </div>
                    
                    <div class="flex-1 flex flex-col">
                       <h3 class="font-bold text-navy-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">${book.title}</h3>
                       <p class="text-sm text-gray-500 mt-1">${book.author}</p>
                       <p class="text-[10px] uppercase tracking-wider font-bold text-indigo-400 mt-1">${book.category_name || 'Chưa phân loại'}</p>
                    </div>
                </a>
                
                <div class="mt-4 flex items-center justify-between gap-2">
                   ${book.available_count > 0 
                      ? `<span class="inline-block px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Sẵn sàng (${book.available_count})</span>`
                      : `<span class="inline-block px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Hết sách</span>`
                   }
                   <button onclick="window.handleBorrow(${book.id})" 
                           class="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                           ${book.available_count <= 0 ? 'disabled' : ''}>
                      Mượn ngay
                   </button>
                </div>
             </div>
          `}).join('');
       } else {
          booksHtml = `<div class="col-span-full text-center text-gray-500 py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              Chưa có dữ liệu sách trong hệ thống.
          </div>`;
       }
    } catch (error) {
       console.error("🔴 Fetch Books Error:", error);
       booksHtml = `<div class="col-span-full text-center text-red-500 py-10 bg-red-50 rounded-xl border border-red-200">
           Lỗi cấu hình lấy dữ liệu từ Backend API (Cổng 3000).
       </div>`;
    }
 
    return `
      <div class="animate-fade-in max-w-6xl mx-auto pb-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
           <div>
             <h1 class="text-4xl font-bold text-navy-900 tracking-tight mb-2">Thư viện Sách</h1>
             <p class="text-gray-500 italic">"Sách là nguồn tri thức vô tận của nhân loại."</p>
           </div>
           
           <div class="min-w-[320px]">
              <div class="relative">
                 <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                 </span>
                 <input oninput="window.handleBookSearch(event)" type="text" placeholder="Tìm tên sách, tác giả..." class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all" />
              </div>
           </div>
        </div>

        <!-- Category Filters -->
        <div class="mb-8 overflow-x-auto pb-2 flex gap-3 no-scrollbar scroll-smooth">
           ${categoriesHtml}
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6" id="books-grid">
           ${booksHtml}
        </div>
      </div>
    `;
};
