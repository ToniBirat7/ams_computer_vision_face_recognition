document.addEventListener('DOMContentLoaded', function() {
    // Auto-hide messages after 3 seconds
    const messages = document.querySelectorAll('.alert');
    messages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateX(100%)';
            setTimeout(() => {
                message.remove();
            }, 300); // Wait for fade out animation
        }, 3000);
    });

    // Password toggle functionality
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Console log to debug
    console.log('Toggle button:', togglePassword);
    console.log('Password input:', passwordInput);

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePassword.querySelector('i').classList.replace('bx-hide', 'bx-show');
            } else {
                passwordInput.type = 'password';
                togglePassword.querySelector('i').classList.replace('bx-show', 'bx-hide');
            }
        });
    }

    // Form elements
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.querySelector('.login-btn');

    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const btnText = loginBtn.querySelector('.btn-text');
            loginBtn.disabled = true;
            btnText.textContent = 'Signing in...';
        });
    }

    // Input animations
    document.querySelectorAll('.input-field input').forEach(input => {
        if (input.value) {
            input.parentElement.classList.add('has-value');
        }

        input.addEventListener('input', function() {
            if (this.value) {
                input.parentElement.classList.add('has-value');
            } else {
                input.parentElement.classList.remove('has-value');
            }
        });
    });

    // Logo handling
    const logo = document.querySelector('.logo');
    const logoWrapper = document.querySelector('.logo-wrapper');

    if (logo && logoWrapper) {
        logo.addEventListener('load', function() {
            logoWrapper.classList.remove('loading');
        });

        logo.addEventListener('error', function() {
            console.error('Error loading logo');
            logoWrapper.classList.remove('loading');
        });
    }

    // Add 3D tilt effect
    const card = document.querySelector('.login-card');
    if (card) {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(10px)
            `;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = `
                perspective(1000px)
                rotateX(0deg)
                rotateY(0deg)
                translateZ(0)
            `;
        });
    }

    // Add floating animation to elements
    const elements = document.querySelectorAll('.float-element');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 2}s`;
    });
}); 