const SUPABASE_URL = 'https://biyyiobvozlgmuphsrph.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jiPT2DziUxHLqQN5SILw-w_iwiha-DW';

document.addEventListener('DOMContentLoaded', function() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    if (!slug) {
        Swal.fire({
            title: 'Lỗi!',
            text: 'Không tìm thấy đường dẫn bài viết.',
            icon: 'error',
            confirmButtonColor: '#FF8400'
        }).then(() => {
            window.location.href = 'index.html';
        });
        return;
    }

    // Kiểm tra trạng thái đăng nhập
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        // Chưa đăng nhập → chuyển sang trang đăng nhập
        const returnUrl = `blog.html?slug=${encodeURIComponent(slug)}`;
        window.location.href = `login.html?redirect=${encodeURIComponent(returnUrl)}`;
        return;
    }

    // Đã đăng nhập → tải nội dung blog
    taiNoiDungBlog(slug);
});

async function taiNoiDungBlog(slug) {
    const loadingState = document.getElementById('loadingState');
    const blogContentWrapper = document.getElementById('blogContentWrapper');
    const blogTitle = document.getElementById('blogTitle');
    const blogDate = document.getElementById('blogDate');
    const blogCover = document.getElementById('blogCover');
    const blogLead = document.getElementById('blogLead');
    const blogBody = document.getElementById('blogBody');

    try {
        const url = `${SUPABASE_URL}/rest/v1/blogs?duongDan=eq.${encodeURIComponent(slug)}`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Supabase API trả về mã lỗi ${res.status}: ${errText}`);
        }
        const data = await res.json();
        if (!data || data.length === 0) {
            throw new Error('Bài viết không tồn tại hoặc đã bị xóa.');
        }
        const blog = data[0];

        blogTitle.textContent = blog.tieuDe || 'Không có tiêu đề';
        blogLead.textContent = blog.moTa || '';

        if (blog.anhMinhHoa) {
            blogCover.src = blog.anhMinhHoa;
            blogCover.alt = blog.tieuDe;
        } else {
            blogCover.src = 'Pictures/KTCT.svg';
        }

        let dateStr = '---';
        if (blog.ngayDang || blog.ngayTao) {
            const dateObj = new Date(blog.ngayDang || blog.ngayTao);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            dateStr = `${day}/${month}/${year}`;
        }
        blogDate.textContent = dateStr;

        // Luôn hiển thị toàn bộ nội dung (đã đăng nhập rồi mới tới đây)
        blogBody.innerHTML = blog.noiDung || '<p>Không có nội dung.</p>';
        blogBody.style.display = 'block';

        if (loadingState) loadingState.style.display = 'none';
        if (blogContentWrapper) blogContentWrapper.style.display = 'block';
        if (window.lucide) {
            window.lucide.createIcons();
        }
    } catch (err) {
        console.error('Lỗi chi tiết:', err);
        Swal.fire({
            title: 'Lỗi!',
            text: err.message || 'Không thể kết nối cơ sở dữ liệu.',
            icon: 'error',
            confirmButtonColor: '#FF8400'
        }).then(() => {
            window.location.href = 'index.html';
        });
    }
}
