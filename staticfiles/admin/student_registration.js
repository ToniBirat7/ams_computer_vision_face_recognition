document.addEventListener('DOMContentLoaded', function() {
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

    // Message System
    function initMessages() {
        const messages = document.querySelectorAll('.message-item');
        
        messages.forEach((message, index) => {
            message.style.animationDelay = `${index * 100}ms`;
            
            setTimeout(() => {
                removeMessage(message);
            }, 3000 + (index * 100));
            
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
                const container = document.querySelector('.message-container');
                if (container && !container.hasChildNodes()) {
                    container.remove();
                }
            }, 300);
        }
    }

    // Form Validation
    const form = document.getElementById('studentForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            const requiredInputs = form.querySelectorAll('input[required]');
            let isValid = true;

            requiredInputs.forEach(input => {
                if (!input.value) {
                    const group = input.closest('.input-group');
                    group.classList.add('has-error');
                    isValid = false;
                } else {
                    input.closest('.input-group').classList.remove('has-error');
                }

                // Additional validation for age and phone
                if (input.name === 'age') {
                    const age = parseInt(input.value);
                    if (isNaN(age) || age < 5 || age > 100) {
                        const group = input.closest('.input-group');
                        group.classList.add('has-error');
                        isValid = false;
                    }
                }

                if (input.name === 'phone_number') {
                    const phone = input.value.replace(/\D/g, '');
                    if (phone.length !== 10) {
                        const group = input.closest('.input-group');
                        group.classList.add('has-error');
                        isValid = false;
                    }
                }
            });

            if (!isValid) {
                e.preventDefault();
            }
        });

        // Real-time validation
        const phoneInput = form.querySelector('input[name="phone_number"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = this.value.replace(/\D/g, '');
                if (value.length > 10) value = value.slice(0, 10);
                this.value = value;
            });
        }

        const ageInput = form.querySelector('input[name="age"]');
        if (ageInput) {
            ageInput.addEventListener('input', function(e) {
                let value = this.value.replace(/\D/g, '');
                if (value.length > 2) value = value.slice(0, 2);
                this.value = value;
            });
        }
    }

    // Initialize
    carousel.init();
    initMessages();
}); 