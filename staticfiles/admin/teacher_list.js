document.addEventListener('DOMContentLoaded', function() {
    // Search Functionality
    const searchInput = document.getElementById('searchInput');
    const listItems = document.querySelectorAll('.list-item');

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            listItems.forEach(item => {
                const name = item.dataset.name;
                if (name.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Modal Handling
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelButtons = document.querySelectorAll('.cancel-btn');
    let currentItemId = null;

    // Edit Modal Functions
    function openEditModal(id) {
        currentItemId = id;
        // Fetch teacher data
        fetch(`/get-teacher/${id}/`)
            .then(response => response.json())
            .then(data => {
                const form = editModal.querySelector('form');
                form.querySelector('[name="address"]').value = data.address;
                form.querySelector('[name="primary_number"]').value = data.primary_number;
                form.querySelector('[name="secondary_number"]').value = data.secondary_number;
                form.querySelector('[name="dob"]').value = data.dob;

                // Handle image preview
                const filePreview = form.querySelector('.file-preview');
                if (data.image_url) {
                    filePreview.innerHTML = `
                        <img src="${data.image_url}" alt="Current Image" style="max-width: 100%; max-height: 200px;">
                        <span>Current Image</span>
                    `;
                } else {
                    filePreview.innerHTML = `
                        <i class='bx bx-image-add'></i>
                        <span>Click or drag image here to upload</span>
                    `;
                }
            });
        editModal.classList.add('active');
    }

    // Delete Modal Functions
    function openDeleteModal(id) {
        currentItemId = id;
        deleteModal.classList.add('active');
    }

    function closeModals() {
        editModal.classList.remove('active');
        deleteModal.classList.remove('active');
        currentItemId = null;
    }

    // Event Listeners
    editButtons.forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });

    deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    cancelButtons.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // File Upload Preview
    const fileInput = document.querySelector('input[type="file"]');
    const filePreview = document.querySelector('.file-preview');

    if (fileInput && filePreview) {
        fileInput.addEventListener('change', function(e) {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    filePreview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">
                        <span>${file.name}</span>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });

        // Add drag and drop functionality
        const dropZone = fileInput.closest('.file-upload');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            dropZone.classList.add('drag-over');
        }

        function unhighlight(e) {
            dropZone.classList.remove('drag-over');
        }

        dropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            fileInput.files = dt.files;
            
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    filePreview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">
                        <span>${file.name}</span>
                    `;
                };
                reader.readAsDataURL(file);
            }
        }
    }

    // Handle edit form submission
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);

            fetch(`/edit-teacher/${currentItemId}/`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the UI
                    const item = document.querySelector(`.list-item[data-id="${currentItemId}"]`);
                    item.querySelector('.item-details p').textContent = formData.get('address');
                    item.querySelector('.item-secondary span:first-child').textContent = formData.get('primary_number');
                    
                    // If there's a new image, reload the page to show it
                    if (formData.get('my_image').size > 0) {
                        location.reload();
                    } else {
                        showMessage('Teacher updated successfully', 'success');
                        closeModals();
                    }
                } else {
                    showMessage('Error updating teacher', 'error');
                }
            });
        });
    }

    // Handle delete confirmation
    const deleteConfirmBtn = document.querySelector('.delete-confirm-btn');
    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', function() {
            fetch(`/delete-teacher/${currentItemId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove the item from UI
                    const item = document.querySelector(`.list-item[data-id="${currentItemId}"]`);
                    item.remove();
                    showMessage('Teacher deleted successfully', 'success');
                    closeModals();
                } else {
                    showMessage('Error deleting teacher', 'error');
                }
            });
        });
    }

    // Message System
    function showMessage(message, type) {
        const container = document.querySelector('.message-container');
        const messageHTML = `
            <div class="message-item ${type}">
                <i class='bx ${type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}'></i>
                <span>${message}</span>
                <button class="close-btn" aria-label="Close">
                    <i class='bx bx-x'></i>
                </button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', messageHTML);
        
        const newMessage = container.lastElementChild;
        setTimeout(() => {
            newMessage.classList.add('removing');
            setTimeout(() => newMessage.remove(), 300);
        }, 3000);

        // Add close button functionality
        newMessage.querySelector('.close-btn').addEventListener('click', () => {
            newMessage.classList.add('removing');
            setTimeout(() => newMessage.remove(), 300);
        });
    }

    // Add validation for phone numbers
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            this.value = value;
        });
    });
}); 