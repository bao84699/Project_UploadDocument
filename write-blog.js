
const editorTitle = document.getElementById('editorTitle');
const editorBody = document.getElementById('editorBody');
const editorPaper = document.getElementById('editorPaper');

const saveStatus = document.getElementById('saveStatus');
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');

const btnShare = document.getElementById('btnShare');
const btnExport = document.getElementById('btnExport');
const exportMenu = document.getElementById('exportMenu');
const titleDisplay = document.getElementById('titleDisplay');

const sidebar = document.getElementById('sidebar');
const inputTitle = document.getElementById('inputTitle');
const inputDesc = document.getElementById('inputDesc');
const inputCover = document.getElementById('inputCover');
const btnSelectCover = document.getElementById('btnSelectCover');
const fileCover = document.getElementById('fileCover');
const coverPreview = document.getElementById('coverPreview');
const btnRemoveCover = document.getElementById('btnRemoveCover');

const btnTabDoc = document.getElementById('btnTabDoc');
const btnTabFormat = document.getElementById('btnTabFormat');

let saveTimer = null;
const DRAFT_STORAGE_KEY = 'doczone_blog_draft';

const SUPABASE_URL = 'https://biyyiobvozlgmuphsrph.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jiPT2DziUxHLqQN5SILw-w_iwiha-DW';
const BUCKET_NAME = 'prism-documents';
const TABLE_NAME = 'PrismUploadDocuments2026';
const TABLE_NAME_BLOGS = 'blogs';

function getStoredProfile() {
    return {
        isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
        userName: localStorage.getItem('userName') || '',
        userEmail: localStorage.getItem('userEmail') || ''
    };
}

function isAdminProfile(profile) {
    return Boolean(profile.isLoggedIn && window.AuthUtils && window.AuthUtils.isAdminEmail(profile.userEmail));
}

function kiemTraQuyenAdmin() {
    const storedProfile = getStoredProfile();
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true' || isAdminProfile(storedProfile);
    if (isAdmin && window.AuthUtils) {
        window.AuthUtils.syncAdminState({
            isLoggedIn: true,
            userName: storedProfile.userName,
            userEmail: storedProfile.userEmail
        });
    }
    if (!isAdmin) {
        if (window.Swal) {
            Swal.fire({
                title: 'Truy cập bị từ chối!',
                text: 'Bạn không phải admin. Không thể truy cập trang viết bài.',
                icon: 'error',
                confirmButtonText: 'Quay lại Trang chủ',
                confirmButtonColor: '#FF8400'
            }).then(function() {
                window.location.href = 'index.html';
            });
        } else {
            alert('Bạn không có quyền admin. Đang quay lại Trang chủ...');
            window.location.href = 'index.html';
        }
        return false;
    }
    return true;
}

function khoiTaoPage() {
    if (!kiemTraQuyenAdmin()) return;

    if (window.lucide) {
        window.lucide.createIcons();
    }

    khoiPhocBanNhap();
    ganCacSuKien();
}

function henGioLuuNhap() {
    if (saveStatus) {
        saveStatus.classList.add('saving');
        if (statusText) statusText.textContent = 'Đang lưu nháp...';
        if (statusIcon) {
            statusIcon.setAttribute('data-lucide', 'refresh-cw');
            statusIcon.classList.add('icon-spin');
            if (window.lucide) window.lucide.createIcons();
        }
    }
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(luuBanNhap, 1000);
}

