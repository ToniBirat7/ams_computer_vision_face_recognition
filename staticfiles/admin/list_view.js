document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const deleteModal = document.getElementById('deleteModal');
    const searchInput = document.getElementById('searchInput');
    let currentTeacherId = null;

    // Handle edit button clicks
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const teacherId = this.dataset.id;
            const listItem = document.querySelector(`.list-item[data-id="${teacherId}"]`);
            
            // Get teacher data from data attributes
            const address = listItem.dataset.address;
            const primaryNumber = listItem.dataset.primary;
            const secondaryNumber = listItem.dataset.secondary;
            const dob = listItem.dataset.dob;

            // Populate form fields
            editForm.querySelector('[name="address"]').value = address;
            editForm.querySelector('[name="primary_number"]').value = primaryNumber;
            editForm.querySelector('[name="secondary_number"]').value = secondaryNumber || '';
            editForm.querySelector('[name="dob"]').value = dob;

            // Store current teacher ID
            currentTeacherId = teacherId;
            
            // Show modal
            editModal.classList.add('active');
        });
    });

    // Handle form submission
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        formData.append('teacher_id', currentTeacherId);

        try {
            const response = await fetch('/update_teacher/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Update the list item with new data
                const listItem = document.querySelector(`.list-item[data-id="${currentTeacherId}"]`);
                
                // Update data attributes
                listItem.dataset.address = formData.get('address');
                listItem.dataset.primary = formData.get('primary_number');
                listItem.dataset.secondary = formData.get('secondary_number');
                listItem.dataset.dob = formData.get('dob');

                // Update visible content
                listItem.querySelector('.item-details p').textContent = formData.get('address');
                listItem.querySelector('.item-secondary span:first-child').innerHTML = 
                    `<i class='bx bx-phone'></i>${formData.get('primary_number')}`;

                // Show success message
                showMessage('Teacher details updated successfully', 'success');
                
                // Close modal
                editModal.classList.remove('active');
            } else {
                showMessage(data.message || 'Error updating teacher', 'error');
            }
        } catch (error) {
            showMessage('Error updating teacher', 'error');
        }
    });

    // Handle delete button clicks
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const teacherId = this.dataset.id;
            const listItem = document.querySelector(`.list-item[data-id="${teacherId}"]`);
            const teacherName = listItem.querySelector('.item-details h3').textContent;
            
            // Update delete modal content
            const modalBody = deleteModal.querySelector('.modal-body p');
            modalBody.textContent = `Are you sure you want to delete ${teacherName}? This action cannot be undone.`;
            
            // Store teacher ID for delete confirmation
            deleteModal.dataset.teacherId = teacherId;
            
            // Show delete modal
            deleteModal.classList.add('active');
        });
    });

    // Handle delete confirmation
    const deleteConfirmBtn = document.querySelector('.delete-confirm-btn');
    deleteConfirmBtn.addEventListener('click', async function() {
        const teacherId = deleteModal.dataset.teacherId;
        
        try {
            const response = await fetch(`/delete-teacher/${teacherId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Remove the item from DOM
                const listItem = document.querySelector(`.list-item[data-id="${teacherId}"]`);
                listItem.style.height = listItem.offsetHeight + 'px'; // Set fixed height for animation
                
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
                            <p>No teachers found</p>
                        `;
                        listContent.appendChild(emptyState);
                    }
                }, 300);

                showMessage('Teacher deleted successfully', 'success');
            } else {
                showMessage(data.error || 'Error deleting teacher', 'error');
            }
            
            // Close delete modal
            deleteModal.classList.remove('active');
            
        } catch (error) {
            showMessage('Error deleting teacher', 'error');
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

    // Message handling
    function showMessage(message, type) {
        const messageContainer = document.querySelector('.message-container');
        if (!messageContainer) return;

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message-item ${type}`;
        messageElement.innerHTML = `
            <i class='bx ${type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}'></i>
            <span>${message}</span>
            <button class="close-btn" aria-label="Close">
                <i class='bx bx-x'></i>
            </button>
        `;

        // Add to container
        messageContainer.appendChild(messageElement);

        // Handle close button
        const closeBtn = messageElement.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => removeMessage(messageElement));

        // Auto remove after 5 seconds
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