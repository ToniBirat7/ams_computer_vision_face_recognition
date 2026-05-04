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

    // File Upload Preview
    const fileUpload = document.querySelector('.file-upload');
    const fileInput = fileUpload.querySelector('input[type="file"]');
    const filePreview = fileUpload.querySelector('.file-preview');

    if (fileUpload && fileInput && filePreview) {
        // Handle file selection
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    filePreview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <span>${file.name}</span>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                filePreview.innerHTML = `
                    <i class='bx bx-image-add'></i>
                    <span>Click or drag image here to upload</span>
                `;
            }
        });

        // Handle drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileUpload.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            fileUpload.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileUpload.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            fileUpload.classList.add('drag-over');
        }

        function unhighlight(e) {
            fileUpload.classList.remove('drag-over');
        }

        fileUpload.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            fileInput.files = dt.files;
            
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    filePreview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <span>${file.name}</span>
                    `;
                };
                reader.readAsDataURL(file);
            }
        }
    }

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
    const form = document.getElementById('teacherForm');
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

    // Initialize
    carousel.init();
    initMessages();

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

    // Gender Selection Enhancement
    const genderOptions = document.querySelectorAll('.gender-option input[type="radio"]');
    genderOptions.forEach(radio => {
        radio.addEventListener('change', function() {
            const group = this.closest('.input-group');
            group.classList.remove('has-error');
        });
    });
}); 