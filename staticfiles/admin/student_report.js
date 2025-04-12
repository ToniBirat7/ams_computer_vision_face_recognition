document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('studentSearchForm');
    const studentDetails = document.getElementById('studentDetails');
    const noResults = document.getElementById('noResults');
    let chart = null;

    // Handle search form submission
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const studentId = this.querySelector('input[name="student_id"]').value;
        
        try {
            const response = await fetch(`/get-student-report/${studentId}/`);
            const data = await response.json();

            if (response.ok) {
                displayStudentDetails(data);
                studentDetails.classList.remove('hidden');
                noResults.classList.add('hidden');
            } else {
                studentDetails.classList.add('hidden');
                noResults.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error:', error);
            studentDetails.classList.add('hidden');
            noResults.classList.remove('hidden');
        }
    });

    // Display student details
    function displayStudentDetails(data) {
        // Update profile info
        document.querySelector('.student-name').textContent = data.name;
        document.querySelector('.student-id').textContent = `ID: ${data.id}`;

        // Update course cards
        const progressGrid = document.querySelector('.progress-grid');
        progressGrid.innerHTML = data.courses.map(course => `
            <div class="course-card">
                <h3>${course.title}</h3>
                <div class="course-stats">
                    <p>Present: ${course.present_days}</p>
                    <p>Absent: ${course.absent_days}</p>
                    <p>Attendance: ${course.attendance_rate}%</p>
                </div>
            </div>
        `).join('');

        // Update attendance stats
        document.querySelector('.stat-item.present .stat-value').textContent = data.total_present;
        document.querySelector('.stat-item.absent .stat-value').textContent = data.total_absent;
        document.querySelector('.stat-item.percentage .stat-value').textContent = `${data.attendance_rate}%`;

        // Update chart
        updateAttendanceChart(data.monthly_attendance);
    }

    // Create/Update attendance chart
    function updateAttendanceChart(monthlyData) {
        const ctx = document.getElementById('monthlyAttendanceChart').getContext('2d');
        
        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(d => d.month),
                datasets: [{
                    label: 'Attendance Rate',
                    data: monthlyData.map(d => d.rate),
                    borderColor: getComputedStyle(document.documentElement)
                        .getPropertyValue('--secondary').trim(),
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(0, 164, 189, 0.1)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => `${value}%`
                        }
                    }
                }
            }
        });
    }

    // Add animation when student details become visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    observer.observe(studentDetails);

    // Prediction Button Handler
    const predictButton = document.getElementById('predictButton');
    const predictionResult = document.getElementById('predictionResult');
    const closePredictionBtn = document.getElementById('closePrediction');
    const downloadChartBtn = document.getElementById('downloadChart');

    predictButton.addEventListener('click', async function() {
        const studentId = document.querySelector('input[name="student_id"]').value;
        const previousGrade = document.getElementById('previousGrade').value;
        
        if (!previousGrade) {
            alert('Please select a previous grade first');
            return;
        }

        try {
            console.log('Sending prediction request for student:', studentId, 'with grade:', previousGrade);
            
            const response = await fetch(`/predict-performance/${studentId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    previous_grade: previousGrade
                })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                updatePredictionUI(data);
            } else {
                throw new Error(data.error || 'Failed to get prediction');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to get prediction: ' + error.message);
        }
    });

    function updatePredictionUI(data) {
        // Show the prediction result container
        const predictionResult = document.getElementById('predictionResult');
        predictionResult.classList.remove('hidden');
        predictionResult.classList.add('slide-in');

        // Update grade and confidence
        document.getElementById('predictedGrade').textContent = data.predicted_grade;
        document.getElementById('confidenceScore').textContent = `${data.confidence}%`;
        
        // Update stats
        document.getElementById('attendanceRate').textContent = `${data.attendance_rate}%`;
        document.getElementById('presentDays').textContent = data.present_days;
        document.getElementById('coursePerf').textContent = data.course_performance;

        // Update prediction chart image
        const predictionChart = document.getElementById('predictionChart');
        predictionChart.src = `data:image/png;base64,${data.chart_image}`;

        // Add animation class to stats cards
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('slide-in');
            }, index * 100);
        });

        // Update grade badge color based on grade
        const gradeBadge = document.querySelector('.grade-badge');
        const gradeColors = {
            'A': 'var(--success)',
            'B': 'var(--secondary)',
            'C': 'var(--accent)'
        };
        gradeBadge.style.background = gradeColors[data.predicted_grade] || 'var(--primary)';

        // Log the data for debugging
        console.log('Prediction data:', data);
    }

    // Close prediction result
    closePredictionBtn.addEventListener('click', function() {
        predictionResult.classList.add('hidden');
        predictionResult.classList.remove('slide-in');
    });

    // Download chart
    downloadChartBtn.addEventListener('click', function() {
        const chartImage = document.getElementById('predictionChart').src;
        const downloadLink = document.createElement('a');
        downloadLink.href = chartImage;
        downloadLink.download = 'performance_prediction.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });

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