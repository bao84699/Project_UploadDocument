lucide.createIcons();

/*---------------KHOI TAO SUPABASE--------------*/
const supabaseUrl2 = "https://hfliuepqksujzfigdbil.supabase.co";
const supabaseKey2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmbGl1ZXBxa3N1anpmaWdkYmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjE0NDQsImV4cCI6MjA3OTUzNzQ0NH0.KBudwsSKj8gq4pVsvZ3myUKY2z0FRD2D9x76EELxFv8";
const supabaseClient2 = supabase.createClient(supabaseUrl2, supabaseKey2);
window.supabaseClient2 = supabaseClient2;

function applyAuthenticatedProfile(profile) {
    if (window.AuthUtils) {
        return window.AuthUtils.applyAuthProfile(profile);
    }

    localStorage.setItem('isLoggedIn', profile.isLoggedIn ? 'true' : 'false');
    localStorage.setItem('userName', profile.userName || '');
    localStorage.setItem('userEmail', profile.userEmail || '');

    if (profile.isLoggedIn && window.AuthUtils && window.AuthUtils.isAdminEmail(profile.userEmail)) {
        sessionStorage.setItem('isAdmin', 'true');
    } else {
        sessionStorage.removeItem('isAdmin');
    }

    return {
        profile,
        isAdmin: sessionStorage.getItem('isAdmin') === 'true'
    };
}