function ganCacSuKien() {
    if (btnSelectCover && fileCover) {
        btnSelectCover.addEventListener('click', function() {
            fileCover.click();
        });
    }

    if (fileCover) {
        fileCover.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                if (inputCover) {
                    inputCover.value = file.name;
                    inputCover.placeholder = 'Đã chọn tệp: ' + file.name;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (coverPreview) {
                        const img = coverPreview.querySelector('img');
                        if (img) img.src = e.target.result;
                        coverPreview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
                henGioLuuNhap();
            }
        });
    }

    if (inputCover) {
        inputCover.addEventListener('input', function() {
            const value = this.value.trim();
            if (value && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:'))) {
                if (coverPreview) {
                    const img = coverPreview.querySelector('img');
                    if (img) img.src = value;
                    coverPreview.style.display = 'block';
                }
                if (fileCover) fileCover.value = '';
            } else if (!value) {
                if (coverPreview) coverPreview.style.display = 'none';
            }
            henGioLuuNhap();
        });
    }

    if (btnRemoveCover) {
        btnRemoveCover.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (inputCover) {
                inputCover.value = '';
                inputCover.placeholder = 'Dán link ảnh hoặc chọn tệp...';
            }
            if (fileCover) fileCover.value = '';
            if (coverPreview) {
                coverPreview.style.display = 'none';
                const img = coverPreview.querySelector('img');
                if (img) img.src = '';
            }
            henGioLuuNhap();
        });
    }
    
    editorTitle.addEventListener('input', function() {
        const text = editorTitle.innerText.trim();
        inputTitle.value = text;
        if (titleDisplay) titleDisplay.textContent = text || 'Bài viết mới';
        henGioLuuNhap();
    });

    inputTitle.addEventListener('input', function() {
        const text = inputTitle.value;
        editorTitle.innerText = text;
        if (titleDisplay) titleDisplay.textContent = text || 'Bài viết mới';
        henGioLuuNhap();
    });

    editorBody.addEventListener('input', function() {
        henGioLuuNhap();
    });

    inputDesc.addEventListener('input', function() {
        henGioLuuNhap();
    });
    const toolbarButtons = document.querySelectorAll('.toolbar-btn[data-command]');
    toolbarButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const command = btn.getAttribute('data-command');
            
            document.execCommand(command, false, null);
            editorBody.focus();
            capNhatTrangThaiNutToolbar();
        });
    });

    const formatBlock = document.getElementById('formatBlock');
    if (formatBlock) {
        formatBlock.addEventListener('change', function() {
            document.execCommand('formatBlock', false, '<' + this.value + '>');
            editorBody.focus();
        });
    }

    const fontName = document.getElementById('fontName');
    if (fontName) {
        fontName.addEventListener('change', function() {
            document.execCommand('fontName', false, this.value);
            editorBody.focus();
        });
    }

    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        fontSize.addEventListener('change', function() {
            document.execCommand('fontSize', false, this.value);
            editorBody.focus();
        });
    }

    const foreColorInput = document.getElementById('foreColor');
    const hiliteColorInput = document.getElementById('hiliteColor');
    const btnTextColor = document.getElementById('btnTextColor');
    const btnBgColor = document.getElementById('btnBgColor');

    if (btnTextColor && foreColorInput) {
        btnTextColor.addEventListener('click', function(e) {
            e.preventDefault();
            foreColorInput.click();
        });
    }
    if (btnBgColor && hiliteColorInput) {
        btnBgColor.addEventListener('click', function(e) {
            e.preventDefault();
            hiliteColorInput.click();
        });
    }

    if (foreColorInput) {
        foreColorInput.addEventListener('input', function() {
            document.execCommand('foreColor', false, this.value);
            if (btnTextColor) {
                const textIndicator = btnTextColor.querySelector('.text-color-ind');
                if (textIndicator) textIndicator.style.backgroundColor = this.value;
            }
            editorBody.focus();
        });
    }

    if (hiliteColorInput) {
        hiliteColorInput.addEventListener('input', function() {
            document.execCommand('hiliteColor', false, this.value);
            if (btnBgColor) {
                const bgIndicator = btnBgColor.querySelector('.bg-color-ind');
                if (bgIndicator) bgIndicator.style.backgroundColor = this.value;
            }
            editorBody.focus();
        });
    }

    if (btnTabDoc) {
        btnTabDoc.addEventListener('click', function() {
            btnTabDoc.classList.add('active');
            if (btnTabFormat) btnTabFormat.classList.remove('active');
            const tabDoc = document.getElementById('tab-document');
            const tabFormat = document.getElementById('tab-format');
            if (tabDoc) tabDoc.classList.add('active');
            if (tabFormat) tabFormat.classList.remove('active');
        });
    }

    if (btnTabFormat) {
        btnTabFormat.addEventListener('click', function() {
            btnTabFormat.classList.add('active');
            if (btnTabDoc) btnTabDoc.classList.remove('active');
            const tabDoc = document.getElementById('tab-document');
            const tabFormat = document.getElementById('tab-format');
            if (tabFormat) tabFormat.classList.add('active');
            if (tabDoc) tabDoc.classList.remove('active');
        });
    }

    const selectLineHeight = document.getElementById('selectLineHeight');
    if (selectLineHeight) {
        selectLineHeight.addEventListener('change', function() {
            editorBody.style.lineHeight = this.value;
        });
    }

    const selectLetterSpacing = document.getElementById('selectLetterSpacing');
    if (selectLetterSpacing) {
        selectLetterSpacing.addEventListener('change', function() {
            editorBody.style.letterSpacing = this.value;
        });
    }

    document.addEventListener('click', function(e) {
        if (exportMenu && exportMenu.classList.contains('show') && !exportMenu.contains(e.target) && e.target !== btnExport) {
            exportMenu.classList.remove('show');
        }
    });

    if (btnExport && exportMenu) {
        btnExport.addEventListener('click', function(e) {
            e.stopPropagation();
            exportMenu.classList.toggle('show');
        });
    }

    const exportOptions = document.querySelectorAll('.export-option');
    exportOptions.forEach(function(opt) {
        opt.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            xuLyXuatFile(format);
            if (exportMenu) exportMenu.classList.remove('show');
        });
    });

    if (btnShare) {
        btnShare.addEventListener('click', copyDuongDanChiaSe);
    }

    const btnMoreOptions = document.getElementById('btnMoreOptions');
    if (btnMoreOptions) {
        btnMoreOptions.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.Swal) {
                Swal.fire({
                    title: 'Công cụ soạn thảo nâng cao',
                    html: `
                        <div style="display: flex; flex-direction: column; gap: 12px; padding: 10px 0;">
                            <button id="optClear" class="swal2-confirm swal2-styled" style="background-color: #6B7280; margin: 0; border-radius: 100px; padding: 12px;">Xóa toàn bộ định dạng</button>
                            <button id="optHr" class="swal2-confirm swal2-styled" style="background-color: #FF8400; margin: 0; border-radius: 100px; padding: 12px;">Chèn dòng kẻ ngang (HR)</button>
                            <button id="optTime" class="swal2-confirm swal2-styled" style="background-color: #FDBA24; margin: 0; border-radius: 100px; padding: 12px;">Chèn ngày giờ hiện tại</button>
                        </div>
                    `,
                    showConfirmButton: false,
                    showCancelButton: true,
                    cancelButtonText: 'Đóng',
                    cancelButtonColor: '#6B7280'
                });

                document.getElementById('optClear').addEventListener('click', function() {
                    document.execCommand('removeFormat', false, null);
                    Swal.close();
                    editorBody.focus();
                });

                document.getElementById('optHr').addEventListener('click', function() {
                    document.execCommand('insertHorizontalRule', false, null);
                    Swal.close();
                    editorBody.focus();
                });

                document.getElementById('optTime').addEventListener('click', function() {
                    const timeString = new Date().toLocaleString('vi-VN');
                    document.execCommand('insertHTML', false, ' <span>' + timeString + '</span> ');
                    Swal.close();
                    editorBody.focus();
                });
            } else {
                const choice = prompt('Chọn chức năng:\n1. Xóa định dạng\n2. Kẻ dòng ngang\n3. Chèn ngày giờ');
                if (choice === '1') {
                    document.execCommand('removeFormat', false, null);
                } else if (choice === '2') {
                    document.execCommand('insertHorizontalRule', false, null);
                } else if (choice === '3') {
                    document.execCommand('insertHTML', false, ' ' + new Date().toLocaleString('vi-VN') + ' ');
                }
            }
        });
    }

    document.addEventListener('selectionchange', capNhatTrangThaiNutToolbar);
    editorBody.addEventListener('keyup', capNhatTrangThaiNutToolbar);
    editorBody.addEventListener('mouseup', capNhatTrangThaiNutToolbar);
}

