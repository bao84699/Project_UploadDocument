lucide.createIcons();
document.addEventListener('DOMContentLoaded', function() {
    const adminBtn = document.getElementById('admin');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownBtn = document.getElementById('dropdownBtn');
    const overlay = document.querySelector('.overlay');
    const uploadForm = document.querySelector('.upload-form');
    const uploadBtn = document.getElementById("upload-file");
    const fileInput = document.getElementById("file-input");
    const title = document.querySelector(".title");
    const fileName = document.getElementById("fileName");
    //Hiển thị dropdown
    dropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        for (let i = 0; i < 25; i++) {
            createStar(startX, startY);
        }
            dropdownMenu.classList.toggle('show');
        });
    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation(); 
        const startX = e.clientX;
        const startY = e.clientY;
        for (let i = 0; i < 25; i++) {
            createStar(startX, startY);
        }
        });
    //Xử lí sự kiện khi chọn là admin
    adminBtn.addEventListener('click', function(e) {
        const startX = e.clientX;
        const startY = e.clientY;
        for (let i = 0; i < 25; i++) {
            createStar(startX, startY);
        }
        e.preventDefault();
        if (document.getElementById('upload-item')) return;
        const passInput = prompt("Vui lòng nhập mật khẩu Admin:");
        const adminPassword = "123"; // Thay pass 

        if (passInput === adminPassword) {
            const newLi = document.createElement('li');
            const newLink = document.createElement('a');
            newLink.href = "#";
            newLink.id = "upload-item";
            newLink.textContent = "Tải lên";
            newLi.appendChild(newLink);
            dropdownMenu.appendChild(newLi);
            alert("Xác nhận Admin thành công!");
        } else if (passInput !== null) {
            alert("Sai mật khẩu!");
        }
    });
    //Xử lí sự kiện hiển thị form upload
    dropdownMenu.addEventListener('click', function(e) {
        const startX = e.clientX;
        const startY = e.clientY;
        for (let i = 0; i < 25; i++) {
            createStar(startX, startY);
        }
        if (e.target && e.target.id === 'upload-item') {
            e.preventDefault();
            if (overlay) {
                overlay.classList.add('active'); 
                dropdownMenu.classList.remove('show'); 
            }
        }
    });
    //Xử lí việc upload file.
    overlay.addEventListener("click", ()=> {
        overlay.classList.remove('active');
        resetUploadForm();
    })
    uploadForm.addEventListener("click", (e) => {
        e.stopPropagation();
    });
    uploadBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    var validFiles = [];
    fileInput.addEventListener("change", (event) => {
        const files = event.target.files;
        if (files.length === 0) return;
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        const allowedExt = ["pdf", "doc", "docx"];
        validFiles = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split(".").pop().toLowerCase();
            if (allowedTypes.includes(file.type) && allowedExt.includes(ext)) {
                validFiles.push(file);
            }
        }
        if (validFiles.length === 0) {
            alert("Chỉ cho phép file PDF, DOC, DOCX");
            fileInput.value = "";
            title.textContent = "Kéo và thả tệp";
            return;
        }
        if (validFiles.length === 1) {
            title.textContent = `Đã chọn: ${validFiles[0].name}`;
            fileName.textContent = `${validFiles[0].name}`;
        }
    });
    const submitBtn = document.getElementById("submit");
    const dropZone = document.getElementById("drop-zone");
    const overlay2 = document.getElementById("overlay2");
    submitBtn.addEventListener("click", (e) => {
        e.preventDefault(); 
        if (validFiles.length > 0) {
            dropZone.classList.add("active");
            setTimeout(() => {
                overlay2.classList.add("active");
            }, 1100); 
        } 
    });
const submitBtn2 = document.getElementById("submit2");

