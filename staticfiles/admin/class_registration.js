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

    // Initialize Select2
    $(document).ready(function() {
        $('.select2-multiple').select2({
            placeholder: 'Click to select or search',
            allowClear: true,
            width: '100%'
        });

        // Style Select2 to match theme
        $('.select2-container--default .select2-selection--multiple').css({
            'border-color': 'var(--text-secondary)',
            'border-radius': '8px',
            'padding': '4px 8px',
            'min-height': '42px'
        });

        // Handle Select2 change events
        $('.select2-multiple').on('change', function() {
            const group = $(this).closest('.select-group');
            if ($(this).val() && $(this).val().length > 0) {
                group.addClass('is-valid').removeClass('has-error');
            } else {
                group.removeClass('is-valid');
            }
        });
    });

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
    const form = document.getElementById('classForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            let isValid = true;

            // Check student selection
            const studentSelect = form.querySelector('[name="student"]');
            if (!studentSelect.value) {
                studentSelect.closest('.select-group').classList.add('has-error');
                isValid = false;
            }

            // Check course selection
            const courseSelect = form.querySelector('[name="course"]');
            if (!courseSelect.value) {
                courseSelect.closest('.select-group').classList.add('has-error');
                isValid = false;
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    }

    // Initialize
    carousel.init();
    initMessages();
}); 