/*---------------XU LI CHUYEN FORM--------------*/
const dangNhap = document.querySelector('.dang-nhap');
const dangKi = document.querySelector('.dang-ki');
const formDangNhap = document.getElementById('dang-nhap-form');
const formDangKi = document.getElementById('dang-ki-form');
dangNhap.addEventListener("click", ()=> {
    dangNhap.classList.add("active-log");
    dangKi.classList.remove("active-log");
    formDangNhap.classList.add("active");
    formDangKi.classList.remove("active")
})
dangKi.addEventListener("click", ()=> {
    dangNhap.classList.remove("active-log");
    dangKi.classList.add("active-log");
    formDangNhap.classList.remove("active");
    formDangKi.classList.add("active")
})
/*---------------XU LI NHAP LIEU DAU VAO FORM DANG KI--------------*/
const btnRegister = document.getElementById("btn-register");
const notification = document.querySelector(".notification");
btnRegister.addEventListener("click", async (e)=> {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email-register").value.trim();
    const password = document.getElementById("password-register").value.trim();
    const loiName = document.getElementById("loi-name");
    const loiEmail = document.getElementById("loi-email-register");
    const loiPassword = document.getElementById("loi-matkhau-register");
    let check = 0;
    loiPassword.style.display = "none";
    loiEmail.style.display = "none";
    loiName.style.display = "none";
    if(name == "") {
        loiName.style.display = "flex";
        check = 1;
    }
    if(email == "") {
        loiEmail.textContent = "Vui lòng nhập địa chỉ Email !";
        loiEmail.style.display = "flex";
        check = 1;
    } else if (!email.includes("@") || !email.includes(".")) {
        loiEmail.style.display = "flex";
        loiEmail.textContent = "Vui lòng nhập đúng định dạng Email !";
        check = 1;
    }
    if (password.length < 6) {
        check = 1;
        loiPassword.style.display = "flex";
    }
    if(check == 0) {
        const {data, error} = await supabaseClient2.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { name: name }
            }
        });
        console.log('Sign up result:', {
            hasSession: Boolean(data && data.session),
            emailConfirmedAt: data && data.user ? data.user.email_confirmed_at : null,
            userEmail: data && data.user ? data.user.email : email
        });
        if (error != null) {
            console.log(error);
            if (error.message.includes("already registered")) {
                document.getElementById("loi-email-register").textContent = "Email đã được đăng ký!";
                document.getElementById("loi-email-register").style.display = "flex";
            }
        } else {
            const hasSession = Boolean(data && data.session);
            applyAuthenticatedProfile({
                isLoggedIn: hasSession,
                userName: name,
                userEmail: email
            });
            notification.style.transform = "translateX(0)";
            document.getElementById('thongBao').textContent = hasSession
                ? 'Đăng ký thành công'
                : 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.';
            document.getElementById('trangThai').textContent = hasSession
                ? 'Đang chuyển hướng ...'
                : 'Bạn có thể đăng nhập sau khi xác minh email';

            if (hasSession) {
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 2000);
            }
        }
    }
})
const passwordInput = document.getElementById("password-register");
const loiPassword = document.getElementById("loi-matkhau-register");
passwordInput.addEventListener("input", checkPasswordStrong);
function checkPasswordStrong() {
    const password = passwordInput.value;
    if(password.length < 6) {
        loiPassword.style.display = "flex";
        loiPassword.textContent = "Mật khẩu quá ngắn";
        loiPassword.style.color = "red";
        return;
    }
    let thuong = 0;
    let hoa = 0;
    let so = 0;
    let dacbiet = 0;
    let dodai = 0;
    if (password.length >= 6) dodai = 1;
    for(let i = 0; i < password.length; i++) {
        if(password[i] >= 'a' && password[i] <= 'z') thuong = 1;
        if(password[i] >= 'A' && password[i] <= 'Z') hoa = 1;
        if(password[i] >= '0' && password[i] <= '9') so = 1;
        if( password[i] === '!' || password[i] === '@' || password[i] === '#' || password[i] === '$' || password[i] === '%') dacbiet = 1;
    }
    let checkStrong = thuong + hoa + so + dacbiet + dodai;
    loiPassword.style.display = "flex";
    if(checkStrong >= 3) {
        loiPassword.textContent = "Mật khẩu mạnh";
        loiPassword.style.color = "green";
    }
    else if(checkStrong >= 2) {
        loiPassword.textContent = "Mật khẩu trung bình";
        loiPassword.style.color = "orange";
    }
    else {
        loiPassword.textContent = "Mật khẩu yếu";
        loiPassword.style.color = "red";
    }
}
/*---------------XU LI NHAP LIEU DAU VAO FORM DANG NHAP--------------*/
const btnLogin = document.getElementById("btn-login");
btnLogin.addEventListener("click", async (e)=> {
    e.preventDefault();
    const email = document.getElementById("email-login").value.trim();
    const password = document.getElementById("password-login").value.trim();
    const loiEmail = document.getElementById("loi-email");
    const loiPassword = document.getElementById("loi-matkhau");
    let check = 0;
    loiPassword.style.display = "none";
    loiEmail.style.display = "none";
    if(email == "") {
        loiEmail.textContent = "Vui lòng nhập địa chỉ Email !";
        loiEmail.style.display = "flex";
        check = 1;
    } else if (!email.includes("@") || !email.includes(".")) {
        loiEmail.style.display = "flex";
        loiEmail.textContent = "Vui lòng nhập đúng định dạng Email !";
        check = 1;
    }
    if (password.length < 6) {
        check = 1;
        loiPassword.style.display = "flex";
    }
    if (check == 0) {
        const { data, error } = await supabaseClient2.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.log(error);
            loiPassword.textContent = "Email hoặc mật khẩu không đúng!";
            loiPassword.style.display = "flex";
        } else {
            applyAuthenticatedProfile({
                isLoggedIn: Boolean(data && data.session),
                userName: data.user.user_metadata?.name || "",
                userEmail: data.user.email
            });

            notification.style.transform = "translateX(0)";
            document.getElementById('thongBao').textContent = 'Đăng nhập thành công';
            document.getElementById('trangThai').textContent = 'Đang chuyển hướng ...';

            // Kiểm tra redirect param (từ blog hoặc trang khác)
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect');

            setTimeout(() => {
                if (redirectUrl) {
                    window.location.href = decodeURIComponent(redirectUrl);
                } else {
                    window.location.href = "index.html";
                }
            }, 2000);
        }
    }
})