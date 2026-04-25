// Node.js 18+ has global fetch

const BASE_URL = 'http://localhost:3000/api';

async function verify() {
    console.log('--- Bắt đầu Verify APIs ---');

    try {
        // 1. Kiểm tra Status
        const statusRes = await fetch(`${BASE_URL}/status`);
        const statusData = await statusRes.json();
        console.log('1. Status Check:', statusData.success !== false ? '✅ OK' : '❌ FAIL');

        // 2. Chạy thử Login Admin
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: '123456' })
        });
        const loginData = await loginRes.json();
        console.log('2. Admin Login:', loginData.success ? '✅ OK' : '❌ FAIL');
        const token = loginData.token;

        if (token) {
            // 3. Kiểm tra Stats API (Chỉ dành cho Admin)
            const statsRes = await fetch(`${BASE_URL}/stats/summary`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsRes.json();
            console.log('3. Stats API:', statsData.success ? '✅ OK' : '❌ FAIL');
            console.log('   Data:', statsData.data);

            // 4. Kiểm tra Books API (Public)
            const booksRes = await fetch(`${BASE_URL}/books`);
            const booksData = await booksRes.json();
            console.log('4. Books API:', booksData.success ? '✅ OK' : '❌ FAIL');
            console.log('   Count:', booksData.data.length);
        }

    } catch (error) {
        console.error('❌ Lỗi Verification:', error.message);
    }
}

verify();
