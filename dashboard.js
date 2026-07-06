
(function() {
    'use strict';
    const SUPABASE_URL = 'https://biyyiobvozlgmuphsrph.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_jiPT2DziUxHLqQN5SILw-w_iwiha-DW';
    const TABLE_NAME = 'PrismUploadDocuments2026';
    const BUCKET_NAME = 'PrismUploadDocuments2026';
    const ITEMS_PER_PAGE = 5;
    let allDocuments = [];
    let filteredDocuments = [];
    let currentPage = 1;
    let selectedDocIds = new Set();
    let activeContextDocId = null;
    const docTableBody = document.getElementById('docTableBody');
    const pagination = document.getElementById('pagination');
    const emptyState = document.getElementById('emptyState');
    const filterSearch = document.getElementById('filterSearch');
    const filterFormat = document.getElementById('filterFormat');
    const filterSubject = document.getElementById('filterSubject');
    const filterSort = document.getElementById('filterSort');
    const selectAllCheckbox = document.getElementById('selectAll');
    const batchActions = document.getElementById('batchActions');
    const selectedCount = document.getElementById('selectedCount');
    const btnBatchDelete = document.getElementById('btnBatchDelete');
    const btnUpload = document.getElementById('btnUpload');
    const btnWriteBlog = document.querySelector('.btn-write-blog');
    const contextMenu = document.getElementById('contextMenu');
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const editModalClose = document.getElementById('editModalClose');
    const editCancelBtn = document.getElementById('editCancelBtn');
    const deleteModal = document.getElementById('deleteModal');
    const deleteCancelBtn = document.getElementById('deleteCancelBtn');
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    const deleteDocName = document.getElementById('deleteDocName');
    const headerSearch = document.getElementById('headerSearch');
    const dashUserName = document.getElementById('dashUserName');
    const dashUserEmail = document.getElementById('dashUserEmail');
    const userAvatarInitial = document.getElementById('userAvatarInitial');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    function checkAdminAccess() {
        const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
        if (!isAdmin) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
    function init() {
        if (!checkAdminAccess()) return;
        loadUserInfo();
        loadDocuments();
        bindEvents();
    }

    function loadUserInfo() {
        const userName = localStorage.getItem('userName') || 'Admin';
        const userEmail = localStorage.getItem('userEmail') || 'admin@doczone.com';
        if (dashUserName) dashUserName.textContent = `${userName}`;
        if (dashUserEmail) dashUserEmail.textContent = userEmail;
        if (userAvatarInitial) userAvatarInitial.textContent = userName.charAt(0).toUpperCase();
    }

    function showToast(message, isError = false) {
        if (toastMessage) toastMessage.textContent = message;
        if (toast) {
            toast.classList.remove('error');
            if (isError) toast.classList.add('error');
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    function getHeaders() {
        return {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    async function loadDocuments() {
        try {
            renderLoadingSkeleton();
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*&order=id.desc`,
                { method: 'GET', headers: getHeaders() }
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            allDocuments = data;
            populateSubjectFilter();
            applyFilters();
        } catch (err) {
            console.error('Lỗi tải tài liệu:', err);
            showToast('Không thể tải danh sách tài liệu', true);
            if (docTableBody) docTableBody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
        }
    }

    function renderLoadingSkeleton() {
        if (!docTableBody) return;
        let html = '';
        for (let i = 0; i < ITEMS_PER_PAGE; i++) {
            html += `<tr class="skeleton-row">
                <td class="checkbox-cell"><div class="skeleton-cell" style="width:16px;height:16px;"></div></td>
                <td><div class="skeleton-cell" style="width:200px;height:16px;"></div></td>
                <td><div class="skeleton-cell" style="width:80px;height:16px;"></div></td>
                <td><div class="skeleton-cell" style="width:50px;height:16px;"></div></td>
                <td><div class="skeleton-cell" style="width:40px;height:16px;"></div></td>
                <td><div class="skeleton-cell" style="width:40px;height:16px;"></div></td>
                <td><div class="skeleton-cell" style="width:80px;height:16px;"></div></td>
            </tr>`;
        }
        docTableBody.innerHTML = html;
        if (emptyState) emptyState.style.display = 'none';
    }

    function populateSubjectFilter() {
        if (!filterSubject) return;
        const subjects = [...new Set(allDocuments.map(d => d.subject).filter(Boolean))];
        filterSubject.innerHTML = '<option value="">Tất cả môn học</option>';
        subjects.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = getSubjectDisplayName(s);
            filterSubject.appendChild(opt);
        });
    }

    function getSubjectDisplayName(subject) {
        const map = {
            'kinhtechinhtri': 'Kinh tế chính trị',
            'KTCT': 'Kinh tế chính trị',
            'triethoc': 'Triết học',
            'HTMT': 'Hệ thống máy tính',
            'KTLT': 'Kỹ thuật lập trình',
            'HTMLCSSJS': 'HTML/CSS/JS',
            'laptrinh': 'Lập trình',
            'toantin': 'Toán - Tin',
            'thongke': 'Thống kê',
            'kinhte': 'Kinh tế',
            'marketing': 'Marketing'
        };
        return map[subject] || subject;
    }

    function getSubjectBadgeClass(subject) {
        const s = (subject || '').toLowerCase();
        if (s.includes('toan') || s.includes('tin') || s.includes('toantin')) return 'toan-tin';
        if (s.includes('lap') || s.includes('ktlt') || s.includes('html') || s.includes('htmt')) return 'lap-trinh';
        if (s.includes('triet') || s.includes('mac')) return 'triet-hoc';
        if (s.includes('kinh') || s.includes('marketing') || s.includes('ktct')) return 'kinh-te';
        if (s.includes('thong')) return 'thong-ke';
        return 'default';
    }

    function getFileFormat(url) {
        if (!url) return 'PDF';
        const lower = url.toLowerCase();
        if (lower.includes('.docx') || lower.includes('.doc')) return 'DOCX';
        if (lower.includes('.pptx') || lower.includes('.ppt')) return 'PPTX';
        if (lower.includes('.xlsx') || lower.includes('.xls')) return 'XLSX';
        return 'PDF';
    }

    function getFormatClass(format) {
        return format.toLowerCase().replace('.', '');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '--';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '--';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function generateStats(id) {
        const seed = id || 1;
        const views = 100 + ((seed * 47) % 400);
        const downloads = Math.floor(views * 0.5 + ((seed * 23) % 100));
        return { views, downloads };
    }

    function applyFilters() {
        let docs = [...allDocuments];
        
        const searchTerm = (filterSearch ? filterSearch.value : '').trim().toLowerCase();
        if (searchTerm) {
            docs = docs.filter(d => 
                (d.name || '').toLowerCase().includes(searchTerm) ||
                (d.subject || '').toLowerCase().includes(searchTerm) ||
                (d.school || '').toLowerCase().includes(searchTerm)
            );
        }

        const formatVal = filterFormat ? filterFormat.value : '';
        if (formatVal) {
            docs = docs.filter(d => {
                const fmt = getFileFormat(d.url).toLowerCase();
                return fmt === formatVal;
            });
        }

        const subjectVal = filterSubject ? filterSubject.value : '';
        if (subjectVal) {
            docs = docs.filter(d => d.subject === subjectVal);
        }

        const sortVal = filterSort ? filterSort.value : 'newest';
        switch (sortVal) {
            case 'oldest':
                docs.sort((a, b) => (a.id || 0) - (b.id || 0));
                break;
            case 'name-asc':
                docs.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'name-desc':
                docs.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
            default: // newest
                docs.sort((a, b) => (b.id || 0) - (a.id || 0));
        }

        filteredDocuments = docs;
        currentPage = 1;
        selectedDocIds.clear();
        updateBatchActions();
        renderTable();
        renderPagination();
    }

    function renderTable() {
        if (!docTableBody) return;

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageDocs = filteredDocuments.slice(start, end);

        if (filteredDocuments.length === 0) {
            docTableBody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            if (pagination) pagination.style.display = 'none';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (pagination) pagination.style.display = 'flex';

        let html = '';
        pageDocs.forEach(doc => {
            const format = getFileFormat(doc.url);
            const formatClass = getFormatClass(format);
            const subjectBadge = getSubjectBadgeClass(doc.subject);
            const subjectName = getSubjectDisplayName(doc.subject || '');
            const stats = generateStats(doc.id);
            const date = formatDate(doc.created_at);
            const isChecked = selectedDocIds.has(doc.id) ? 'checked' : '';
            const selectedClass = selectedDocIds.has(doc.id) ? 'selected' : '';

            html += `<tr data-id="${doc.id}" class="${selectedClass}">
                <td class="checkbox-cell">
                    <input type="checkbox" class="row-checkbox" data-id="${doc.id}" ${isChecked}>
                </td>
                <td>
                    <div class="doc-name-cell">
                        <div class="doc-icon ${formatClass}">${format}</div>
                        <span class="doc-name-text" title="${doc.name || ''}">${doc.name || 'Không có tên'}</span>
                    </div>
                </td>
                <td><span class="subject-badge ${subjectBadge}">${subjectName}</span></td>
                <td><span class="format-text">${format}</span></td>
                <td><span class="views-text">${stats.views}</span></td>
                <td><span class="downloads-text">${stats.downloads}</span></td>
                <td>
                    <div class="action-cell">
                        <button class="action-btn-icon edit" title="Chỉnh sửa" data-id="${doc.id}">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="action-btn-icon delete" title="Xóa" data-id="${doc.id}">
                            <i data-lucide="trash-2"></i>
                        </button>
                        <button class="action-btn-icon more" title="Thêm" data-id="${doc.id}">
                            <i data-lucide="more-vertical"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        });

        docTableBody.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();

        if (selectAllCheckbox) {
            const pageIds = pageDocs.map(d => d.id);
            const allSelected = pageIds.length > 0 && pageIds.every(id => selectedDocIds.has(id));
            selectAllCheckbox.checked = allSelected;
        }
    }

    function renderPagination() {
        if (!pagination) return;
        const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            pagination.style.display = 'none';
            return;
        }
        pagination.style.display = 'flex';

        let html = '';
        html += `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" data-page="prev">
            <i data-lucide="chevron-left"></i>
        </button>`;

        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            html += `<button class="page-btn" data-page="1">1</button>`;
            if (startPage > 2) html += `<span class="page-dots">...</span>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<span class="page-dots">...</span>`;
            html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        html += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" data-page="next">
            <i data-lucide="chevron-right"></i>
        </button>`;

        pagination.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
    }

    function updateBatchActions() {
        if (!batchActions || !selectedCount) return;
        if (selectedDocIds.size > 0) {
            batchActions.classList.add('show');
            selectedCount.textContent = `${selectedDocIds.size} tài liệu được chọn`;
        } else {
            batchActions.classList.remove('show');
        }
    }

    function showContextMenu(x, y, docId) {
        activeContextDocId = docId;
        if (!contextMenu) return;
        contextMenu.classList.add('show');
        
        const menuWidth = 180;
        const menuHeight = 220;
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;
        
        let posX = x;
        let posY = y;
        if (x + menuWidth > viewW) posX = x - menuWidth;
        if (y + menuHeight > viewH) posY = y - menuHeight;
        
        contextMenu.style.left = posX + 'px';
        contextMenu.style.top = posY + 'px';
    }

    function hideContextMenu() {
        if (contextMenu) contextMenu.classList.remove('show');
        activeContextDocId = null;
    }

    function openEditModal(docId) {
        const doc = allDocuments.find(d => d.id == docId);
        if (!doc) return;

        document.getElementById('editDocId').value = doc.id;
        document.getElementById('editName').value = doc.name || '';
        document.getElementById('editSubject').value = doc.subject || '';
        document.getElementById('editSchool').value = doc.school || '';
        document.getElementById('editCategory').value = doc.category || '';
        document.getElementById('editYears').value = doc.years || '';
        document.getElementById('editDescription').value = doc.discription || '';

        if (editModal) editModal.classList.add('show');
    }

    function closeEditModal() {
        if (editModal) editModal.classList.remove('show');
    }

    async function saveEdit(e) {
        e.preventDefault();
        const docId = document.getElementById('editDocId').value;
        const updatedData = {
            name: document.getElementById('editName').value.trim(),
            subject: document.getElementById('editSubject').value.trim(),
            school: document.getElementById('editSchool').value.trim(),
            category: document.getElementById('editCategory').value,
            years: document.getElementById('editYears').value.trim(),
            discription: document.getElementById('editDescription').value.trim()
        };

        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${docId}`,
                {
                    method: 'PATCH',
                    headers: getHeaders(),
                    body: JSON.stringify(updatedData)
                }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            closeEditModal();
            showToast('Cập nhật tài liệu thành công!');
            await loadDocuments();
        } catch (err) {
            console.error('Lỗi cập nhật:', err);
            showToast('Không thể cập nhật tài liệu', true);
        }
    }

    let pendingDeleteId = null;
    let pendingDeleteBatch = false;

    function openDeleteModal(docId) {
        pendingDeleteId = docId;
        pendingDeleteBatch = false;
        const doc = allDocuments.find(d => d.id == docId);
        if (deleteDocName) {
            deleteDocName.textContent = `Bạn có chắc muốn xóa "${doc ? doc.name : 'tài liệu này'}"?`;
        }
        if (deleteModal) deleteModal.classList.add('show');
    }

    function openBatchDeleteModal() {
        pendingDeleteBatch = true;
        pendingDeleteId = null;
        if (deleteDocName) {
            deleteDocName.textContent = `Bạn có chắc muốn xóa ${selectedDocIds.size} tài liệu đã chọn?`;
        }
        if (deleteModal) deleteModal.classList.add('show');
    }

    function closeDeleteModal() {
        if (deleteModal) deleteModal.classList.remove('show');
        pendingDeleteId = null;
        pendingDeleteBatch = false;
    }

    async function confirmDelete() {
        try {
            if (pendingDeleteBatch) {
                const ids = [...selectedDocIds];
                for (const id of ids) {
                    await deleteDocumentById(id);
                }
                selectedDocIds.clear();
                updateBatchActions();
                showToast(`Đã xóa ${ids.length} tài liệu thành công!`);
            } else if (pendingDeleteId) {
                await deleteDocumentById(pendingDeleteId);
                selectedDocIds.delete(pendingDeleteId);
                updateBatchActions();
                showToast('Đã xóa tài liệu thành công!');
            }
            closeDeleteModal();
            await loadDocuments();
        } catch (err) {
            console.error('Lỗi xóa:', err);
            showToast('Không thể xóa tài liệu', true);
            closeDeleteModal();
        }
    }

    async function deleteDocumentById(docId) {
        const doc = allDocuments.find(d => d.id == docId);
        
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${docId}`,
            {
                method: 'DELETE',
                headers: getHeaders()
            }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        if (doc) {
            try {
                if (doc.url) {
                    const filePath = extractStoragePath(doc.url, 'files');
                    if (filePath) await deleteStorageFile(filePath);
                }
                if (doc.thumbnail) {
                    const coverPath = extractStoragePath(doc.thumbnail, 'covers');
                    if (coverPath) await deleteStorageFile(coverPath);
                }
            } catch (storageErr) {
                console.warn('Không thể xóa file từ storage:', storageErr);
            }
        }
    }

    function extractStoragePath(publicUrl, folder) {
        if (!publicUrl) return null;
        const marker = `/${BUCKET_NAME}/${folder}/`;
        const idx = publicUrl.indexOf(marker);
        if (idx === -1) return null;
        return `${folder}/${publicUrl.substring(idx + marker.length)}`;
    }

    async function deleteStorageFile(filePath) {
        const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`;
        await fetch(url, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
    }

    function copyDocLink(docId) {
        const doc = allDocuments.find(d => d.id == docId);
        if (doc && doc.url) {
            navigator.clipboard.writeText(doc.url).then(() => {
                showToast('Đã sao chép liên kết!');
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = doc.url;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                showToast('Đã sao chép liên kết!');
            });
        } else {
            showToast('Không có liên kết để sao chép', true);
        }
    }

    function bindEvents() {
        if (filterSearch) {
            let debounceTimer;
            filterSearch.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => applyFilters(), 300);
            });
        }
        if (filterFormat) filterFormat.addEventListener('change', applyFilters);
        if (filterSubject) filterSubject.addEventListener('change', applyFilters);
        if (filterSort) filterSort.addEventListener('change', applyFilters);

        if (headerSearch) {
            headerSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const q = headerSearch.value.trim();
                    if (filterSearch) {
                        filterSearch.value = q;
                        applyFilters();
                    }
                }
            });
        }

        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', () => {
                const start = (currentPage - 1) * ITEMS_PER_PAGE;
                const end = start + ITEMS_PER_PAGE;
                const pageDocs = filteredDocuments.slice(start, end);
                
                if (selectAllCheckbox.checked) {
                    pageDocs.forEach(d => selectedDocIds.add(d.id));
                } else {
                    pageDocs.forEach(d => selectedDocIds.delete(d.id));
                }
                updateBatchActions();
                renderTable();
            });
        }

        if (docTableBody) {
            docTableBody.addEventListener('change', (e) => {
                if (e.target.classList.contains('row-checkbox')) {
                    const id = parseInt(e.target.dataset.id);
                    if (e.target.checked) {
                        selectedDocIds.add(id);
                    } else {
                        selectedDocIds.delete(id);
                    }
                    const row = e.target.closest('tr');
                    if (row) row.classList.toggle('selected', e.target.checked);
                    updateBatchActions();
                    if (selectAllCheckbox) {
                        const start = (currentPage - 1) * ITEMS_PER_PAGE;
                        const end = start + ITEMS_PER_PAGE;
                        const pageDocs = filteredDocuments.slice(start, end);
                        selectAllCheckbox.checked = pageDocs.length > 0 && pageDocs.every(d => selectedDocIds.has(d.id));
                    }
                }
            });

            docTableBody.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.action-btn-icon.edit');
                const deleteBtn = e.target.closest('.action-btn-icon.delete');
                const moreBtn = e.target.closest('.action-btn-icon.more');

                if (editBtn) {
                    e.stopPropagation();
                    openEditModal(editBtn.dataset.id);
                } else if (deleteBtn) {
                    e.stopPropagation();
                    openDeleteModal(parseInt(deleteBtn.dataset.id));
                } else if (moreBtn) {
                    e.stopPropagation();
                    const rect = moreBtn.getBoundingClientRect();
                    showContextMenu(rect.right, rect.bottom, parseInt(moreBtn.dataset.id));
                }
            });
        }

        if (pagination) {
            pagination.addEventListener('click', (e) => {
                const btn = e.target.closest('.page-btn');
                if (!btn || btn.classList.contains('disabled')) return;
                
                const page = btn.dataset.page;
                const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
                
                if (page === 'prev') {
                    currentPage = Math.max(1, currentPage - 1);
                } else if (page === 'next') {
                    currentPage = Math.min(totalPages, currentPage + 1);
                } else {
                    currentPage = parseInt(page);
                }
                
                renderTable();
                renderPagination();
            });
        }

        if (contextMenu) {
            contextMenu.addEventListener('click', (e) => {
                const item = e.target.closest('.context-menu-item');
                if (!item) return;
                
                const action = item.dataset.action;
                switch (action) {
                    case 'view':
                        const viewDoc = allDocuments.find(d => d.id == activeContextDocId);
                        if (viewDoc && viewDoc.url) {
                            window.open(viewDoc.url, '_blank');
                        }
                        break;
                    case 'edit':
                        openEditModal(activeContextDocId);
                        break;
                    case 'move':
                        showToast('Tính năng di chuyển đang được phát triển');
                        break;
                    case 'copy-link':
                        copyDocLink(activeContextDocId);
                        break;
                    case 'delete':
                        openDeleteModal(activeContextDocId);
                        break;
                }
                hideContextMenu();
            });
        }

        document.addEventListener('click', (e) => {
            if (contextMenu && !contextMenu.contains(e.target)) {
                hideContextMenu();
            }
        });

        if (btnUpload) {
            btnUpload.addEventListener('click', () => {
                window.location.href = 'index.html?upload=true';
            });
        }

        if (btnWriteBlog) {
            btnWriteBlog.addEventListener('click', () => {
                window.location.href = 'write-blog.html';
            });
        }

        if (btnBatchDelete) {
            btnBatchDelete.addEventListener('click', () => {
                if (selectedDocIds.size > 0) openBatchDeleteModal();
            });
        }

        if (editModalClose) editModalClose.addEventListener('click', closeEditModal);
        if (editCancelBtn) editCancelBtn.addEventListener('click', closeEditModal);
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) closeEditModal();
            });
        }
        if (editForm) editForm.addEventListener('submit', saveEdit);

        if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', closeDeleteModal);
        if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', confirmDelete);
        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target === deleteModal) closeDeleteModal();
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeEditModal();
                closeDeleteModal();
                hideContextMenu();
            }
        });
        const headerUser = document.getElementById('headerUser');
        if (headerUser) {
            headerUser.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }
    document.addEventListener('DOMContentLoaded', init);
})();
