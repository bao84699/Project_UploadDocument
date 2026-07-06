
document.addEventListener('DOMContentLoaded', function() {
    const SUPABASE_URL = 'https://biyyiobvozlgmuphsrph.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_jiPT2DziUxHLqQN5SILw-w_iwiha-DW';

    const filterSubject = document.getElementById('filter-subject');
    const filterCategory = document.getElementById('filter-category');
    const filterYear = document.getElementById('filter-year');
    const wrapInnerFirst = document.querySelector('.box_main-doc .wrap-inner');

    let allDocuments = [];
    let currentPage = 1;
    const itemsPerPage = 8;

    async function loadLocalDocuments() {
        if (!wrapInnerFirst) return;

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/PrismUploadDocuments2026?order=id.desc`, {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Supabase REST API trả về status ${response.status}: ${errText}`);
            }

            const dbDocs = await response.json();
            console.log("Đã lấy danh sách tài liệu từ Supabase (Bộ lọc):", dbDocs);

            if (dbDocs.length === 0) {
                throw new Error("Table is empty");
            }

            allDocuments = dbDocs.map(doc => ({
                id: doc.id,
                name: doc.name,
                subject: doc.subject,
                school: doc.school,
                url: doc.url,
                description: doc.discription || '',
                years: doc.years,
                category: doc.category,
                thumbnail: doc.thumbnail || 'Pictures/KTCT.svg',
                rating: doc.rating
            }));

        } catch (err) {
            console.error("Lỗi khi tải dữ liệu từ Supabase, chuyển sang fallback LocalStorage:", err);
            const localDocs = JSON.parse(localStorage.getItem('documents') || '[]');
            allDocuments = localDocs.map((doc, idx) => ({
                id: doc.id || `local-${idx}`,
                name: doc.FileName,
                subject: doc.subjectName,
                school: doc.schoolName,
                url: doc.filePath || '',
                description: doc.description || '',
                years: doc.academicYear,
                category: doc.category,
                thumbnail: doc.filePath || 'Pictures/default.svg'
            }));
        }

        const wrapInners = document.querySelectorAll('.box_main-doc .wrap-inner');
        if (wrapInners[1]) wrapInners[1].style.display = 'none';

        currentPage = 1;
        renderFilteredDocuments();
    }

    function filterDocuments() {
        currentPage = 1;
        renderFilteredDocuments();
    }

    function renderFilteredDocuments() {
        if (!wrapInnerFirst) return;

        const selectedSubject = filterSubject ? filterSubject.value : '';
        const selectedCategory = filterCategory ? filterCategory.value : '';
        const selectedYear = filterYear ? filterYear.value : '';
        
        const headerSearchInput = document.querySelector('.notification .search input');
        const searchQuery = headerSearchInput ? headerSearchInput.value.trim().toLowerCase() : '';

        const filteredDocs = allDocuments.filter(doc => {
            let matchSubject = true;
            if (selectedSubject) {
                const subLower = (doc.subject || '').toLowerCase().trim();
                const selLower = selectedSubject.toLowerCase().trim();
                if (selLower === 'ktct') {
                    matchSubject = (subLower === 'ktct' || subLower.includes('kinh tế chính trị') || subLower === 'kinhtechinhtri');
                } else if (selLower === 'hethongmaytinh' || selLower === 'htmt') {
                    matchSubject = (subLower === 'hethongmaytinh' || subLower === 'htmt' || subLower.includes('hệ thống máy tính'));
                } else if (selLower === 'kithuatlaptrinh' || selLower === 'ktlt') {
                    matchSubject = (subLower === 'kithuatlaptrinh' || subLower === 'ktlt' || subLower.includes('kĩ thuật lập trình') || subLower.includes('kỹ thuật lập trình'));
                } else if (selLower === 'triethoc') {
                    matchSubject = (subLower === 'triethoc' || subLower.includes('triết học') || subLower.includes('maclenin'));
                } else {
                    matchSubject = (subLower === selLower || subLower.includes(selLower) || selLower.includes(subLower));
                }
            }

            let matchCategory = true;
            if (selectedCategory) {
                const catLower = (doc.category || '').toLowerCase();
                const selLower = selectedCategory.toLowerCase();
                matchCategory = catLower.includes(selLower) || selLower.includes(catLower);
            }

            let matchYear = true;
            if (selectedYear) {
                matchYear = (doc.years || '').includes(selectedYear);
            }

            let matchSearch = true;
            if (searchQuery) {
                const titleLower = (doc.name || '').toLowerCase();
                const subLower = (doc.subject || '').toLowerCase();
                const catLower = (doc.category || '').toLowerCase();
                const schoolLower = (doc.school || '').toLowerCase();
                matchSearch = titleLower.includes(searchQuery) ||
                              subLower.includes(searchQuery) ||
                              catLower.includes(searchQuery) ||
                              schoolLower.includes(searchQuery);
            }

            return matchSubject && matchCategory && matchYear && matchSearch;
        });

        const totalItems = filteredDocs.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (currentPage > totalPages) {
            currentPage = totalPages > 0 ? totalPages : 1;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageDocs = filteredDocs.slice(startIndex, endIndex);

        wrapInnerFirst.innerHTML = '';

        if (pageDocs.length === 0) {
            wrapInnerFirst.innerHTML = '<div style="font-weight: 500; font-size: 18px; color: #555; text-align: center; width: 100%; margin: 40px 0;">Không tìm thấy tài liệu phù hợp.</div>';
        } else {
            pageDocs.forEach(doc => {
                const cardHTML = `
                <div class="item" data-dynamic="true" data-id="${doc.id}" data-description="${doc.description || ''}" data-url="${doc.url || ''}" data-rating="${doc.rating || ''}">
                    <div class="pic">
                        <img src="${doc.thumbnail}" alt="${doc.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                        <div class="format">
                            <img src="Pictures/pdf.svg" alt="">
                        </div>
                    </div>
                    <div class="descript">
                        <p>${doc.name}</p>
                        <div class="frame">
                            <div class="item">
                                <i data-lucide="book-open"></i>
                                <p class="subject-text">${doc.subject === 'kinhtechinhtri' || doc.subject === 'KTCT' ? 'KTCT' : doc.subject}</p>
                            </div>
                            <div class="item">
                                <i data-lucide="calendar-days"></i>
                                <p class="years-text">${doc.years}</p>
                            </div>
                        </div>
                        <div class="frame">
                            <div class="item">
                                <i data-lucide="file-text"></i>
                                <p class="category-text">${doc.category}</p>
                            </div>
                            <div class="item">
                                <i data-lucide="university"></i>
                                <p class="school-text">${doc.school}</p>
                            </div>
                        </div>
                    </div>
                    <div class="action-btn">
                        <button class="view">Xem chi tiết</button>
                        <button class="bookmark">
                            <i data-lucide="bookmark"></i>
                        </button>
                    </div>
                </div>`;
                wrapInnerFirst.insertAdjacentHTML('beforeend', cardHTML);
            });
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }

        bindDetailPopup();
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const paginationBox = document.querySelector('.box_number-page');
        if (!paginationBox) return;

        paginationBox.innerHTML = '';

        if (totalPages <= 1) {
            paginationBox.style.display = 'none';
            return;
        }

        paginationBox.style.display = 'flex';

        for (let i = 1; i <= totalPages; i++) {
            const pageNumDiv = document.createElement('div');
            pageNumDiv.className = `number${i === currentPage ? ' active' : ''}`;
            pageNumDiv.textContent = i;
            pageNumDiv.addEventListener('click', () => {
                currentPage = i;
                renderFilteredDocuments();
                const docSection = document.querySelector('.container-doc');
                if (docSection) {
                    docSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
            paginationBox.appendChild(pageNumDiv);
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlSearchQuery = urlParams.get('search');
    const headerSearchInput = document.querySelector('.notification .search input');
    if (urlSearchQuery && headerSearchInput) {
        headerSearchInput.value = urlSearchQuery;
    }

    if (filterSubject) filterSubject.addEventListener('change', filterDocuments);
    if (filterCategory) filterCategory.addEventListener('change', filterDocuments);
    if (filterYear) filterYear.addEventListener('change', filterDocuments);

    if (headerSearchInput) {
        headerSearchInput.addEventListener('input', filterDocuments);
        headerSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterDocuments();
            }
        });
    }
    const headerSearchBtn = document.querySelector('.notification .search .btn-search');
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', filterDocuments);
    }

    filterDocuments();

    const docDetailOverlay = document.getElementById('overlaydescript');
    let currentRating = 0;
    let activeDocId = null;

    if (docDetailOverlay) {
        docDetailOverlay.addEventListener('click', (e) => {
            if (e.target.id === 'overlaydescript') {
                docDetailOverlay.classList.remove('show');
            }
        });
    }

    function bindDetailPopup() {
        const allItems = document.querySelectorAll('.box_main-doc .item');
        allItems.forEach(item => {
            if (!item.dataset.boundDetail) {
                item.dataset.boundDetail = "true";
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.bookmark')) return;

                    if (docDetailOverlay) {
                        const title = item.querySelector('.descript > p')?.textContent || "Tài liệu";
                        const subject = item.querySelector('.subject-text')?.textContent || "Chưa rõ";
                        const school = item.querySelector('.school-text')?.textContent || "Chưa rõ";
                        const category = item.querySelector('.category-text')?.textContent || "";
                        const years = item.querySelector('.years-text')?.textContent || "";
                        const description = item.getAttribute('data-description') || "Không có mô tả chi tiết cho tài liệu này.";
                        const fileUrl = item.getAttribute('data-url') || "";
                        activeDocId = item.getAttribute('data-id');

                        const modalTitle = docDetailOverlay.querySelector('.title');
                        const modalAuthor = document.getElementById('tacGia');
                        const modalDescription = document.getElementById('tongQuan');
                        const modalPages = document.getElementById('soTrang');
                        const modalUpdated = document.getElementById('capNhat');
                        const pdfViewer = document.getElementById('pdf-viewer');
                        const downloadBtn = document.getElementById('download');

                        if (modalTitle) modalTitle.textContent = title;
                        if (modalAuthor) modalAuthor.textContent = school;
                        if (modalDescription) modalDescription.textContent = description;
                        if (modalPages) modalPages.textContent = "—";
                        if (modalUpdated) modalUpdated.textContent = new Date().toLocaleDateString('vi-VN');

                        const userEmail = localStorage.getItem('userEmail') || 'anonymous';
                        const docRatingsMap = JSON.parse(localStorage.getItem('doc_ratings_map') || '{}');
                        let ratingsObj = docRatingsMap[activeDocId];
                        
                        const dbRating = parseFloat(item.getAttribute('data-rating')) || 0;
                        if (!ratingsObj) {
                            ratingsObj = {};
                            if (dbRating > 0) {
                                ratingsObj['_seed'] = dbRating;
                            }
                            docRatingsMap[activeDocId] = ratingsObj;
                            localStorage.setItem('doc_ratings_map', JSON.stringify(docRatingsMap));
                        }

                        const userRating = ratingsObj[userEmail] || 0;
                        currentRating = userRating;
                        highlightStars(userRating);

                        const vals = Object.values(ratingsObj);
                        const avgRating = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length) : dbRating;
                        const ratingText = avgRating > 0 ? avgRating.toFixed(1) : "—";
                        const detailRatingAvg = document.getElementById('detailRatingAvg');
                        if (detailRatingAvg) detailRatingAvg.textContent = ratingText;

                        if (pdfViewer) {
                            if (fileUrl) {
                                if (/\.(docx|doc|pptx|ppt|xlsx|xls)(?:$|\?)/i.test(fileUrl)) {
                                    pdfViewer.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
                                } else {
                                    pdfViewer.src = fileUrl;
                                }
                                pdfViewer.style.display = 'block';
                            } else {
                                pdfViewer.src = '';
                                pdfViewer.style.display = 'none';
                            }
                        }

                        if (downloadBtn) {
                            downloadBtn.onclick = async (event) => {
                                event.preventDefault();
                                if (fileUrl) {
                                    try {
                                        downloadBtn.disabled = true;
                                        downloadBtn.textContent = 'Đang tải...';
                                        const response = await fetch(fileUrl);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        const fileName = fileUrl.split('/').pop().split('?')[0] || 'tai-lieu';
                                        a.download = decodeURIComponent(fileName);
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        window.URL.revokeObjectURL(url);
                                    } catch (err) {
                                        console.error('Lỗi tải file:', err);
                                        window.open(fileUrl, '_blank');
                                    } finally {
                                        downloadBtn.disabled = false;
                                        downloadBtn.textContent = 'TẢI XUỐNG NGAY';
                                    }
                                } else {
                                    Swal.fire("Lỗi", "Không có liên kết để tải tài liệu này!", "error");
                                }
                            };
                        }

                        docDetailOverlay.classList.add('show');
                    }
                });
            }
        });
    }

    const ratingContainer = document.querySelector('.rating-stars');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseover', function(e) {
            const star = e.target.closest('.star-rating-btn');
            if (star) {
                const val = parseInt(star.getAttribute('data-value'));
                highlightStars(val);
            }
        });

        ratingContainer.addEventListener('mouseout', function() {
            highlightStars(currentRating);
        });

        ratingContainer.addEventListener('click', function(e) {
            const star = e.target.closest('.star-rating-btn');
            if (star) {
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                if (!isLoggedIn) {
                    Swal.fire({
                        title: "Yêu cầu đăng nhập",
                        text: "Bạn cần đăng nhập tài khoản để đánh giá tài liệu!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Đăng nhập ngay",
                        cancelButtonText: "Để sau",
                        didOpen: () => {
                            Swal.getContainer().style.zIndex = "999999";
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = "login.html";
                        }
                    });
                    highlightStars(0);
                    return;
                }

                const rating = parseInt(star.getAttribute('data-value'));
                currentRating = rating;
                highlightStars(currentRating);

                const userEmail = localStorage.getItem('userEmail') || 'anonymous';
                const docRatingsMap = JSON.parse(localStorage.getItem('doc_ratings_map') || '{}');
                let ratingsObj = docRatingsMap[activeDocId];
                if (!ratingsObj) {
                    ratingsObj = {};
                    const targetItem = document.querySelector(`.item[data-id="${activeDocId}"]`);
                    const dbRating = parseFloat(targetItem ? targetItem.getAttribute('data-rating') : 0) || 0;
                    if (dbRating > 0) {
                        ratingsObj['_seed'] = dbRating;
                    }
                }
                
                ratingsObj[userEmail] = rating;
                docRatingsMap[activeDocId] = ratingsObj;
                localStorage.setItem('doc_ratings_map', JSON.stringify(docRatingsMap));

                const vals = Object.values(ratingsObj);
                const averageRating = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length) : rating;

                submitRatingImmediately(rating, averageRating);
            }
        });
    }

    function highlightStars(count) {
        const stars = document.querySelectorAll('.star-rating-btn');
        stars.forEach(s => {
            const val = parseInt(s.getAttribute('data-value'));
            if (val <= count) {
                s.classList.add('active');
                s.style.stroke = '#FDBA24';
                s.style.fill = '#FDBA24';
            } else {
                s.classList.remove('active');
                s.style.stroke = '#94a3b8';
                s.style.fill = 'transparent';
            }
        });
    }

    async function submitRatingImmediately(userRating, averageRating) {
        if (!userRating || userRating === 0) return;

        if (!activeDocId || String(activeDocId).startsWith('local')) {
            Swal.fire({
                title: "Thành công!",
                text: `Đã lưu đánh giá ${userRating} sao (Local)!`,
                icon: "success",
                didOpen: () => {
                    Swal.getContainer().style.zIndex = "999999";
                }
            });
            return;
        }

        Swal.fire({
            title: 'Đang gửi đánh giá...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
                Swal.getContainer().style.zIndex = "999999";
            }
        });

        try {
            const patchUrl = `${SUPABASE_URL}/rest/v1/PrismUploadDocuments2026?id=eq.${activeDocId}`;

            const response = await fetch(patchUrl, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rating: averageRating
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Supabase PATCH status ${response.status}: ${errText}`);
            }

            const targetItem = document.querySelector(`.item[data-id="${activeDocId}"]`);
            if (targetItem) {
                targetItem.setAttribute('data-rating', averageRating);
            }
            const detailRatingAvg = document.getElementById('detailRatingAvg');
            if (detailRatingAvg) {
                detailRatingAvg.textContent = averageRating.toFixed(1);
            }

            Swal.fire({
                title: "Thành công!",
                text: `Cảm ơn bạn đã gửi đánh giá ${userRating} sao!`,
                icon: "success",
                didOpen: () => {
                    Swal.getContainer().style.zIndex = "999999";
                }
            });

        } catch (err) {
            console.error("Lỗi khi gửi đánh giá lên Supabase:", err);
            Swal.fire({
                title: "Lỗi",
                text: "Không thể kết nối đến cơ sở dữ liệu để lưu đánh giá.",
                icon: "error",
                didOpen: () => {
                    Swal.getContainer().style.zIndex = "999999";
                }
            });
        }
    }

    async function loadAllBlogs() {
        const container = document.getElementById('allBlogsContainer');
        if (!container) return;

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/blogs?order=ngayDang.desc`, {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Supabase REST API trả về status ${response.status}: ${errText}`);
            }

            const blogs = await response.json();
            renderAllBlogs(blogs);
        } catch (err) {
            console.error("Lỗi khi tải bài viết:", err);
            container.innerHTML = '<p style="text-align: center; color: #6B7280; grid-column: span 3; padding: 40px 0; width: 100%;">Không thể tải danh sách bài viết.</p>';
        }
    }

    function renderAllBlogs(blogs) {
        const container = document.getElementById('allBlogsContainer');
        if (!container) return;

        if (!blogs || blogs.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6B7280; grid-column: span 3; padding: 40px 0; width: 100%;">Chưa có bài viết nào.</p>';
            return;
        }

        container.innerHTML = '';

        blogs.forEach((blog, index) => {
            let dateStr = '---';
            if (blog.ngayDang || blog.ngayTao) {
                const dateObj = new Date(blog.ngayDang || blog.ngayTao);
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const year = dateObj.getFullYear();
                dateStr = `${day}/${month}/${year}`;
            }

            let category = 'Chia sẻ';
            let categoryClass = 'category-default';
            const tieuDeThuong = blog.tieuDe.toLowerCase();
            const moTaThuong = (blog.moTa || '').toLowerCase();
            
            if (tieuDeThuong.includes('học tập') || moTaThuong.includes('học tập') || tieuDeThuong.includes('sinh viên') || tieuDeThuong.includes('trường')) {
                category = 'Học tập';
                categoryClass = 'category-learn';
            } else if (tieuDeThuong.includes('công nghệ') || tieuDeThuong.includes('lập trình') || moTaThuong.includes('tech') || tieuDeThuong.includes('ai')) {
                category = 'Công nghệ';
                categoryClass = 'category-tech';
            } else if (tieuDeThuong.includes('kỹ năng') || moTaThuong.includes('kỹ năng') || tieuDeThuong.includes('phát triển')) {
                category = 'Kỹ năng';
                categoryClass = 'category-skill';
            }

            const cardHtml = `
                <div class="blog-card" onclick="openBlogModal('${blog.duongDan}')">
                    <div class="blog-card-image">
                        <img src="${blog.anhMinhHoa || 'Pictures/KTCT.svg'}" alt="${blog.tieuDe}" onerror="this.src='Pictures/KTCT.svg'">
                        
                    </div>
                    <div class="blog-card-body">
                        <h3 class="blog-card-title">${blog.tieuDe}</h3>
                        <p class="blog-card-desc">${blog.moTa || 'Chưa có mô tả cho bài viết này.'}</p>
                        <div class="blog-card-footer">
                            <div class="blog-card-date">
                                <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                                <span>${dateStr}</span>
                            </div>
                            <a href="#" class="blog-card-btn ${categoryClass}-btn" onclick="event.preventDefault(); event.stopPropagation(); openBlogModal('${blog.duongDan}');">
                                <span>Đọc thêm</span>
                                <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    const blogModalOverlay = document.getElementById('blogModalOverlay');
    const blogModalClose = document.getElementById('blogModalClose');
    const blogModalLoading = document.getElementById('blogModalLoading');
    const blogModalContent = document.getElementById('blogModalContent');
    
    window.openBlogModal = async function(slug) {
        if (!blogModalOverlay) return;
        blogModalLoading.style.display = 'flex';
        blogModalContent.style.display = 'none';
        blogModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        const scrollEl = document.querySelector('.blog-modal-scroll');
        if (scrollEl) scrollEl.scrollTop = 0;
        try {
            const url = `${SUPABASE_URL}/rest/v1/blogs?duongDan=eq.${encodeURIComponent(slug)}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            if (!res.ok) throw new Error(`Lỗi ${res.status}`);
            const data = await res.json();
            if (!data || data.length === 0) throw new Error('Bài viết không tồn tại.');

            const blog = data[0];
            document.getElementById('modalBlogTitle').textContent = blog.tieuDe || 'Không có tiêu đề';
            document.getElementById('modalBlogLead').textContent = blog.moTa || '';
            document.getElementById('modalBlogBody').innerHTML = blog.noiDung || '<p>Không có nội dung.</p>';
            const coverEl = document.getElementById('modalBlogCover');
            coverEl.src = blog.anhMinhHoa || 'Pictures/KTCT.svg';
            coverEl.alt = blog.tieuDe;
            let dateStr = '---';
            if (blog.ngayDang || blog.ngayTao) {
                const d = new Date(blog.ngayDang || blog.ngayTao);
                dateStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
            }
            document.getElementById('modalBlogDate').textContent = dateStr;
            
            blogModalLoading.style.display = 'none';
            blogModalContent.style.display = 'block';

        } catch (err) {
            console.error(err);
            blogModalLoading.style.display = 'none';
            blogModalContent.style.display = 'block';
            document.getElementById('modalBlogTitle').textContent = 'Lỗi';
            document.getElementById('modalBlogLead').textContent = '';
            document.getElementById('modalBlogBody').innerHTML = `<p>${err.message}</p>`;
        }
    };

    if (blogModalClose) {
        blogModalClose.addEventListener('click', () => {
            blogModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (blogModalOverlay) {
        blogModalOverlay.addEventListener('click', (e) => {
            if (e.target === blogModalOverlay) {
                blogModalOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    loadLocalDocuments();
    loadAllBlogs();
    bindDetailPopup();
});