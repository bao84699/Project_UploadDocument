lucide.createIcons();
const upload = document.getElementById("btn-upload");
const overlay = document.getElementById("overlay");

upload.addEventListener("click", ()=> {
    overlay.classList.add("active");
})
overlay.addEventListener("click", (e)=> {
    if (e.target == overlay) {
        overlay.classList.remove("active");
    }
})

