document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const deleteModal = document.getElementById('deleteModal');
    const searchInput = document.getElementById('searchInput');
    let currentStudentId = null;

    // Handle edit button clicks
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.dataset.id;
            const listItem = document.querySelector(`.list-item[data-id="${studentId}"]`);
            
            // Get student data from data attributes
            const name = listItem.querySelector('.item-details h3').textContent;
            const address = listItem.dataset.address;
            const phone = listItem.dataset.phone;
            const age = listItem.dataset.age;

            // Populate form fields
            editForm.querySelector('[name="name"]').value = name;
            editForm.querySelector('[name="address"]').value = address;
            editForm.querySelector('[name="phone_number"]').value = phone;
            editForm.querySelector('[name="age"]').value = age;

            // Store current student ID
            currentStudentId = studentId;
            
            // Show modal
            editModal.classList.add('active');
        });
    });

    // Handle form submission
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        formData.append('student_id', currentStudentId);

        try {
            const response = await fetch('/update_student/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Update the list item with new data
                const listItem = document.querySelector(`.list-item[data-id="${currentStudentId}"]`);
                
                // Update data attributes
                listItem.dataset.name = formData.get('name').toLowerCase();
                listItem.dataset.address = formData.get('address');
                listItem.dataset.phone = formData.get('phone_number');
                listItem.dataset.age = formData.get('age');

                // Update visible content
                listItem.querySelector('.item-details h3').textContent = formData.get('name');
                listItem.querySelector('.item-details p').textContent = formData.get('address');
                listItem.querySelector('.item-secondary span:first-child').innerHTML = 
                    `<i class='bx bx-phone'></i>${formData.get('phone_number')}`;
                listItem.querySelector('.item-secondary span:last-child').innerHTML = 
                    `<i class='bx bx-user'></i>Age: ${formData.get('age')}`;

                showMessage('Student details updated successfully', 'success');
                editModal.classList.remove('active');
            } else {
                showMessage(data.message || 'Error updating student', 'error');
            }
        } catch (error) {
            showMessage('Error updating student', 'error');
        }
    });

    // Handle delete button clicks
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.dataset.id;
            const listItem = document.querySelector(`.list-item[data-id="${studentId}"]`);
            const studentName = listItem.querySelector('.item-details h3').textContent;
            
            // Update delete modal content
            const modalBody = deleteModal.querySelector('.modal-body p');
            modalBody.textContent = `Are you sure you want to delete ${studentName}? This action cannot be undone.`;
            
            // Store student ID for delete confirmation
            deleteModal.dataset.studentId = studentId;
            
            // Show delete modal
            deleteModal.classList.add('active');
        });
    });

    // Handle delete confirmation
    const deleteConfirmBtn = document.querySelector('.delete-confirm-btn');
    deleteConfirmBtn.addEventListener('click', async function() {
        const studentId = deleteModal.dataset.studentId;
        
        try {
            const response = await fetch(`/delete-student/${studentId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Remove the item from DOM
                const listItem = document.querySelector(`.list-item[data-id="${studentId}"]`);
                listItem.style.height = listItem.offsetHeight + 'px';
                
                // Add removing class for animation
                listItem.style.opacity = '0';
                listItem.style.transform = 'translateX(100px)';
                
                setTimeout(() => {
                    listItem.remove();
                    
                    // Show empty state if no items left
                    const listContent = document.querySelector('.list-content');
                    if (!listContent.querySelector('.list-item')) {
                        const emptyState = document.createElement('div');
                        emptyState.className = 'empty-state';
                        emptyState.innerHTML = `
                            <i class='bx bx-folder-open'></i>
                            <p>No students found</p>
                        `;
                        listContent.appendChild(emptyState);
                    }
                }, 300);

                showMessage('Student deleted successfully', 'success');
            } else {
                showMessage(data.error || 'Error deleting student', 'error');
            }
            
            deleteModal.classList.remove('active');
        } catch (error) {
            showMessage('Error deleting student', 'error');
            deleteModal.classList.remove('active');
        }
    });

    // Close modals
    document.querySelectorAll('.close-modal, .cancel-btn').forEach(button => {
        button.addEventListener('click', function() {
            editModal.classList.remove('active');
            deleteModal.classList.remove('active');
        });
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        document.querySelectorAll('.list-item').forEach(item => {
            const name = item.dataset.name;
            item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    // Message handling functions (same as teacher list)
    function showMessage(message, type) {
        const messageContainer = document.querySelector('.message-container');
        if (!messageContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message-item ${type}`;
        messageElement.innerHTML = `
            <i class='bx ${type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}'></i>
            <span>${message}</span>
            <button class="close-btn" aria-label="Close">
                <i class='bx bx-x'></i>
            </button>
        `;

        messageContainer.appendChild(messageElement);

        const closeBtn = messageElement.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => removeMessage(messageElement));

        setTimeout(() => removeMessage(messageElement), 5000);
    }

    function removeMessage(messageElement) {
        if (!messageElement || messageElement.classList.contains('removing')) return;
        
        messageElement.classList.add('removing');
        messageElement.addEventListener('animationend', () => {
            messageElement.remove();
        });
    }
}); 