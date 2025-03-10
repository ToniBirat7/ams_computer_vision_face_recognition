document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');
    const attendanceRows = document.querySelectorAll('.attendance-row');

    // Initialize search and filter
    function filterAttendance() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterDate = dateFilter.value;

        let hasVisibleRows = false;

        attendanceRows.forEach(row => {
            const courseName = row.querySelector('.course-info h3').textContent.toLowerCase();
            const teacherName = row.querySelector('.teacher-name').textContent.toLowerCase();
            const dateText = row.querySelector('.attendance-date').textContent;
            const rowDate = new Date(dateText);
            
            let showRow = true;

            // Only apply filters if there are filter values
            if (searchTerm || filterDate) {
                // Search filter
                if (searchTerm) {
                    const matchesCourse = courseName.includes(searchTerm);
                    const matchesTeacher = teacherName.includes(searchTerm);
                    if (!matchesCourse && !matchesTeacher) {
                        showRow = false;
                    }
                }

                // Date filter
                if (filterDate) {
                    const selectedDate = new Date(filterDate);
                    if (rowDate.toDateString() !== selectedDate.toDateString()) {
                        showRow = false;
                    }
                }
            }

            // Show/hide row with animation
            if (showRow) {
                row.style.display = '';
                setTimeout(() => row.style.opacity = '1', 10);
                hasVisibleRows = true;
            } else {
                row.style.opacity = '0';
                setTimeout(() => row.style.display = 'none', 300);
            }
        });

        // Handle empty state
        updateEmptyState(hasVisibleRows, searchTerm || filterDate);
    }

    // Show/hide empty state message
    function updateEmptyState(hasVisibleRows, hasActiveFilters) {
        let emptyState = document.querySelector('.empty-state');
        
        if (!hasVisibleRows && hasActiveFilters) {
            if (!emptyState) {
                emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <i class='bx bx-calendar-x'></i>
                    <p>No matching attendance records found</p>
                `;
                document.querySelector('.attendance-table').appendChild(emptyState);
            }
            emptyState.style.display = 'flex';
        } else if (emptyState) {
            emptyState.remove(); // Remove instead of hiding
        }
    }

    // Event listeners
    searchInput.addEventListener('input', filterAttendance);
    dateFilter.addEventListener('change', filterAttendance);

    // Clear filters button
    const filterSection = document.querySelector('.filter-section');
    const clearButton = document.createElement('button');
    clearButton.className = 'clear-filters';
    clearButton.innerHTML = '<i class="bx bx-x"></i>Clear Filters';
    
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        dateFilter.value = '';
        filterAttendance();
    });
    
    filterSection.appendChild(clearButton);
}); 