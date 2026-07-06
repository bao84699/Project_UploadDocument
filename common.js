document.addEventListener('DOMContentLoaded', function() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownImg = dropdownBtn ? dropdownBtn.querySelector('img') : null;
    const userBtn = document.getElementById('user');

    const accountPopupOverlay = document.getElementById('accountPopupOverlay');
    const accountPopup = document.getElementById('accountPopup');
    const accountPopupClose = document.getElementById('accountPopupClose');
    const accountLogoutBtn = document.getElementById('accountLogoutBtn');
    const accountPopupName = document.getElementById('accountPopupName');
    const accountPopupEmail = document.getElementById('accountPopupEmail');

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName') || '';
    const userEmail = localStorage.getItem('userEmail') || '';

    if (isLoggedIn) {
        if (dropdownImg) {
            dropdownImg.src = 'Pictures/user.svg';
            dropdownImg.alt = userName;
        }
        if (accountPopupName) {
            accountPopupName.textContent = userName || 'Bạn';
        }
        if (accountPopupEmail) {
            accountPopupEmail.textContent = userEmail || 'user@gmail.com';
        }
        if (userBtn) {
            userBtn.textContent = userName || 'Thành viên';
            userBtn.href = '#';
            userBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openAccountPopup();
            });
        }
        if (dropdownMenu && !document.getElementById('logout-item')) {
            const logoutLi = document.createElement('li');
            const logoutLink = document.createElement('a');
            logoutLink.id = 'logout-item';
            logoutLink.href = '#';
            logoutLink.textContent = 'Đăng xuất';
            logoutLink.style.color = '#dc2626';
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                performLogout();
            });
            logoutLi.appendChild(logoutLink);
            dropdownMenu.appendChild(logoutLi);
        }
    } else {
        if (userBtn) {
            userBtn.href = 'login.html';
        }
    }

    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (localStorage.getItem('isLoggedIn') === 'true') {
                dropdownMenu.classList.remove('show');
                openAccountPopup();
                return;
            }
            dropdownMenu.classList.toggle('show');
        });

        window.addEventListener('click', function() {
            dropdownMenu.classList.remove('show');
        });

        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    function openAccountPopup() {
        if (accountPopupOverlay) {
            accountPopupOverlay.style.display = 'flex';
            accountPopupOverlay.offsetHeight;
            accountPopupOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    function closeAccountPopup() {
        if (accountPopupOverlay) {
            accountPopupOverlay.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                accountPopupOverlay.style.display = 'none';
            }, 350);
        }
    }

    if (accountPopupClose) {
        accountPopupClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAccountPopup();
        });
    }

    if (accountPopupOverlay) {
        accountPopupOverlay.addEventListener('click', function(e) {
            if (e.target === accountPopupOverlay) {
                closeAccountPopup();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAccountPopup();
        }
    });

    const accordionHeaders = document.querySelectorAll('.account-accordion-header');
    accordionHeaders.forEach(function(header) {
        header.addEventListener('click', function(e) {
            e.stopPropagation();
            const section = this.getAttribute('data-section');
            const content = document.getElementById('accordion-' + section);
            const isActive = this.classList.contains('active');

            accordionHeaders.forEach(function(h) {
                h.classList.remove('active');
                const s = h.getAttribute('data-section');
                const c = document.getElementById('accordion-' + s);
                if (c) c.classList.remove('open');
            });

            if (!isActive && content) {
                this.classList.add('active');
                content.classList.add('open');
            }
        });
    });

    function performLogout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        sessionStorage.removeItem('isAdmin');
        if (window.Swal) {
            Swal.fire({
                title: 'Đã đăng xuất',
                text: 'Bạn đã đăng xuất thành công!',
                icon: 'success'
            }).then(() => {
                window.location.reload();
            });
        } else {
            window.location.reload();
        }
    }

    if (accountLogoutBtn) {
        accountLogoutBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAccountPopup();
            performLogout();
        });
    }


    const adminBtn = document.getElementById('admin');
    function appendUploadLink() {
        if (!document.getElementById('upload-item') && dropdownMenu) {
            const newLi = document.createElement('li');
            const newLink = document.createElement('a');
            const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === ''; 
            if (isHomePage) {
                newLink.href = "#";
                newLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    const overlay = document.getElementById('uploadForm');
                    if (overlay) {
                        overlay.classList.add('active');
                        dropdownMenu.classList.remove('show');
                    }
                });
            } else {
                newLink.href = "index.html?upload=true";
            }
            
            newLink.id = "upload-item";
            newLink.textContent = "Tải lên";
            newLi.appendChild(newLink);
            dropdownMenu.appendChild(newLi);
        }
    }

    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
        appendUploadLink();
        if (adminBtn) {
            adminBtn.textContent = "Admin";
        }
    }

    if (adminBtn) {
        adminBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (sessionStorage.getItem('isAdmin') === 'true') {
                window.location.href = 'dashboard.html';
                return;
            }

            const passInput = prompt("Vui lòng nhập mật khẩu Admin:");
            const adminPassword = "123";

            if (passInput === adminPassword) {
                sessionStorage.setItem('isAdmin', 'true');
                appendUploadLink();
                if (adminBtn) {
                    adminBtn.textContent = "Trang quản trị";
                }
                if (window.Swal) {
                    Swal.fire({
                        title: "Thành công",
                        text: "Xác nhận Admin thành công!",
                        icon: "success"
                    }).then(() => {
                        window.location.href = 'dashboard.html';
                    });
                } else {
                    alert("Xác nhận Admin thành công!");
                    window.location.href = 'dashboard.html';
                }
            } else if (passInput !== null) {
                if (window.Swal) {
                    Swal.fire({
                        title: "Thất bại",
                        text: "Sai mật khẩu Admin!",
                        icon: "error"
                    });
                } else {
                    alert("Sai mật khẩu Admin!");
                }
            }
        });
    }

    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const startX = e.clientX;
        const startY = e.clientY;
        
        for (let i = 0; i < 12; i++) {
            createExplosionStar(startX, startY);
        }
    });
});

function getRandomColor() {
    const colors = ['#FF8400', '#FDBA24', '#83BDFF', '#FF5733', '#33FF57', '#3357FF', '#F39C12'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function createExplosionStar(x, y) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.backgroundColor = getRandomColor();
    
    const explodeX = (Math.random() - 0.5) * 80; 
    const explodeY = (Math.random() - 0.5) * 80;
    star.style.setProperty('--x', `${explodeX}px`);
    star.style.setProperty('--y', `${explodeY}px`);
    
    document.body.appendChild(star);
    
    requestAnimationFrame(() => star.classList.add('animate'));
    
    setTimeout(() => star.remove(), 600);
}