function luuBanNhap() {
    const gioHienTai = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    const draftData = {
        title: editorTitle.innerText.trim() || 'Bài viết mới',
        content: editorBody.innerHTML,
        description: inputDesc.value.trim(),
        coverUrl: inputCover ? inputCover.value.trim() : '',
        coverPreviewSrc: (coverPreview && coverPreview.style.display !== 'none') ? coverPreview.querySelector('img').src : '',
        lastUpdated: gioHienTai
    };

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));

    saveStatus.classList.remove('saving');
    statusText.textContent = 'Đã lưu tự động';
    if (statusIcon) {
        statusIcon.setAttribute('data-lucide', 'check-circle');
        statusIcon.classList.remove('icon-spin');
        if (window.lucide) window.lucide.createIcons();
    }
}

function khoiPhocBanNhap() {
    const localData = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (localData) {
        try {
            const draft = JSON.parse(localData);
            
            editorTitle.innerText = draft.title || 'Bài viết mới';
            inputTitle.value = draft.title || 'Bài viết mới';
            if (titleDisplay) titleDisplay.textContent = draft.title || 'Bài viết mới';

            editorBody.innerHTML = draft.content || '';

            inputDesc.value = draft.description || '';

            if (draft.coverUrl && inputCover) {
                inputCover.value = draft.coverUrl;
            }
            if (draft.coverPreviewSrc && coverPreview) {
                const img = coverPreview.querySelector('img');
                if (img) img.src = draft.coverPreviewSrc;
                coverPreview.style.display = 'block';
            }
        } catch (e) {
            console.error('Lỗi khi đọc file nháp cũ:', e);
        }
    } else {
        editorTitle.innerText = 'Bài viết mới';
        inputTitle.value = 'Bài viết mới';
        if (titleDisplay) titleDisplay.textContent = 'Bài viết mới';
        editorBody.innerHTML = '<p>Bắt đầu viết bài của bạn tại đây...</p>';
    }
}

