
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
    let allCachedDocuments = [];
    let allCachedBlogs = [];
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminFromStorage = window.AuthUtils ? window.AuthUtils.ensureAdminFromStoredProfile() : sessionStorage.getItem('isAdmin') === 'true';
    if (urlParams.get('upload') === 'true' && isAdminFromStorage) {
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
    function openDocumentDetail(doc) {
        if (!doc) return;
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            Swal.fire({
                title: 'Yêu cầu đăng nhập',
                text: 'Bạn phải đăng nhập để xem chi tiết tài liệu',
                icon: 'warning',
                confirmButtonText: 'Đăng nhập ngay',
                confirmButtonColor: '#FF8400',
                showCancelButton: true,
                cancelButtonText: 'Hủy',
                cancelButtonColor: '#6B7280'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'login.html';
                }
            });
            return;
        }

        if (!docDetailOverlay) return;

        const title = doc.name || doc.FileName || "Tài liệu";
        const school = doc.school || doc.schoolName || "Chưa rõ";
        const description = doc.discription || doc.description || "Không có mô tả chi tiết cho tài liệu này.";
        const fileUrl = doc.url || doc.fileUrl || "";
        activeDocId = doc.id;

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

        const dbRating = parseFloat(doc.rating) || 0;
        if (!ratingsObj) {
            ratingsObj = {};
            if (dbRating > 0) {
                ratingsObj['_seed'] = dbRating;
            }
            if (activeDocId) {
                docRatingsMap[activeDocId] = ratingsObj;
                localStorage.setItem('doc_ratings_map', JSON.stringify(docRatingsMap));
            }
        }

        const userRating = ratingsObj ? (ratingsObj[userEmail] || 0) : 0;
        currentRating = userRating;
        highlightStars(userRating);

        const vals = ratingsObj ? Object.values(ratingsObj) : [];
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

    function bindDetailClick() {
        const items = document.querySelectorAll('.wrap-inner > .item');
        items.forEach(item => {
            if (!item.dataset.boundDetail) {
                item.dataset.boundDetail = "true";
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.bookmark') || e.target.closest('button')) {
                        return;
                    }
                    const docObj = {
                        id: item.getAttribute('data-id'),
                        name: item.querySelector('.descript > p')?.textContent || "Tài liệu",
                        school: item.querySelector('.school-text')?.textContent || "Chưa rõ",
                        subject: item.querySelector('.subject-text')?.textContent || "Chưa rõ",
                        discription: item.getAttribute('data-description') || "Không có mô tả chi tiết cho tài liệu này.",
                        url: item.getAttribute('data-url') || "",
                        rating: item.getAttribute('data-rating')
                    };
                    openDocumentDetail(docObj);
                });
            }
        });
    }
    const fallbackStaticDocs = [
        {
            id: 'static-ktct',
            name: 'Kinh tế chính trị Mác - Lênin',
            FileName: 'Kinh tế chính trị Mác - Lênin',
            school: 'IUH',
            schoolName: 'IUH',
            subject: 'KTCT',
            subjectName: 'KTCT',
            years: '2025-2026',
            academicYear: '2025-2026',
            category: 'Slide - Bài giảng',
            discription: 'Giáo trình & Slide bài giảng Kinh tế chính trị Mác - Lênin chuẩn khung đại học 2021.',
            description: 'Giáo trình & Slide bài giảng Kinh tế chính trị Mác - Lênin chuẩn khung đại học 2021.',
            thumbnail: 'Pictures/KTCT.svg',
            filePath: 'Pictures/KTCT.svg',
            url: 'uploads/KTCT.pdf',
            fileUrl: 'uploads/KTCT.pdf',
            rating: 4.8
        },
        {
            id: 'static-knlvm',
            name: 'Kỹ năng làm việc nhóm hiệu quả',
            FileName: 'Kỹ năng làm việc nhóm hiệu quả',
            school: 'IUH',
            schoolName: 'IUH',
            subject: 'KTCT',
            subjectName: 'Kỹ năng mềm',
            years: '2025-2026',
            academicYear: '2025-2026',
            category: 'Slide - Bài giảng',
            discription: 'Bộ kỹ năng làm việc nhóm, phân chia công việc và kỹ năng giao tiếp trong tập thể.',
            description: 'Bộ kỹ năng làm việc nhóm, phân chia công việc và kỹ năng giao tiếp trong tập thể.',
            thumbnail: 'Pictures/KNLVN.svg',
            filePath: 'Pictures/KNLVN.svg',
            url: 'Pictures/KNLVM.docx',
            fileUrl: 'Pictures/KNLVM.docx',
            rating: 4.9
        },
        {
            id: 'static-cnxh',
            name: 'Chủ nghĩa xã hội khoa học',
            FileName: 'Chủ nghĩa xã hội khoa học',
            school: 'IUH',
            schoolName: 'IUH',
            subject: 'CNXH',
            subjectName: 'CNXH',
            years: '2025-2026',
            academicYear: '2025-2026',
            category: 'Giáo trình/Slide',
            discription: 'Tài liệu học tập & câu hỏi ôn tập môn Chủ nghĩa xã hội khoa học.',
            description: 'Tài liệu học tập & câu hỏi ôn tập môn Chủ nghĩa xã hội khoa học.',
            thumbnail: 'Pictures/CNXH.svg',
            filePath: 'Pictures/CNXH.svg',
            url: 'uploads/KTCT.pdf',
            fileUrl: 'uploads/KTCT.pdf',
            rating: 4.7
        },
        {
            id: 'static-maclenin',
            name: 'Triết học Mác - Lênin',
            FileName: 'Triết học Mác - Lênin',
            school: 'IUH',
            schoolName: 'IUH',
            subject: 'Triết học',
            subjectName: 'Triết học',
            years: '2025-2026',
            academicYear: '2025-2026',
            category: 'Giáo trình/Slide',
            discription: 'Giáo trình Triết học Mác - Lênin toàn tập kèm sơ đồ tư duy các quy luật triết học.',
            description: 'Giáo trình Triết học Mác - Lênin toàn tập kèm sơ đồ tư duy các quy luật triết học.',
            thumbnail: 'Pictures/MacLenin.svg',
            filePath: 'Pictures/MacLenin.svg',
            url: 'uploads/KTCT.pdf',
            fileUrl: 'uploads/KTCT.pdf',
            rating: 4.6
        }
    ];

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

            const docs = Array.isArray(dbDocs) ? dbDocs.map(doc => ({
                id: doc.id,
                name: doc.name,
                FileName: doc.name,
                school: doc.school,
                schoolName: doc.school,
                subject: doc.subject === 'kinhtechinhtri' || doc.subject === 'KTCT' ? 'KTCT' : doc.subject,
                subjectName: doc.subject === 'kinhtechinhtri' || doc.subject === 'KTCT' ? 'KTCT' : doc.subject,
                years: doc.years,
                academicYear: doc.years,
                category: doc.category,
                discription: doc.discription,
                description: doc.discription,
                thumbnail: doc.thumbnail || "Pictures/KTCT.svg",
                filePath: doc.thumbnail || "Pictures/KTCT.svg", 
                url: doc.url,
                fileUrl: doc.url,
                rating: doc.rating
            })) : [];

            allCachedDocuments = [...docs];
            fallbackStaticDocs.forEach(sd => {
                if (!allCachedDocuments.some(d => (d.name || d.FileName) === (sd.name || sd.FileName))) {
                    allCachedDocuments.push(sd);
                }
            });

            const localDocs = JSON.parse(localStorage.getItem('documents') || '[]');
            localDocs.forEach(ld => {
                if (!allCachedDocuments.some(d => (d.name || d.FileName) === (ld.FileName || ld.name))) {
                    allCachedDocuments.push({
                        id: ld.id || 'local-' + Date.now(),
                        name: ld.FileName,
                        FileName: ld.FileName,
                        school: ld.schoolName || 'IUH',
                        schoolName: ld.schoolName || 'IUH',
                        subject: ld.subjectName || 'KTCT',
                        subjectName: ld.subjectName || 'KTCT',
                        years: ld.academicYear || '2025-2026',
                        academicYear: ld.academicYear || '2025-2026',
                        category: ld.category || 'Tài liệu',
                        discription: ld.description || '',
                        description: ld.description || '',
                        thumbnail: ld.filePath || 'Pictures/default.svg',
                        filePath: ld.filePath || 'Pictures/default.svg',
                        url: ld.filePath || '',
                        fileUrl: ld.filePath || '',
                        rating: ld.rating || 0
                    });
                }
            });

            if (docs.length === 0) {
                console.warn("Bảng PrismUploadDocuments2026 hiện tại đang trống hoặc chưa bật chính sách RLS SELECT công khai. Đang hiển thị tài liệu mặc định/local.");
                if (localDocs.length > 0) {
                    renderDocuments(localDocs);
                } else {
                    bindDetailClick();
                }
                return;
            }

            renderDocuments(docs);
            return;
        } catch (err) {
            console.error("Lỗi tải tài liệu từ Supabase:", err);
            allCachedDocuments = [...fallbackStaticDocs];
            const localDocs = JSON.parse(localStorage.getItem('documents') || '[]');
            localDocs.forEach(ld => {
                allCachedDocuments.push({
                    id: ld.id || 'local-' + Date.now(),
                    name: ld.FileName,
                    FileName: ld.FileName,
                    school: ld.schoolName || 'IUH',
                    schoolName: ld.schoolName || 'IUH',
                    subject: ld.subjectName || 'KTCT',
                    subjectName: ld.subjectName || 'KTCT',
                    years: ld.academicYear || '2025-2026',
                    academicYear: ld.academicYear || '2025-2026',
                    category: ld.category || 'Tài liệu',
                    discription: ld.description || '',
                    description: ld.description || '',
                    thumbnail: ld.filePath || 'Pictures/default.svg',
                    filePath: ld.filePath || 'Pictures/default.svg',
                    url: ld.filePath || '',
                    fileUrl: ld.filePath || '',
                    rating: ld.rating || 0
                });
            });

            if (localDocs.length > 0) {
                renderDocuments(localDocs);
            } else {
                bindDetailClick();
            }
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
    // ==========================================
    // HIỆN THỰC HÓA THANH SEARCH TRONG SECTION BANNER
    // Hỗ trợ tìm kiếm cả Blog và Tài liệu liên quan
    // ==========================================
    const searchIp = document.getElementById('searchip');
    const nextStepBtn = document.getElementById('nextstep');
    const searchIconBtn = document.getElementById('search');
    const wrapSearch = document.querySelector('.wrap-search');

    function performSearch() {
        const query = searchIp ? searchIp.value.trim() : '';
        if (query) {
            window.location.href = `allfile.html?search=${encodeURIComponent(query)}`;
        } else {
            window.location.href = `allfile.html`;
        }
    }

    if (searchIp) {
        searchIp.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const highlighted = document.querySelector('.suggestion-item.highlighted');
                if (highlighted) {
                    highlighted.click();
                } else {
                    performSearch();
                }
            }
        });
    }

    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', performSearch);
    }
    if (searchIconBtn) {
        searchIconBtn.addEventListener('click', performSearch);
    }

    if (wrapSearch && searchIp) {
        // Tạo container hộp gợi ý kết quả
        let suggestionsBox = wrapSearch.querySelector('.search-suggestions');
        if (!suggestionsBox) {
            suggestionsBox = document.createElement('div');
            suggestionsBox.className = 'search-suggestions';
            wrapSearch.appendChild(suggestionsBox);
        }

        let currentActiveTab = 'all'; // 'all' | 'docs' | 'blogs'
        let highlightedIndex = -1;
        let searchDebounceTimer = null;

        function removeVietnameseTones(str) {
            if (!str) return '';
            str = str.toLowerCase();
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            str = str.replace(/[\u0300-\u036f]/g, "");
            return str.trim();
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function highlightMatch(text, query) {
            if (!text || !query) return escapeHtml(text);
            const safeText = String(text);
            const normalizedText = removeVietnameseTones(safeText);
            const normalizedQuery = removeVietnameseTones(query);
            if (!normalizedQuery) return escapeHtml(safeText);

            const index = normalizedText.indexOf(normalizedQuery);
            if (index === -1) return escapeHtml(safeText);

            const before = escapeHtml(safeText.slice(0, index));
            const match = escapeHtml(safeText.slice(index, index + normalizedQuery.length));
            const after = escapeHtml(safeText.slice(index + normalizedQuery.length));
            return `${before}<mark class="search-highlight">${match}</mark>${after}`;
        }

        function getFileFormat(url, fileName) {
            const path = (url || fileName || '').toLowerCase();
            if (path.includes('.pdf')) return 'PDF';
            if (path.includes('.doc') || path.includes('.docx')) return 'DOCX';
            if (path.includes('.ppt') || path.includes('.pptx')) return 'PPTX';
            if (path.includes('.xls') || path.includes('.xlsx')) return 'EXCEL';
            return 'DOC';
        }

        function filterItems(query) {
            const rawQuery = (query || '').trim();
            const cleanQuery = removeVietnameseTones(rawQuery);

            if (!cleanQuery) {
                // Trạng thái trending / gợi ý nổi bật ban đầu
                const trendingDocs = allCachedDocuments.slice(0, 3);
                const trendingBlogs = allCachedBlogs.slice(0, 3);
                return {
                    isTrending: true,
                    query: '',
                    matchedDocs: trendingDocs,
                    matchedBlogs: trendingBlogs,
                    totalDocs: trendingDocs.length,
                    totalBlogs: trendingBlogs.length,
                    totalCount: trendingDocs.length + trendingBlogs.length
                };
            }

            const tokens = cleanQuery.split(/\s+/).filter(Boolean);

            // Tìm kiếm trong danh sách tài liệu
            const matchedDocs = allCachedDocuments.filter(doc => {
                const titleNorm = removeVietnameseTones(doc.name || doc.FileName || '');
                const subjectNorm = removeVietnameseTones(doc.subjectName || doc.subject || '');
                const schoolNorm = removeVietnameseTones(doc.schoolName || doc.school || '');
                const catNorm = removeVietnameseTones(doc.category || '');
                const descNorm = removeVietnameseTones(doc.discription || doc.description || '');
                const combined = `${titleNorm} ${subjectNorm} ${schoolNorm} ${catNorm} ${descNorm}`;

                return tokens.every(t => combined.includes(t));
            }).map(doc => {
                let score = 0;
                const titleNorm = removeVietnameseTones(doc.name || doc.FileName || '');
                if (titleNorm === cleanQuery) score += 50;
                else if (titleNorm.startsWith(cleanQuery)) score += 30;
                else if (titleNorm.includes(cleanQuery)) score += 15;
                return { item: doc, score };
            }).sort((a, b) => b.score - a.score).map(o => o.item);

            // Tìm kiếm trong danh sách blog
            const matchedBlogs = allCachedBlogs.filter(blog => {
                const titleNorm = removeVietnameseTones(blog.tieuDe || '');
                const descNorm = removeVietnameseTones(blog.moTa || '');
                const contentNorm = removeVietnameseTones(blog.noiDung || '');
                const authorNorm = removeVietnameseTones(blog.tacGia || '');
                const catNorm = removeVietnameseTones(blog.danhMuc || '');
                const combined = `${titleNorm} ${descNorm} ${contentNorm} ${authorNorm} ${catNorm}`;

                return tokens.every(t => combined.includes(t));
            }).map(blog => {
                let score = 0;
                const titleNorm = removeVietnameseTones(blog.tieuDe || '');
                if (titleNorm === cleanQuery) score += 50;
                else if (titleNorm.startsWith(cleanQuery)) score += 30;
                else if (titleNorm.includes(cleanQuery)) score += 15;
                return { item: blog, score };
            }).sort((a, b) => b.score - a.score).map(o => o.item);

            return {
                isTrending: false,
                query: rawQuery,
                matchedDocs,
                matchedBlogs,
                totalDocs: matchedDocs.length,
                totalBlogs: matchedBlogs.length,
                totalCount: matchedDocs.length + matchedBlogs.length
            };
        }

        function renderSuggestions() {
            const query = searchIp.value.trim();
            const data = filterItems(query);
            highlightedIndex = -1;

            if (!data.isTrending && data.totalCount === 0) {
                // Hiển thị trạng thái rỗng (Empty State)
                suggestionsBox.innerHTML = `
                    <div class="search-empty-state">
                        <div class="search-empty-icon">
                            <i data-lucide="search-x"></i>
                        </div>
                        <div class="search-empty-title">Không tìm thấy kết quả phù hợp với "${escapeHtml(query)}"</div>
                        <div class="search-empty-desc">Thử tìm kiếm với tên môn học, chủ đề hoặc bấm chọn các từ khóa gợi ý:</div>
                        <div class="search-trending-chips">
                            <span class="search-trending-chip" data-search="Kinh tế chính trị">Kinh tế chính trị</span>
                            <span class="search-trending-chip" data-search="C++">Lập trình C++</span>
                            <span class="search-trending-chip" data-search="Hệ thống máy tính">Hệ thống máy tính</span>
                            <span class="search-trending-chip" data-search="Triết học">Triết học</span>
                            <span class="search-trending-chip" data-search="Làm việc nhóm">Kỹ năng mềm</span>
                        </div>
                    </div>
                    <div class="suggestion-footer">
                        <span class="suggestion-footer-hint">DocZone Smart Search</span>
                        <a href="allfile.html" class="suggestion-footer-link">
                            <span>Khám phá toàn bộ thư viện</span>
                            <i data-lucide="arrow-right"></i>
                        </a>
                    </div>
                `;
                bindSearchEvents();
                openDropdown();
                return;
            }

            // Giao diện có kết quả hoặc gợi ý ban đầu
            let html = `
                <div class="suggestion-tabs">
                    <button type="button" class="suggestion-tab ${currentActiveTab === 'all' ? 'active' : ''}" data-tab="all">
                        <span>Tất cả</span>
                        <span class="suggestion-tab-count">${data.totalCount}</span>
                    </button>
                    <button type="button" class="suggestion-tab ${currentActiveTab === 'docs' ? 'active' : ''}" data-tab="docs">
                        <span>Tài liệu</span>
                        <span class="suggestion-tab-count">${data.totalDocs}</span>
                    </button>
                    <button type="button" class="suggestion-tab ${currentActiveTab === 'blogs' ? 'active' : ''}" data-tab="blogs">
                        <span>Bài viết Blog</span>
                        <span class="suggestion-tab-count">${data.totalBlogs}</span>
                    </button>
                </div>
                <div class="suggestion-content">
            `;

            if (data.isTrending) {
                html += `
                    <div class="search-trending-section">
                        <div class="search-trending-heading">
                            <i data-lucide="flame"></i>
                            <span>Gợi ý tìm kiếm phổ biến</span>
                        </div>
                        <div class="search-trending-chips" style="justify-content: flex-start; margin-bottom: 12px;">
                            <span class="search-trending-chip" data-search="Kinh tế chính trị">Kinh tế chính trị</span>
                            <span class="search-trending-chip" data-search="C++">C++</span>
                            <span class="search-trending-chip" data-search="Hệ thống máy tính">Hệ thống máy tính</span>
                            <span class="search-trending-chip" data-search="Slide bài giảng">Slide bài giảng</span>
                            <span class="search-trending-chip" data-search="Đề thi cuối kỳ">Đề thi cuối kỳ</span>
                        </div>
                    </div>
                `;
            }

            // Danh sách tài liệu
            const showDocs = (currentActiveTab === 'all' || currentActiveTab === 'docs') && data.matchedDocs.length > 0;
            if (showDocs) {
                const limitDocs = currentActiveTab === 'all' ? 4 : 8;
                const docsSlice = data.matchedDocs.slice(0, limitDocs);
                html += `
                    <div class="suggestion-group">
                        <div class="suggestion-group-header">
                            <div class="suggestion-group-title">
                                <i data-lucide="book-open"></i>
                                <span>Tài liệu học tập liên quan</span>
                            </div>
                            <span class="suggestion-group-badge">${data.totalDocs} tài liệu</span>
                        </div>
                `;

                docsSlice.forEach((doc, idx) => {
                    const format = getFileFormat(doc.fileUrl || doc.url, doc.name || doc.FileName);
                    const titleHighlighted = highlightMatch(doc.name || doc.FileName, query);
                    const subject = doc.subjectName || doc.subject || 'Tổng hợp';
                    const school = doc.schoolName || doc.school || 'IUH';
                    const category = doc.category || 'Tài liệu';

                    html += `
                        <div class="suggestion-item doc-item" data-type="doc" data-index="${idx}" data-doc-id="${doc.id || ''}">
                            <div class="suggestion-thumb-wrap">
                                <img src="${doc.filePath || doc.thumbnail || 'Pictures/default.svg'}" alt="" onerror="this.src='Pictures/default.svg'">
                                <span class="format-badge">${format}</span>
                            </div>
                            <div class="suggestion-info">
                                <div class="suggestion-title" title="${escapeHtml(doc.name || doc.FileName)}">${titleHighlighted}</div>
                                <div class="suggestion-meta">
                                    <span class="suggestion-meta-tag subject">${escapeHtml(subject)}</span>
                                    <span class="suggestion-meta-tag school">${escapeHtml(school)}</span>
                                    <span class="suggestion-meta-tag">${escapeHtml(category)}</span>
                                </div>
                            </div>
                            <span class="suggestion-badge badge-doc">
                                <i data-lucide="file-text" style="width: 12px; height: 12px;"></i>
                                <span>Tài liệu</span>
                            </span>
                        </div>
                    `;
                });
                html += `</div>`;
            }

            // Danh sách blog
            const showBlogs = (currentActiveTab === 'all' || currentActiveTab === 'blogs') && data.matchedBlogs.length > 0;
            if (showBlogs) {
                const limitBlogs = currentActiveTab === 'all' ? 4 : 8;
                const blogsSlice = data.matchedBlogs.slice(0, limitBlogs);
                html += `
                    <div class="suggestion-group">
                        <div class="suggestion-group-header">
                            <div class="suggestion-group-title">
                                <i data-lucide="feather"></i>
                                <span>Bài viết Blog liên quan</span>
                            </div>
                            <span class="suggestion-group-badge">${data.totalBlogs} bài viết</span>
                        </div>
                `;

                blogsSlice.forEach((blog, idx) => {
                    const titleHighlighted = highlightMatch(blog.tieuDe, query);
                    let dateStr = '';
                    if (blog.ngayDang || blog.ngayTao) {
                        const d = new Date(blog.ngayDang || blog.ngayTao);
                        dateStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
                    }
                    const category = blog.danhMuc || (blog.tacGia ? `Bởi ${blog.tacGia}` : 'Chia sẻ kinh nghiệm');

                    html += `
                        <div class="suggestion-item blog-item" data-type="blog" data-slug="${escapeHtml(blog.duongDan)}">
                            <div class="suggestion-thumb-wrap">
                                <img src="${blog.anhMinhHoa || 'Pictures/KTCT.svg'}" alt="" onerror="this.src='Pictures/KTCT.svg'">
                            </div>
                            <div class="suggestion-info">
                                <div class="suggestion-title" title="${escapeHtml(blog.tieuDe)}">${titleHighlighted}</div>
                                <div class="suggestion-meta">
                                    <span class="suggestion-meta-tag subject" style="background: #faf5ff; color: #9333ea;">${escapeHtml(category)}</span>
                                    ${dateStr ? `<span class="suggestion-meta-tag date">${dateStr}</span>` : ''}
                                </div>
                            </div>
                            <span class="suggestion-badge badge-blog">
                                <i data-lucide="feather" style="width: 12px; height: 12px;"></i>
                                <span>Blog</span>
                            </span>
                        </div>
                    `;
                });
                html += `</div>`;
            }

            html += `</div>`; // Đóng suggestion-content

            // Footer
            const queryParam = encodeURIComponent(query);
            const viewAllUrl = query ? `allfile.html?search=${queryParam}` : `allfile.html`;
            const footerText = query ? `Xem tất cả ${data.totalCount} kết quả cho "${escapeHtml(query)}" trên trang tài liệu` : `Xem toàn bộ kho tài liệu và bài viết`;

            html += `
                <div class="suggestion-footer">
                    <span class="suggestion-footer-hint">Nhấn <kbd style="background: #e2e8f0; padding: 2px 5px; border-radius: 4px; font-size: 10px;">Enter</kbd> để tìm kiếm</span>
                    <a href="${viewAllUrl}" class="suggestion-footer-link">
                        <span>${footerText}</span>
                        <i data-lucide="arrow-right"></i>
                    </a>
                </div>
            `;

            suggestionsBox.innerHTML = html;
            bindSearchEvents(data);
            openDropdown();
        }

        function bindSearchEvents(data) {
            if (window.lucide) {
                window.lucide.createIcons();
            }

            // Tabs chuyển đổi (Tất cả, Tài liệu, Blog)
            const tabs = suggestionsBox.querySelectorAll('.suggestion-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentActiveTab = tab.getAttribute('data-tab');
                    renderSuggestions();
                });
            });

            // Chips gợi ý bấm nhanh
            const chips = suggestionsBox.querySelectorAll('.search-trending-chip');
            chips.forEach(chip => {
                chip.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const text = chip.getAttribute('data-search') || chip.textContent.trim();
                    searchIp.value = text;
                    searchIp.focus();
                    renderSuggestions();
                });
            });

            // Click vào card tài liệu
            const docItems = suggestionsBox.querySelectorAll('.suggestion-item.doc-item');
            docItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const docId = item.getAttribute('data-doc-id');
                    const targetDoc = allCachedDocuments.find(d => String(d.id) === String(docId)) || {
                        id: docId,
                        name: item.querySelector('.suggestion-title')?.textContent || 'Tài liệu',
                        school: 'IUH',
                        subject: 'KTCT',
                        discription: 'Tài liệu học tập sinh viên',
                        url: 'uploads/KTCT.pdf'
                    };
                    closeDropdown();
                    openDocumentDetail(targetDoc);
                });
            });

            // Click vào card blog
            const blogItems = suggestionsBox.querySelectorAll('.suggestion-item.blog-item');
            blogItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const slug = item.getAttribute('data-slug');
                    closeDropdown();
                    if (typeof window.openBlogModal === 'function') {
                        window.openBlogModal(slug);
                    } else {
                        window.location.href = `blog.html?slug=${encodeURIComponent(slug)}`;
                    }
                });
            });
        }

        function openDropdown() {
            suggestionsBox.classList.add('active');
            wrapSearch.classList.add('has-suggestions');
        }

        function closeDropdown() {
            suggestionsBox.classList.remove('active');
            wrapSearch.classList.remove('has-suggestions');
            highlightedIndex = -1;
        }

        // Sự kiện gõ tìm kiếm với debounce 150ms
        searchIp.addEventListener('input', function() {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                renderSuggestions();
            }, 120);
        });

        // Sự kiện focus vào ô input -> mở gợi ý
        searchIp.addEventListener('focus', function() {
            renderSuggestions();
        });

        // Điều khiển bằng bàn phím (ArrowUp, ArrowDown, Escape)
        searchIp.addEventListener('keydown', function(e) {
            const items = suggestionsBox.querySelectorAll('.suggestion-item');
            if (!suggestionsBox.classList.contains('active') || items.length === 0) {
                if (e.key === 'ArrowDown') {
                    renderSuggestions();
                }
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                highlightedIndex = (highlightedIndex + 1) % items.length;
                updateHighlightedItem(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
                updateHighlightedItem(items);
            } else if (e.key === 'Escape') {
                closeDropdown();
            }
        });

        function updateHighlightedItem(items) {
            items.forEach((it, idx) => {
                if (idx === highlightedIndex) {
                    it.classList.add('highlighted');
                    it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                } else {
                    it.classList.remove('highlighted');
                }
            });
        }

        // Đóng dropdown khi click ra ngoài wrapSearch
        document.addEventListener('click', function(e) {
            if (!wrapSearch.contains(e.target)) {
                closeDropdown();
            }
        });
    }

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

    const fallbackStaticBlogs = [
        {
            id: 2,
            tieuDe: "CẤP PHÁT ĐỘNG CHO MẢNG MỘT CHIỀU TRONG C++",
            duongDan: "cap-phat-dong-cho-mang-mot-chieu-trong-c",
            moTa: "Bài viết phục vụ cho cấp phát động cho mảng một chiều trong C++, quản lý con trỏ và vùng nhớ heap.",
            anhMinhHoa: "Pictures/KTCT.svg",
            ngayDang: "2026-06-21T15:20:39.726",
            tacGia: "Admin",
            danhMuc: "Lập trình C++"
        },
        {
            id: 101,
            tieuDe: "Bí quyết ôn thi cuối kỳ đạt điểm cao môn Kinh tế chính trị",
            duongDan: "bi-quyet-on-thi-cuoi-ky-ktct",
            moTa: "Tổng hợp mẹo ôn tập, sơ đồ tư duy giá trị thặng dư và trọn bộ 300 câu hỏi trắc nghiệm trọng tâm nhất.",
            anhMinhHoa: "Pictures/KTCT.svg",
            ngayDang: "2026-04-10T10:00:00",
            tacGia: "Ban Biên Tập",
            danhMuc: "Kinh nghiệm ôn thi"
        },
        {
            id: 102,
            tieuDe: "Kỹ năng làm việc nhóm hiệu quả cho sinh viên",
            duongDan: "ky-nang-lam-viec-nhom-hieu-qua",
            moTa: "Phương pháp phân chia nhiệm vụ công bằng, giải quyết xung đột ý kiến và báo cáo bài tập lớn đạt điểm tối đa.",
            anhMinhHoa: "Pictures/KNLVN.svg",
            ngayDang: "2026-03-15T08:30:00",
            tacGia: "DocZone Club",
            danhMuc: "Kỹ năng mềm"
        },
        {
            id: 103,
            tieuDe: "Tổng hợp kiến thức Hệ thống máy tính - CPU & Bộ nhớ",
            duongDan: "tong-hop-kien-thuc-he-thong-may-tinh",
            moTa: "Cẩm nang ôn tập kiến trúc máy tính, phân tầng bộ nhớ Cache - RAM và chu kỳ thực thi lệnh.",
            anhMinhHoa: "Pictures/CNXH.svg",
            ngayDang: "2026-02-20T14:15:00",
            tacGia: "Ban Học Thuật",
            danhMuc: "Công nghệ thông tin"
        }
    ];

    async function loadFeaturedBlogs() {
        const container = document.getElementById('featuredBlogsContainer');
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
            console.log("Đã lấy được danh sách bài viết từ Supabase:", blogs);

            allCachedBlogs = Array.isArray(blogs) && blogs.length > 0 ? [...blogs] : [];
            fallbackStaticBlogs.forEach(fb => {
                if (!allCachedBlogs.some(b => b.duongDan === fb.duongDan || b.tieuDe === fb.tieuDe)) {
                    allCachedBlogs.push(fb);
                }
            });

            renderFeaturedBlogs(allCachedBlogs.slice(0, 3));
        } catch (err) {
            console.error("Lỗi khi tải bài viết nổi bật:", err);
            allCachedBlogs = [...fallbackStaticBlogs];
            renderFeaturedBlogs(allCachedBlogs.slice(0, 3));
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

            // Kiểm tra đăng nhập
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const modalBlogBody = document.getElementById('modalBlogBody');
            const modalBlogLoginGate = document.getElementById('modalBlogLoginGate');
            const modalBlogViewDetailBtn = document.getElementById('modalBlogViewDetailBtn');
            const modalBlogDetailGate = document.getElementById('modalBlogDetailGate');
            const modalBlogGoDetailBtn = document.getElementById('modalBlogGoDetailBtn');

            // Luôn ẩn nội dung đầy đủ trong modal
            modalBlogBody.style.display = 'none';
            modalBlogBody.innerHTML = '';

            if (isLoggedIn) {
                // Đã đăng nhập → hiện nút "Xem chi tiết" để vào trang blog
                if (modalBlogLoginGate) modalBlogLoginGate.style.display = 'none';
                if (modalBlogDetailGate) modalBlogDetailGate.style.display = 'flex';
                if (modalBlogGoDetailBtn) {
                    const newBtn = modalBlogGoDetailBtn.cloneNode(true);
                    modalBlogGoDetailBtn.parentNode.replaceChild(newBtn, modalBlogGoDetailBtn);
                    newBtn.addEventListener('click', function() {
                        window.location.href = `blog.html?slug=${encodeURIComponent(slug)}`;
                    });
                }
            } else {
                // Chưa đăng nhập → hiện nút đăng nhập
                if (modalBlogLoginGate) modalBlogLoginGate.style.display = 'flex';
                if (modalBlogDetailGate) modalBlogDetailGate.style.display = 'none';
                // Bấm nút → chuyển sang trang đăng nhập
                if (modalBlogViewDetailBtn) {
                    const newBtn = modalBlogViewDetailBtn.cloneNode(true);
                    modalBlogViewDetailBtn.parentNode.replaceChild(newBtn, modalBlogViewDetailBtn);
                    newBtn.addEventListener('click', function() {
                        const returnUrl = `blog.html?slug=${encodeURIComponent(slug)}`;
                        window.location.href = `login.html?redirect=${encodeURIComponent(returnUrl)}`;
                    });
                }
            }

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
});