submitBtn2.addEventListener("click", (e) => {
    // 1. Khai báo danh sách các ID cần kiểm tra
    const fields = [
        { id: 'schoolCode', name: 'Mã trường' },
        { id: 'inputFileName', name: 'Tên file' },
        { id: 'subject', name: 'Môn học' },
        { id: 'academicYear', name: 'Năm học' },
        { id: 'category', name: 'Phân loại' },
        { id: 'author', name: 'Tác giả' },
        { id: 'description', name: 'Giới thiệu' }
    ];

    let firstEmptyField = null;

    // 2. Kiểm tra các ô input/select
    fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            if (!element.value.trim()) {
                element.style.border = "1px solid red";
                if (!firstEmptyField) firstEmptyField = field.name;
            } else {
                element.style.border = ""; // Reset border nếu đã nhập
            }
        }
    });

    // 3. Kiểm tra riêng file ảnh (fileInput)
    if (fileInput.files.length === 0) {
        document.querySelector('.importPicture').style.border = "2px dashed red";
        if (!firstEmptyField) firstEmptyField = "Ảnh tài liệu";
    } else {
        document.querySelector('.importPicture').style.border = "";
    }

    if (firstEmptyField) {
            Swal.fire({
                title: "Thông báo",
                text: `Vui lòng điền: ${firstEmptyField}`,
                icon: "warning",
                target: 'body', 
                didOpen: () => {
                    Swal.getContainer().style.zIndex = "999999";
                },
                showClass: {
                    popup: 'animate__animated animate__headShake' 
                }
            });
            return;
        }
        overlay2.classList.remove("active");
        overlay.classList.remove('active');
        dropZone.classList.remove("active");

        Swal.fire("Thành công", "Tài liệu đã được lưu!", "success")
        .then(() => {
            validFiles = [];
            fileInput.value = ""; 
            title.textContent = "Kéo và thả tệp";
            const previewImg = document.getElementById('previewImg');
            if(previewImg) previewImg.src = "Pictures/importPicture.svg";
            const displayFileName = document.getElementById('displayFileName');
            if(displayFileName) displayFileName.textContent = "";
            fields.forEach(field => {
                const el = document.getElementById(field.id);
                if(el) el.value = "";
            });
        });
    });
});
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const title = document.querySelector(".title");
const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];
const allowedExt = ["pdf", "doc", "docx"];
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
});
dropZone.addEventListener("dragover", () => {
    dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});
dropZone.addEventListener("drop", (e) => {
    dropZone.classList.remove("dragover");
    const files = e.dataTransfer.files;
    handleFiles(files);
});
const overlay2 = document.getElementById("overlay2");
const form2 = document.querySelector(".upload-form2");
const closeBtn = document.getElementById("close");
form2.addEventListener("click", (e) => {
    e.stopPropagation();
});
function resetUploadForm() {
    overlay2.classList.remove("active");
    dropZone.classList.remove("active");
    validFiles = [];      
    fileInput.value = "";  
    title.textContent = "Kéo và thả tệp"; 
    if (fileName) fileName.textContent = ""; 
}
overlay2.addEventListener("click", () => {
    resetUploadForm();
});
closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetUploadForm();
});

const items = document.querySelectorAll('.item');
const overlay = document.getElementById('overlaydescript');
items.forEach(item => {
    item.addEventListener('click', () => {
        overlay.classList.add('show'); 
    });
});
overlay.addEventListener('click', (e) => {
    if (e.target.id === 'overlaydescript') {
        overlay.classList.remove('show');
    }
});
const wrapper = document.querySelector('.mascot-wrapper');
let hideTimeout;
wrapper.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    wrapper.classList.add('is-active');
});
wrapper.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(() => {
        wrapper.classList.remove('is-active');
    }, 900);
});
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
    }
    document.addEventListener('click', (e) => {
    const startX = e.clientX;
    const startY = e.clientY;
    for (let i = 0; i < 25; i++) {
        createStar(startX, startY);
    }
});
function createStar(x, y) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.backgroundColor = getRandomColor();
    const explodeX = (Math.random() - 0.5) * 50; 
    const explodeY = (Math.random() - 0.5) * 50;
    star.style.setProperty('--x', `${explodeX}px`);
    star.style.setProperty('--y', `${explodeY}px`);
    document.body.appendChild(star);
    requestAnimationFrame(() => star.classList.add('animate'));
    setTimeout(() => star.remove(), 600);
}
//---------------------------------------------------------
{
    const uploadInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('previewImg');

    if (uploadInput && imagePreview) {
        uploadInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.objectFit = "cover";
                    imagePreview.style.width = "100%";
                    imagePreview.style.height = "100%";
                };
                reader.readAsDataURL(file);
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const yearSelect = document.getElementById('academicYear');
    const startYear = 2015;
    const endYear = 2025; // Năm bắt đầu của kỳ cuối cùng là 2025-2026

    for (let i = startYear; i <= endYear; i++) {
        const yearRange = `${i}-${i + 1}`;
        const option = document.createElement('option');
        option.value = yearRange;
        option.textContent = yearRange;
        yearSelect.appendChild(option);
    }
});