function capNhatTrangThaiNutToolbar() {
    const commandButtons = document.querySelectorAll('.toolbar-btn[data-command]');
    commandButtons.forEach(function(btn) {
        const cmd = btn.getAttribute('data-command');
        try {
            if (document.queryCommandState(cmd)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        } catch (e) {}
    });

    try {
        const activeFont = document.queryCommandValue('fontName');
        if (activeFont) {
            const cleanFont = activeFont.replace(/['"]/g, '');
            const fontSelect = document.getElementById('fontName');
            if (fontSelect) {
                for (let i = 0; i < fontSelect.options.length; i++) {
                    if (fontSelect.options[i].value.toLowerCase() === cleanFont.toLowerCase()) {
                        fontSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }
        const activeSize = document.queryCommandValue('fontSize');
        if (activeSize) {
            const sizeSelect = document.getElementById('fontSize');
            if (sizeSelect) {
                for (let i = 0; i < sizeSelect.options.length; i++) {
                    if (sizeSelect.options[i].value === activeSize) {
                        sizeSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }
        const activeBlock = document.queryCommandValue('formatBlock');
        if (activeBlock) {
            const blockSelect = document.getElementById('formatBlock');
            if (blockSelect) {
                for (let i = 0; i < blockSelect.options.length; i++) {
                    if (blockSelect.options[i].value.toLowerCase() === activeBlock.toLowerCase()) {
                        blockSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }

        const activeForeColor = document.queryCommandValue('foreColor');
        if (activeForeColor) {
            const textInd = document.querySelector('.text-color-ind');
            if (textInd) {
                textInd.style.backgroundColor = activeForeColor;
            }
        }

        const activeBgColor = document.queryCommandValue('hiliteColor') || document.queryCommandValue('backColor');
        if (activeBgColor && activeBgColor !== 'transparent' && activeBgColor !== 'rgba(0, 0, 0, 0)') {
            const bgInd = document.querySelector('.bg-color-ind');
            if (bgInd) {
                bgInd.style.backgroundColor = activeBgColor;
            }
        }
    } catch (e) {}
}
function copyDuongDanChiaSe() {
    const blogTitle = editorTitle.innerText.trim() || 'Bài viết mới';
    const fakeLink = window.location.origin + '/blog/draft?title=' + encodeURIComponent(blogTitle);

    navigator.clipboard.writeText(fakeLink).then(function() {
        if (window.Swal) {
            Swal.fire({
                title: 'Thành công!',
                text: 'Đã copy đường dẫn chia sẻ bài viết vào Clipboard.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            alert('Đã copy đường dẫn chia sẻ bài viết thành công!');
        }
    }).catch(function(err) {
        console.error('Lỗi sao chép:', err);
    });
}
function generateSlug(title) {
    if (!title) return '';
    let slug = title.toLowerCase();
    
    slug = slug.replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a');
    slug = slug.replace(/[éèẻẽẹêếềểễệ]/g, 'e');
    slug = slug.replace(/[íìỉĩị]/g, 'i');
    slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o');
    slug = slug.replace(/[úùủũụưứừửữự]/g, 'u');
    slug = slug.replace(/[ýỳỷỹỵ]/g, 'y');
    slug = slug.replace(/đ/g, 'd');
    
    slug = slug.replace(/[^a-z0-9\s-]/g, '');
    
    slug = slug.replace(/[\s-]+/g, '-');
    
    slug = slug.trim().replace(/^-+|-+$/g, '');
    
    return slug;
}

function xuLyXuatFile(format) {
    const title = editorTitle.innerText.trim() || 'Bài viết mới';
    const bodyContent = editorBody.innerHTML;
    const descContent = inputDesc.value.trim();

    const generateFinalHTML = function() {
        return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #374151; }
        h1 { font-size: 2.5em; margin-bottom: 0.5em; color: #1F2937; }
        h2 { font-size: 1.8em; margin-top: 1.5em; color: #1F2937; }
        blockquote { border-left: 4px solid #FF8400; padding-left: 20px; margin: 20px 0; font-style: italic; color: #6B7280; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #E5E7EB; padding: 12px; text-align: left; }
        th { background: #F3F4F6; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <p><em>Mô tả bài viết: ${descContent || 'Chưa có mô tả'}</em></p>
    <hr>
    <div>
        ${bodyContent}
    </div>
</body>
</html>`;
    };

    if (format === 'publish') {
        if (window.Swal) {
            Swal.fire({
                title: 'Đăng bài viết',
                text: 'Bạn có chắc chắn muốn đăng bài viết này lên hệ thống không?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Đăng ngay',
                confirmButtonColor: '#FF8400',
                cancelButtonText: 'Hủy',
                showLoaderOnConfirm: true,
                preConfirm: async function() {
                    try {
                        let coverUrl = inputCover ? inputCover.value.trim() : '';
                        if (fileCover && fileCover.files && fileCover.files[0]) {
                            const file = fileCover.files[0];
                            const ext = file.name.split('.').pop();
                            const fileName = `cover_${Date.now()}.${ext}`;
                            const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/covers/${fileName}`;
                            const uploadRes = await fetch(uploadUrl, {
                                method: 'POST',
                                headers: {
                                    'apikey': SUPABASE_KEY,
                                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                                    'Content-Type': file.type
                                },
                                body: file
                            });
                            
                            if (uploadRes.ok) {
                                coverUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/covers/${fileName}`;
                            } else {
                                const fallbackBucket = 'PrismUploadDocuments2026';
                                const fallbackUrl = `${SUPABASE_URL}/storage/v1/object/${fallbackBucket}/covers/${fileName}`;
                                const fallbackRes = await fetch(fallbackUrl, {
                                    method: 'POST',
                                    headers: {
                                        'apikey': SUPABASE_KEY,
                                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                                        'Content-Type': file.type
                                    },
                                    body: file
                                });
                                if (fallbackRes.ok) {
                                    coverUrl = `${SUPABASE_URL}/storage/v1/object/public/${fallbackBucket}/covers/${fileName}`;
                                } else {
                                    const errText = await uploadRes.text();
                                    throw new Error(`Lỗi tải ảnh bìa: ${errText}`);
                                }
                            }
                        }

                        const slug = generateSlug(title) || `bai-viet-${Date.now()}`;
                        const ngayHienTai = new Date().toISOString();

                        const dbUrl = `${SUPABASE_URL}/rest/v1/${TABLE_NAME_BLOGS}`;
                        const dbRes = await fetch(dbUrl, {
                            method: 'POST',
                            headers: {
                                'apikey': SUPABASE_KEY,
                                'Authorization': `Bearer ${SUPABASE_KEY}`,
                                'Content-Type': 'application/json',
                                'Prefer': 'return=representation'
                            },
                            body: JSON.stringify({
                                tieuDe: title,
                                duongDan: slug,
                                moTa: descContent || "Bài viết chia sẻ kiến thức.",
                                noiDung: bodyContent,
                                anhMinhHoa: coverUrl || "Pictures/KTCT.svg",
                                ngayTao: ngayHienTai,
                                ngayCapNhat: ngayHienTai,
                                ngayDang: ngayHienTai
                            })
                        });

                        if (!dbRes.ok) {
                            const errText = await dbRes.text();
                            throw new Error(`Lỗi lưu DB: ${errText}`);
                        }

                        return true;
                    } catch (error) {
                        console.error('Lỗi đăng bài:', error);
                        Swal.showValidationMessage(`Có lỗi xảy ra: ${error.message}`);
                        return false;
                    }
                },
                allowOutsideClick: function() { return !Swal.isLoading(); }
            }).then(function(result) {
                if (result.isConfirmed) {
                    localStorage.removeItem(DRAFT_STORAGE_KEY);

                    Swal.fire({
                        title: 'Đăng bài thành công!',
                        text: 'Bài viết của bạn đã được xuất bản và thêm vào danh sách blogs.',
                        icon: 'success',
                        confirmButtonColor: '#FF8400'
                    }).then(function() {
                        window.location.href = 'allfile.html';
                    });
                }
            });
        } else {
            if (confirm('Bạn có muốn đăng bài viết này lên hệ thống không?')) {
                alert('Chức năng yêu cầu kết nối mạng và SweetAlert2 để chạy tải tệp.');
            }
        }
    } else if (format === 'draft') {
        luuBanNhap();
        if (window.Swal) {
            Swal.fire({
                title: 'Đã lưu bản nháp',
                text: 'Đã lưu thủ công bài viết thành công.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            alert('Đã lưu bản nháp thành công!');
        }
    } else if (format === 'html') {
        const finalHTML = generateFinalHTML();
        const blobFile = new Blob([finalHTML], { type: 'text/html;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blobFile);
        const aElement = document.createElement('a');
        
        aElement.href = downloadUrl;
        aElement.download = title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.html';
        document.body.appendChild(aElement);
        aElement.click();
        
        document.body.removeChild(aElement);
        URL.revokeObjectURL(downloadUrl);
    }
}

document.addEventListener('DOMContentLoaded', khoiTaoPage);
