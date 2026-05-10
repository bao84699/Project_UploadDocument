lucide.createIcons();
// const upload = document.getElementById("btn-upload");
// const overlay = document.getElementById("overlay");

// upload.addEventListener("click", ()=> {
//     overlay.classList.add("active");
// })
// overlay.addEventListener("click", (e)=> {
//     if (e.target == overlay) {
//         overlay.classList.remove("active");
//     }
// })

document.addEventListener('DOMContentLoaded', function() {
    const adminBtn = document.getElementById('admin');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownBtn = document.getElementById('dropdownBtn');
    dropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    adminBtn.addEventListener('click', function(e) {
        e.preventDefault(); 
        e.stopPropagation(); 
        if (!document.getElementById('upload-item')) {
            const newLi = document.createElement('li');
            const newLink = document.createElement('a');
            newLink.href = "#";
            newLink.id = "upload-item";
            newLink.textContent = "Tải lên";
            newLi.appendChild(newLink);
            dropdownMenu.appendChild(newLi);
            console.log("Đã thêm nút Tải lên");
        }
    });
    // Click ra ngoài để đóng menu
    window.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
    });
});