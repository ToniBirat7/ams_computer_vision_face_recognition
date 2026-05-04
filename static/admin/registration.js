document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    let currentStep = 1;

    // Guidelines Carousel
    const carousel = {
        container: document.querySelector('.guidelines-carousel'),
        cards: document.querySelectorAll('.guideline-card'),
        dots: document.querySelector('.carousel-dots'),
        prevBtn: document.querySelector('.prev-btn'),
        nextBtn: document.querySelector('.next-btn'),
        currentIndex: 0,
        autoPlayInterval: null,

        init() {
            // Create dots
            this.cards.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = `dot ${index === 0 ? 'active' : ''}`;
                dot.addEventListener('click', () => this.goToCard(index));
                this.dots.appendChild(dot);
            });

            // Add button listeners
            this.prevBtn.addEventListener('click', () => this.prev());
            this.nextBtn.addEventListener('click', () => this.next());

            // Start autoplay
            this.startAutoPlay();

            // Pause autoplay on hover
            this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.container.addEventListener('mouseleave', () => this.startAutoPlay());
        },

        goToCard(index) {
            this.cards[this.currentIndex].classList.remove('active');
            this.dots.children[this.currentIndex].classList.remove('active');
            
            this.currentIndex = index;
            
            this.cards[this.currentIndex].classList.add('active');
            this.dots.children[this.currentIndex].classList.add('active');
        },

        next() {
            this.goToCard((this.currentIndex + 1) % this.cards.length);
        },

        prev() {
            this.goToCard((this.currentIndex - 1 + this.cards.length) % this.cards.length);
        },

        startAutoPlay() {
            this.autoPlayInterval = setInterval(() => this.next(), 5000);
        },

        stopAutoPlay() {
            clearInterval(this.autoPlayInterval);
        }
    };

    // Form Navigation
    function goToStep(step) {
        formSteps.forEach(s => s.classList.remove('active'));
        progressSteps.forEach(s => s.classList.remove('active'));

        formSteps[step - 1].classList.add('active');
        for (let i = 0; i < step; i++) {
            progressSteps[i].classList.add('active');
        }
        currentStep = step;
    }

    // Form Validation
    function validateStep(step) {
        const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
        const inputs = currentStepEl.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value) {
                const group = input.closest('.input-group');
                group.classList.add('has-error');
                isValid = false;
            } else {
                input.closest('.input-group').classList.remove('has-error');
            }
        });

        return isValid;
    }

    // Event Listeners
    document.querySelectorAll('.next-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
            }
        });
    });

    document.querySelectorAll('.prev-step-btn').forEach(btn => {
        btn.addEventListener('click', () => goToStep(currentStep - 1));
    });

    // Password Toggle
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('bx-hide');
            this.classList.toggle('bx-show');
        });
    });

    // Form Submit
    if (form) {
        form.addEventListener('submit', function(e) {
            const passwords = form.querySelectorAll('input[type="password"]');
            if (passwords[0].value !== passwords[1].value) {
                e.preventDefault();
                const group = passwords[1].closest('.input-group');
                group.classList.add('has-error');
            }
        });
    }

    // Update the message handling functions
    function initMessages() {
        const messages = document.querySelectorAll('.message-item');
        
        messages.forEach((message, index) => {
            // Add staggered animation delay
            message.style.animationDelay = `${index * 100}ms`;
            
            // Auto dismiss after 3 seconds
            setTimeout(() => {
                removeMessage(message);
            }, 3000 + (index * 100));
            
            // Handle close button
            const closeBtn = message.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    removeMessage(message);
                });
            }
        });
    }

    function removeMessage(message) {
        if (!message.classList.contains('removing')) {
            message.classList.add('removing');
            setTimeout(() => {
                message.remove();
                // Remove container if no messages left
                const container = document.querySelector('.message-container');
                if (container && !container.hasChildNodes()) {
                    container.remove();
                }
            }, 300);
        }
    }

    // Initialize messages
    initMessages();

    // Initialize
    carousel.init();
}); 