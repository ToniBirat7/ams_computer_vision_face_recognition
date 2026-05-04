document.addEventListener('DOMContentLoaded', function() {
    // Initialize counters
    const totalStudents = document.querySelectorAll('.student-row').length;
    const presentCounter = document.getElementById('presentCount').querySelector('h3');
    const absentCounter = document.getElementById('absentCount').querySelector('h3');
    
    // Get CSRF token
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    // Update counters function
    function updateCounters() {
        const presentCount = document.querySelectorAll('.status-checkbox:checked').length;
        const absentCount = totalStudents - presentCount;
        
        presentCounter.textContent = presentCount;
        absentCounter.textContent = absentCount;
    }

    // Handle status toggles
    const statusToggles = document.querySelectorAll('.status-checkbox');
    statusToggles.forEach(toggle => {
        toggle.addEventListener('change', updateCounters);
    });

    // Mark all present function
    window.markAllPresent = function() {
        statusToggles.forEach(toggle => {
            if (!toggle.checked) {
                toggle.checked = true;
                // Trigger change event to update UI
                toggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    };

    // Form submission handling
    const form = document.querySelector('.attendance-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const confirmed = confirm('Are you sure you want to save the attendance?');
        if (!confirmed) return;

        // Clear any existing hidden inputs
        form.querySelectorAll('input[type="hidden"]:not([name="csrfmiddlewaretoken"])').forEach(input => input.remove());

        // Set absent status for unchecked checkboxes
        statusToggles.forEach(toggle => {
            if (!toggle.checked) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = toggle.name;
                input.value = 'A';
                form.appendChild(input);
            }
        });

        // Add CSRF token if not present
        if (!form.querySelector('[name=csrfmiddlewaretoken]')) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrfmiddlewaretoken';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        form.submit();
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.classList.contains('btn-secondary')) {
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.left = `${e.offsetX}px`;
                ripple.style.top = `${e.offsetY}px`;
                
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            }
        });
    });

    // Initialize counters on page load
    updateCounters();
}); 