const currentPath = window.location.pathname;

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    // Function to check if mobile view
    function isMobileView() {
        return window.innerWidth <= 992;
    }

    // Function to handle sidebar toggle
    function toggleSidebar() {
        if (isMobileView()) {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
            document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : '';
        } else {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        }
    }

    // Toggle sidebar on button click
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Close sidebar when clicking overlay
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isMobileView() && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
                document.body.style.overflow = '';
            }
        }, 250);
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (isMobileView() && 
            !sidebar.contains(e.target) && 
            !sidebarToggle.contains(e.target) && 
            sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    });

    // Prevent sidebar close when clicking inside
    sidebar.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Add touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 100;
        const swipeLength = touchEndX - touchStartX;

        if (Math.abs(swipeLength) > swipeThreshold) {
            if (swipeLength > 0 && !sidebar.classList.contains('show')) {
                // Swipe right to open
                sidebar.classList.add('show');
                overlay.classList.add('show');
                document.body.style.overflow = 'hidden';
            } else if (swipeLength < 0 && sidebar.classList.contains('show')) {
                // Swipe left to close
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
                document.body.style.overflow = '';
            }
        }
    }

    // Improve hover handling for sidebar items
    const sidebarItems = document.querySelectorAll('.sidebar-nav li a');
    sidebarItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            if (sidebar.classList.contains('collapsed')) {
                const span = this.querySelector('span');
                if (span) {
                    span.style.opacity = '1';
                    span.style.visibility = 'visible';
                }
            }
        });
        
        item.addEventListener('mouseleave', function() {
            if (sidebar.classList.contains('collapsed')) {
                const span = this.querySelector('span');
                if (span) {
                    span.style.opacity = '0';
                    span.style.visibility = 'hidden';
                }
            }
        });
    });

    // Handle active state of sidebar items
    sidebarItems.forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.parentElement.classList.add('active');
        }
    });

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    const teacherCards = document.querySelectorAll('.teacher-card');
    const studentRows = document.querySelectorAll('.data-table tbody tr');
    const courseCards = document.querySelectorAll('.course-card');

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();

        // Search teachers
        teacherCards.forEach(card => {
            const teacherName = card.querySelector('h3').textContent.toLowerCase();
            const teacherInfo = card.querySelector('.card-body').textContent.toLowerCase();
            
            if (teacherName.includes(searchTerm) || teacherInfo.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        // Search students
        studentRows.forEach(row => {
            const studentInfo = row.textContent.toLowerCase();
            if (studentInfo.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });

        // Search courses
        courseCards.forEach(card => {
            const courseInfo = card.textContent.toLowerCase();
            if (courseInfo.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Add hover effect to cards
    const cards = document.querySelectorAll('.teacher-card, .course-card, .stat-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(10px)
            `;
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'none';
        });
    });

    // Auto-hide messages after 3 seconds
    const messages = document.querySelectorAll('.alert');
    messages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateX(100%)';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 3000);
    });

    // Add smooth scrolling to navigation links
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active state to current section in sidebar
    const sections = document.querySelectorAll('.data-section');
    const navLinks = document.querySelectorAll('.sidebar-nav a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.parentElement.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.parentElement.classList.add('active');
            }
        });
    });

    // Set active menu based on current URL
    document.querySelectorAll('.nav-section a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.parentElement.classList.add('active');
        }
    });
});