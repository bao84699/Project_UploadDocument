
document.addEventListener('DOMContentLoaded', function() {
    const SUPABASE_URL = 'https://biyyiobvozlgmuphsrph.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_jiPT2DziUxHLqQN5SILw-w_iwiha-DW';

    const overlay = document.getElementById('uploadForm');
    const uploadForm = document.querySelector('.upload-form');
    const uploadBtn = document.getElementById("upload-file");
    const docFileInput = document.getElementById("file-input"); 
    const coverImgInput = document.getElementById("fileInput"); 
    const titleText = document.querySelector(".title");
    const fileNameDiv = document.getElementById("fileName");
    const dropZone = document.getElementById("drop-zone");
    const submitBtn = document.getElementById("submit");
    const overlay2 = document.getElementById("overlay2");
    const closeBtn = document.getElementById("close");
    const form2 = document.querySelector(".upload-form2");
    const mascotWrapper = document.querySelector('.mascot-wrapper');
    const yearSelect = document.getElementById('academicYear');
    const docDetailOverlay = document.getElementById('overlaydescript');
    let currentRating = 0;
    let activeDocId = null;
    let validFiles = [];
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upload') === 'true' && sessionStorage.getItem('isAdmin') === 'true') {
        if (overlay) overlay.classList.add('active');
    }

    if (overlay && uploadForm) {
        overlay.addEventListener("click", () => {
            overlay.classList.remove('active');
            resetUploadForm();
        });
        uploadForm.addEventListener("click", (e) => e.stopPropagation());
    }

    if (uploadBtn && docFileInput) {
        uploadBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            docFileInput.click();
        });
    }

    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    const allowedExt = ["pdf", "doc", "docx"];

    function handleFileSelection(files) {
        if (files.length === 0) return;
        validFiles = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split(".").pop().toLowerCase();
            if (allowedTypes.includes(file.type) || allowedExt.includes(ext)) {
                validFiles.push(file);
            }
        }
        if (validFiles.length === 0) {
            Swal.fire("Lỗi", "Chỉ cho phép tệp PDF, DOC, DOCX", "error");
            docFileInput.value = "";
            if (titleText) titleText.textContent = "Kéo và thả tệp";
            return;
        }
        if (validFiles.length > 0) {
            const displayTitle = `Đã chọn: ${validFiles[0].name}`;
            if (titleText) titleText.textContent = displayTitle;
            if (fileNameDiv) fileNameDiv.textContent = validFiles[0].name;
            
            const titleInput = document.getElementById('FileName');
            if (titleInput && !titleInput.value.trim()) {
                titleInput.value = validFiles[0].name.split('.').slice(0, -1).join('.');
            }
        }
    }

    if (docFileInput) {
        docFileInput.addEventListener("change", (e) => {
            handleFileSelection(e.target.files);
        });
    }

    if (dropZone) {
        ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        dropZone.addEventListener("dragover", () => dropZone.classList.add("dragover"));
        dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
        dropZone.addEventListener("drop", (e) => {
            dropZone.classList.remove("dragover");
            handleFileSelection(e.dataTransfer.files);
        });
    }

    if (submitBtn && dropZone && overlay2) {
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (validFiles.length > 0) {
                dropZone.classList.add("active");
                setTimeout(() => {
                    overlay2.classList.add("active");
                }, 1100);
            } else {
                Swal.fire("Thông báo", "Vui lòng chọn tệp tài liệu trước!", "warning");
            }
        });
    }

    if (form2) {
        form2.addEventListener("click", (e) => e.stopPropagation());
    }

    if (overlay2) {
        overlay2.addEventListener("click", () => resetUploadForm());
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            resetUploadForm();
        });
    }

    function sanitizeFilename(filename) {
        if (!filename) return '';
        const parts = filename.split('.');
        const ext = parts.length > 1 ? parts.pop() : '';
        let name = parts.join('.');

        name = name.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');

        name = name.replace(/[^a-zA-Z0-9_-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');

        return ext ? `${name}.${ext}` : name;
    }

    function resetUploadForm() {
        if (overlay2) overlay2.classList.remove("active");
        if (overlay) overlay.classList.remove("active");
        if (dropZone) dropZone.classList.remove("active");
        validFiles = [];
        if (docFileInput) docFileInput.value = "";
        if (coverImgInput) coverImgInput.value = "";
        if (titleText) titleText.textContent = "Kéo và thả tệp";
        if (fileNameDiv) fileNameDiv.textContent = "";
        
        const previewImg = document.getElementById('previewImg');
        if (previewImg) previewImg.src = "Pictures/importPicture.svg";
        
        const fields = ['schoolCode', 'FileName', 'subject', 'academicYear', 'category', 'author', 'description'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = "";
                el.style.border = "";
            }
        });
        const importPicContainer = document.querySelector('.importPicture');
        if (importPicContainer) importPicContainer.style.border = "";
    }

    if (coverImgInput) {
        coverImgInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imagePreview = document.getElementById('previewImg');
                    if (imagePreview) {
                        imagePreview.src = e.target.result;
                        imagePreview.style.objectFit = "cover";
                        imagePreview.style.width = "100%";
                        imagePreview.style.height = "100%";
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const submitBtn2 = document.getElementById("submit2");
    if (submitBtn2) {
        submitBtn2.addEventListener("click", async (e) => {
            e.preventDefault();
            
            const fields = [
                { id: 'schoolCode', name: 'Mã trường' },
                { id: 'FileName', name: 'Tên file' },
                { id: 'subject', name: 'Môn học' },
                { id: 'academicYear', name: 'Năm học' },
                { id: 'category', name: 'Phân loại' },
                { id: 'author', name: 'Tác giả' },
                { id: 'description', name: 'Giới thiệu' }
            ];

            let firstEmptyField = null;

            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element) {
                    if (!element.value.trim()) {
                        element.style.border = "1px solid red";
                        if (!firstEmptyField) firstEmptyField = field.name;
                    } else {
                        element.style.border = "";
                    }
                }
            });

            const importPicContainer = document.querySelector('.importPicture');
            if (!coverImgInput || coverImgInput.files.length === 0) {
                if (importPicContainer) importPicContainer.style.border = "2px dashed red";
                if (!firstEmptyField) firstEmptyField = "Ảnh tài liệu";
            } else {
                if (importPicContainer) importPicContainer.style.border = "";
            }

            if (firstEmptyField) {
                Swal.fire({
                    title: "Thông báo",
                    text: `Vui lòng điền/chọn: ${firstEmptyField}`,
                    icon: "warning",
                    didOpen: () => {
                        Swal.getContainer().style.zIndex = "999999";
                    }
                });
                return;
            }

            const documentTitle = document.getElementById('FileName').value;
            const schoolCode = document.getElementById('schoolCode').value;
            const subject = document.getElementById('subject').value;
            const academicYear = document.getElementById('academicYear').value;
            const category = document.getElementById('category').value;
            const author = document.getElementById('author').value;
            const description = document.getElementById('description').value;
            const docFile = validFiles[0];
            const coverImageFile = coverImgInput.files[0];
            if (overlay2) overlay2.classList.remove("active");
            if (overlay) overlay.classList.remove("active");
            if (dropZone) dropZone.classList.remove("active");
            Swal.fire({
                title: 'Đang tải tài liệu lên...',
                text: 'Vui lòng chờ trong giây lát.',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                    Swal.getContainer().style.zIndex = "999999";
                }
            });

            try {
                const bucketName = "PrismUploadDocuments2026";

                const sanitizedDocName = sanitizeFilename(docFile.name);
                const docFileName = `${Date.now()}_${sanitizedDocName}`;
                const docStorageUrl = `${SUPABASE_URL}/storage/v1/object/${bucketName}/files/${docFileName}`;
                
                const docUploadRes = await fetch(docStorageUrl, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': docFile.type
                    },
                    body: docFile
                });

                if (!docUploadRes.ok) {
                    const errText = await docUploadRes.text();
                    throw new Error(`Lỗi tải file tài liệu: ${errText}`);
                }

                const docUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/files/${docFileName}`;

                const sanitizedCoverName = sanitizeFilename(coverImageFile.name);
                const coverFileName = `${Date.now()}_${sanitizedCoverName}`;
                const coverStorageUrl = `${SUPABASE_URL}/storage/v1/object/${bucketName}/covers/${coverFileName}`;

                const coverUploadRes = await fetch(coverStorageUrl, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': coverImageFile.type
                    },
                    body: coverImageFile
                });

                if (!coverUploadRes.ok) {
                    const errText = await coverUploadRes.text();
                    throw new Error(`Lỗi tải file ảnh bìa: ${errText}`);
                }

                const thumbnailUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/covers/${coverFileName}`;

                const dbUrl = `${SUPABASE_URL}/rest/v1/PrismUploadDocuments2026`;
                const dbRes = await fetch(dbUrl, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        name: documentTitle,
                        subject: subject,
                        school: schoolCode,
                        url: docUrl,
                        discription: description,
                        years: academicYear,
                        category: category,
                        thumbnail: thumbnailUrl
                    })
                });

                if (!dbRes.ok) {
                    const errText = await dbRes.text();
                    throw new Error(`Lỗi lưu thông tin vào database: ${errText}`);
                }

                Swal.close();
                Swal.fire({
                    title: "Thành công",
                    text: "Tài liệu đã được tải lên và lưu vào hệ thống thành công!",
                    icon: "success",
                    didOpen: () => {
                        Swal.getContainer().style.zIndex = "999999";
                    }
                }).then(() => {
                    resetUploadForm();
                    loadDocuments(); 
                });

            } catch (error) {
                console.error("Lỗi tải lên:", error);
                if (overlay2) overlay2.classList.add("active");
                Swal.fire({
                    title: "Lỗi",
                    text: `Không thể tải lên tài liệu: ${error.message}`,
                    icon: "error",
                    didOpen: () => {
                        Swal.getContainer().style.zIndex = "999999";
                    }
                });
            }
        });
    }

    if (yearSelect) {
        const startYear = 2015;
        const endYear = 2025;
        for (let i = startYear; i <= endYear; i++) {
            const yearRange = `${i}-${i + 1}`;
            const option = document.createElement('option');
            option.value = yearRange;
            option.textContent = yearRange;
            yearSelect.appendChild(option);
        }
    }
    if (mascotWrapper) {
        let hideTimeout;
        mascotWrapper.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            mascotWrapper.classList.add('is-active');
        });
        mascotWrapper.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
                mascotWrapper.classList.remove('is-active');
            }, 900);
        });
    }
    if (docDetailOverlay) {
        docDetailOverlay.addEventListener('click', (e) => {
            if (e.target.id === 'overlaydescript') {
                docDetailOverlay.classList.remove('show');
            }
        });
    }
    function bindDetailClick() {
        const items = document.querySelectorAll('.wrap-inner > .item');
        items.forEach(item => {
            if (!item.dataset.boundDetail) {
                item.dataset.boundDetail = "true";
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.bookmark') || e.target.closest('button')) {
                        return;
                    }
                    if (docDetailOverlay) {
                        const title = item.querySelector('.descript > p')?.textContent || "Tài liệu";
                        const subject = item.querySelector('.subject-text')?.textContent || "Chưa rõ";
                        const school = item.querySelector('.school-text')?.textContent || "Chưa rõ";
                        const description = item.getAttribute('data-description') || "Không có mô tả chi tiết cho tài liệu này.";
                        const fileUrl = item.getAttribute('data-url') || "";                     
                        activeDocId = item.getAttribute('data-id');
                        
                        const modalTitle = docDetailOverlay.querySelector('.title');
                        const modalAuthor = document.getElementById('tacGia');
                        const modalDescription = document.getElementById('tongQuan');
                        const pdfViewer = document.getElementById('pdf-viewer');
                        const downloadBtn = document.getElementById('download');
                        if (modalTitle) modalTitle.textContent = title;
                        if (modalAuthor) modalAuthor.textContent = school;
                        if (modalDescription) modalDescription.textContent = description;
                        
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
    async function loadDocuments() {
        const wrapInners = document.querySelectorAll(".wrap-inner");
        if (wrapInners.length === 0) return;

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
            console.log("Đã lấy được danh sách tài liệu từ Supabase:", dbDocs);

            if (dbDocs.length === 0) {
                console.warn("Bảng PrismUploadDocuments2026 hiện tại đang trống hoặc chưa bật chính sách RLS SELECT công khai. Đang hiển thị tài liệu mặc định/local.");
                const localDocs = JSON.parse(localStorage.getItem('documents') || '[]');
                if (localDocs.length > 0) {
                    renderDocuments(localDocs);
                } else {
                    bindDetailClick();
                }
                return;
            }

            const docs = dbDocs.map(doc => ({
                id: doc.id,
                FileName: doc.name,
                schoolName: doc.school,
                subjectName: doc.subject === 'kinhtechinhtri' || doc.subject === 'KTCT' ? 'KTCT' : doc.subject,
                academicYear: doc.years,
                category: doc.category,
                description: doc.discription,
                filePath: doc.thumbnail || "Pictures/KTCT.svg", 
                fileUrl: doc.url,
                rating: doc.rating
            }));
            renderDocuments(docs);
            return;
        } catch (err) {
            console.error("Lỗi tải tài liệu từ Supabase:", err);
        }

        const localDocs = JSON.parse(localStorage.getItem('documents') || '[]');
        if (localDocs.length > 0) {
            renderDocuments(localDocs);
        } else {
            bindDetailClick();
        }
    }
    function renderDocuments(docs) {
        const wrapInners = document.querySelectorAll(".wrap-inner");
        if (wrapInners.length === 0) return;

        wrapInners.forEach(wrapInner => {
            const staticHTML = `
                <div class="item">
                    <div class="pic">
                        <img src="Pictures/KTCT.svg" alt="">
                        <div class="format">
                            <img src="Pictures/pdf.svg" alt="">
                        </div>
                        <div class="endow">
                            <p>Tặng kèm 300 câu trắc nghiệm</p>
                            <p>500+ lượt tải</p>
                            <p>Cam kết 8+</p>
                        </div>
                    </div>
                    <div class="descript">
                        <p>Kinh tế chính trị Mác - Lênin</p>
                        <div class="frame">
                            <div class="item">
                                <i data-lucide="book-open"></i>
                                <p class="subject-text">KTCT</p>
                            </div>
                            <div class="item">
                                <i data-lucide="calendar-days"></i>
                                <p class="years-text">2025-2026</p>
                            </div>
                        </div>
                        <div class="frame">
                            <div class="item">
                                <i data-lucide="file-text"></i>
                                <p class="category-text">Slide - Bài giảng</p>
                            </div>
                            <div class="item">
                                <i data-lucide="university"></i>
                                <p class="school-text">IUH</p>
                            </div>
                        </div>
                    </div>
                    <div class="action-btn">
                        <button class="view">Xem chi tiết</button>
                        <button class="bookmark">
                            <i data-lucide="bookmark"></i>
                        </button>
                    </div>
                </div>
            `;
            wrapInner.innerHTML = staticHTML;
            docs.forEach(doc => {
                const cardHTML = `
                <div class="item" data-id="${doc.id || ''}" data-description="${doc.description || ''}" data-url="${doc.fileUrl || ''}" data-rating="${doc.rating || ''}">
                    <div class="pic">
                        <img src="${doc.filePath || 'Pictures/default.svg'}" alt="${doc.FileName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                        <div class="format">
                            <img src="Pictures/pdf.svg" alt="">
                        </div>
                    </div>
                    <div class="descript">
                        <p>${doc.FileName}</p>
                        <div class="frame">
                            <div class="item">
                                <i data-lucide="book-open"></i>
                                <p class="subject-text">${doc.subjectName}</p>
                            </div>
                            <div class="item">
                                <i data-lucide="calendar-days"></i>
                                <p class="years-text">${doc.academicYear}</p>
                            </div>
                        </div>
                        <div class="frame">
                            <div class="item">
                                <i data-lucide="file-text"></i>
                                <p class="category-text">${doc.category}</p>
                            </div>
                            <div class="item">
                                <i data-lucide="university"></i>
                                <p class="school-text">${doc.schoolName}</p>
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
                wrapInner.innerHTML = cardHTML + wrapInner.innerHTML; // Thêm tài liệu mới vào đầu danh sách
            });
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
        bindDetailClick();
    }
    const searchIp = document.getElementById('searchip');
    const nextStepBtn = document.getElementById('nextstep');
    const wrapSearch = document.querySelector('.wrap-search');
    
    function performSearch() {
        const query = searchIp ? searchIp.value.trim() : '';
        if (query) {
            window.location.href = `allfile.html?search=${encodeURIComponent(query)}`;
        }
    }

    if (searchIp) {
        searchIp.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', performSearch);
    }
    if (wrapSearch && searchIp) {
        const suggestionsBox = document.createElement('div');
        suggestionsBox.className = 'search-suggestions';
        wrapSearch.appendChild(suggestionsBox);
        const staticDocsForSearch = [
            { title: "KTCT - MacLenin - Chuong ...", subject: "Kinh tế chính trị", cover: "Pictures/KTCT.svg" },
            { title: "Ki nang lam viec nhom...", subject: "Kỹ năng mềm", cover: "Pictures/KNLVN.svg" },
            { title: "Chu nghia xa hoi...", subject: "Chủ nghĩa xã hội khoa học", cover: "Pictures/CNXH.svg" },
            { title: "Triet hoc MacLenin ...", subject: "Triết học Mác - Lênin", cover: "Pictures/MacLenin.svg" }
        ];
        searchIp.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            suggestionsBox.innerHTML = '';
            if (!query) {
                suggestionsBox.classList.remove('active');
                return;
            }
            const localDocs = JSON.parse(localStorage.getItem('documents') || '[]');
            const allDocs = [...staticDocsForSearch.map(d => ({ FileName: d.title, subjectName: d.subject, filePath: d.cover })),...localDocs
            ];
            const matches = allDocs.filter(doc => 
                doc.FileName.toLowerCase().includes(query) || 
                doc.subjectName.toLowerCase().includes(query)
            ).slice(0, 5); 
            if (matches.length === 0) {
                suggestionsBox.classList.remove('active');
                return;
            }

            matches.forEach(doc => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerHTML = `
                    <img class="thumb" src="${doc.filePath || 'Pictures/default.svg'}" alt="">
                    <div class="suggestion-info">
                        <span class="suggestion-title">${doc.FileName}</span>
                        <span class="suggestion-sub">${doc.subjectName}</span>
                    </div>
                `;
                item.addEventListener('click', () => {
                    searchIp.value = doc.FileName;
                    suggestionsBox.classList.remove('active');
                    window.location.href = `allfile.html?search=${encodeURIComponent(doc.FileName)}`;
                });
                suggestionsBox.appendChild(item);
            });

            suggestionsBox.classList.add('active');
        });
        document.addEventListener('click', function(e) {
            if (!wrapSearch.contains(e.target)) {
                suggestionsBox.classList.remove('active');
            }
        });
    const wraps = document.querySelectorAll('.section-newUp .wrap');
    wraps.forEach(wrap => {
        const arrows = wrap.querySelectorAll('.arrow');
        const wrapInner = wrap.querySelector('.wrap-inner');
        if (wrapInner && arrows.length >= 2) {
            const leftArrow = arrows[0];
            const rightArrow = arrows[arrows.length - 1];
            
            leftArrow.addEventListener('click', (e) => {
                e.stopPropagation();
                wrapInner.scrollBy({ left: -300, behavior: 'smooth' });
            });
            rightArrow.addEventListener('click', (e) => {
                e.stopPropagation();
                wrapInner.scrollBy({ left: 300, behavior: 'smooth' });
            });
        }
    });

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

        if (!activeDocId || activeDocId.startsWith('local')) {
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

    async function loadFeaturedBlogs() {
        const container = document.getElementById('featuredBlogsContainer');
        if (!container) return;

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/blogs?order=ngayDang.desc&limit=3`, {
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
            console.log("Đã lấy được danh sách bài viết từ Supabase:", blogs);
            renderFeaturedBlogs(blogs);
        } catch (err) {
            console.error("Lỗi khi tải bài viết nổi bật:", err);
            container.innerHTML = '<p style="text-align: center; color: #6B7280; grid-column: span 3; padding: 40px 0; width: 100%;">Không thể tải danh sách bài viết nổi bật.</p>';
        }
    }

    function renderFeaturedBlogs(blogs) {
        const container = document.getElementById('featuredBlogsContainer');
        if (!container) return;

        if (!blogs || blogs.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6B7280; grid-column: span 3; padding: 40px 0; width: 100%;">Chưa có bài viết nổi bật nào.</p>';
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
            const badge = document.getElementById('modalBlogBadge');
            const tLow = (blog.tieuDe || '').toLowerCase();
            const mLow = (blog.moTa || '').toLowerCase();
            blogModalLoading.style.display = 'none';
            blogModalContent.style.display = 'block';
            if (window.lucide) window.lucide.createIcons();
        } catch (err) {
            console.error('Lỗi tải bài viết modal:', err);
            blogModalLoading.style.display = 'none';
            blogModalContent.style.display = 'block';
            document.getElementById('modalBlogTitle').textContent = 'Lỗi tải bài viết';
            document.getElementById('modalBlogLead').textContent = err.message;
            document.getElementById('modalBlogBody').innerHTML = '';
        }
    };

    function closeBlogModal() {
        if (!blogModalOverlay) return;
        blogModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (blogModalClose) blogModalClose.addEventListener('click', closeBlogModal);
    if (blogModalOverlay) blogModalOverlay.addEventListener('click', function(e) {
        if (e.target === blogModalOverlay) closeBlogModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && blogModalOverlay && blogModalOverlay.classList.contains('active')) {
            closeBlogModal();
        }
    });

    loadDocuments();
    loadFeaturedBlogs();
    
    setTimeout(() => {
        const heroSection = document.querySelector('.section');
        if (heroSection) {
            heroSection.classList.add('animate-active');
        }
        
        const listSections = document.querySelectorAll('.section-newUp, .section-featured-blogs');
        listSections.forEach((sec, idx) => {
            setTimeout(() => {
                sec.classList.add('animate-active');
            }, 200 * (idx + 1));
        });
    }, 100);
}});
