document.addEventListener('DOMContentLoaded', function() {
    // Image Upload Preview
    const imageInput = document.querySelector('input[type="file"]');
    const profileImage = document.querySelector('.profile-image img');
    const imageForm = document.getElementById('imageForm');

    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = this.files[0];
            if (file) {
                // Validate file size (2MB max)
                if (file.size > 2 * 1024 * 1024) {
                    alert('File size must be less than 2MB');
                    return;
                }

                // Validate file type
                if (!file.type.match('image.*')) {
                    alert('Please select an image file');
                    return;
                }

                // Show loading state
                profileImage.closest('.profile-image').classList.add('loading');

                const reader = new FileReader();
                reader.onload = function(e) {
                    profileImage.src = e.target.result;
                    // Remove loading state
                    profileImage.closest('.profile-image').classList.remove('loading');
                    // Auto submit form
                    imageForm.submit();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Create and append modal to body
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <i class="ri-delete-bin-line"></i>
                <h3>Remove Profile Photo</h3>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to remove your profile photo? This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn">
                    <i class="ri-close-line"></i>
                    Cancel
                </button>
                <button class="confirm-btn">
                    <i class="ri-check-line"></i>
                    Confirm
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Remove Photo Handler with Modal
    window.removePhoto = function() {
        modal.classList.add('show');
        
        // Handle cancel
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.classList.remove('show');
        });

        // Handle confirm
        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            window.location.href = '/teacher/remove-image/';
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    };

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    // Observe all detail cards
    document.querySelectorAll('.details-card').forEach(card => {
        observer.observe(card);
    });

    // Course Item Hover Effect
    document.querySelectorAll('.course-item').forEach(item => {
        item.addEventListener('mousemove', function(e) {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * 5;
            const rotateY = ((centerX - x) / centerX) * 5;
            
            item.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(10px)
            `;
        });
        
        item.addEventListener('mouseleave', function() {
            item.style.transform = 'none';
        });
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.edit-btn, .remove-photo-btn, .course-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            button.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}); 