document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.edit-form');
    const inputs = form.querySelectorAll('.form-control');
    
    // Add floating label effect
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.closest('.form-group').classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.closest('.form-group').classList.remove('focused');
            }
        });
        
        // Initialize state
        if (input.value) {
            input.closest('.form-group').classList.add('focused');
        }
    });

    // Phone number validation
    const phoneInputs = form.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            this.value = value;
            
            // Update validation state
            if (value.length === 10) {
                this.classList.add('valid');
                this.classList.remove('invalid');
            } else {
                this.classList.remove('valid');
                this.classList.add('invalid');
            }
        });
    });

    // Email validation
    const emailInput = form.querySelector('input[type="email"]');
    emailInput.addEventListener('input', function() {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
        if (isValid) {
            this.classList.add('valid');
            this.classList.remove('invalid');
        } else {
            this.classList.remove('valid');
            this.classList.add('invalid');
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        let isValid = true;
        
        // Validate required fields
        inputs.forEach(input => {
            if (input.required && !input.value.trim()) {
                isValid = false;
                input.classList.add('invalid');
            }
        });

        // Validate phone numbers
        phoneInputs.forEach(input => {
            if (input.value && input.value.length !== 10) {
                isValid = false;
                input.classList.add('invalid');
            }
        });

        // Validate email
        if (emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            isValid = false;
            emailInput.classList.add('invalid');
        }

        if (!isValid) {
            e.preventDefault();
            showMessage('Please check the highlighted fields', 'error');
        }
    });

    // Message handling
    function showMessage(text, type = 'error') {
        const container = document.querySelector('.message-container') || 
                         createMessageContainer();
        
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `
            <i class="ri-${type === 'error' ? 'error-warning' : 'check'}-line"></i>
            ${text}
        `;
        
        container.appendChild(message);
        setTimeout(() => removeMessage(message), 5000);
    }

    function createMessageContainer() {
        const container = document.createElement('div');
        container.className = 'message-container';
        document.body.appendChild(container);
        return container;
    }

    function removeMessage(message) {
        message.style.opacity = '0';
        message.style.transform = 'translateX(100%)';
        setTimeout(() => message.remove(), 300);
    }
}); 