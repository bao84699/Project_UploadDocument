
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const formView = document.getElementById('form-view');
    const successView = document.getElementById('success-view');

    if (form && formView && successView) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            formView.style.transition = 'opacity 400ms ease, transform 400ms ease';
            formView.style.opacity = '0';
            formView.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                formView.style.display = 'none';
                successView.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 400);
        });
    }
});