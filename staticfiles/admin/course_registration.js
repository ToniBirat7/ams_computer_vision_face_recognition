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
    const form = document.getElementById('courseForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            const requiredInputs = form.querySelectorAll('input[required], select[required]');
            let isValid = true;

            requiredInputs.forEach(input => {
                if (!input.value) {
                    const group = input.closest('.input-group');
                    group.classList.add('has-error');
                    isValid = false;
                } else {
                    input.closest('.input-group').classList.remove('has-error');
                }
            });

            if (!isValid) {
                e.preventDefault();
            }
        });
    }

    // Enhanced Select Inputs
    const selectInputs = document.querySelectorAll('select');
    selectInputs.forEach(select => {
        // Add placeholder option if not exists
        if (!select.querySelector('option[value=""]')) {
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = `Select ${select.closest('.input-group').querySelector('label').textContent.trim()}`;
            placeholder.disabled = true;
            placeholder.selected = true;
            select.insertBefore(placeholder, select.firstChild);
        }

        // Handle change event
        select.addEventListener('change', function() {
            const group = this.closest('.select-group');
            if (this.value) {
                group.classList.add('is-valid');
                group.classList.remove('has-error');
            } else {
                group.classList.remove('is-valid');
            }
        });
    });

    // Initialize
    carousel.init();
    initMessages();
}); 