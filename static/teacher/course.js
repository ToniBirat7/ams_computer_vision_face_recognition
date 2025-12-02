document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations for course cards
    const courseCards = document.querySelectorAll('.course-card');
    
    // Add intersection observer for fade-in animation
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

    courseCards.forEach((card, index) => {
        // Add staggered animation delay
        card.style.transitionDelay = `${index * 100}ms`;
        observer.observe(card);
    });

    // Add hover effects with tilt
    courseCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * 5;
            const rotateY = ((centerX - x) / centerX) * 5;
            
            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(10px)
                scale(1.02)
            `;
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'none';
        });
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    
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

    // Add scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-top-btn';
    scrollBtn.innerHTML = '<i class="bx bx-up-arrow-alt"></i>';
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add loading skeleton animation
    function addLoadingState() {
        courseCards.forEach(card => {
            card.querySelectorAll('.course-title, .course-teacher, .course-details').forEach(el => {
                el.classList.add('skeleton');
            });
        });
    }

    function removeLoadingState() {
        courseCards.forEach(card => {
            card.querySelectorAll('.skeleton').forEach(el => {
                el.classList.remove('skeleton');
            });
        });
    }

    // Simulate loading state (remove in production)
    if (courseCards.length > 0) {
        addLoadingState();
        setTimeout(removeLoadingState, 1000);
    }
}); 