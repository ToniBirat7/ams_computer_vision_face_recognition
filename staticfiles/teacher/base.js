document.addEventListener('DOMContentLoaded', function() {
  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuBtn.querySelector('i').classList.toggle('bx-menu');
      menuBtn.querySelector('i').classList.toggle('bx-x');
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
      navLinks.classList.remove('active');
      menuBtn.querySelector('i').classList.add('bx-menu');
      menuBtn.querySelector('i').classList.remove('bx-x');
    }
  });

  // Auto-dismiss messages
  const messages = document.querySelectorAll('.message');
  messages.forEach(message => {
    // Add close button functionality
    const closeBtn = message.querySelector('.close-message');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => removeMessage(message));
    }

    // Auto dismiss after 5 seconds
    setTimeout(() => removeMessage(message), 5000);
  });

  function removeMessage(message) {
    message.style.opacity = '0';
    message.style.transform = 'translateX(100%)';
    setTimeout(() => message.remove(), 300);
  }
}); 