document.addEventListener('DOMContentLoaded', function() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const saveButton = document.getElementById('saveChanges');
    const attendanceId = window.location.pathname.split('/').filter(Boolean).pop();

    // Handle toggle buttons
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.dataset.studentId;
            const status = this.dataset.status;
            
            // Remove active class from sibling button
            const siblingButton = this.parentElement.querySelector(`.toggle-btn[data-status="${status === 'P' ? 'A' : 'P'}"]`);
            siblingButton.classList.remove('active');
            
            // Add active class to clicked button
            this.classList.add('active');
        });
    });

    // Handle save changes
    saveButton.addEventListener('click', async function() {
        const presentBtn = document.querySelector('.toggle-btn[data-status="P"]')
        stat = presentBtn.classList.contains('active') ? 'P' : 'A';
        const attendanceData = {
            stats: stat
            }

        try {
            const response = await fetch(`/alter-attendance/${attendanceId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(attendanceData)
            });

            if (response.ok) {
                showMessage('Attendance updated successfully', 'success');
                setTimeout(() => {
                    window.location.href = '/review-attendance/';
                }, 1500);
            } else {
                throw new Error('Failed to update attendance');
            }
        } catch (error) {
            showMessage('Error updating attendance', 'error');
        }
    });

    // Helper function to show messages
    function showMessage(text, type) {
        const messageContainer = document.querySelector('.message-container');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `
            <i class='bx ${type === 'success' ? 'bxs-check-circle' : 'bxs-x-circle'}'></i>
            <span>${text}</span>
        `;
        messageContainer.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // Helper function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}); 