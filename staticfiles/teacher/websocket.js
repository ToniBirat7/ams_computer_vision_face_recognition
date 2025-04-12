class VideoAttendance {
    constructor() {
        this.video = document.getElementById('videoElement');
        this.statusText = document.getElementById('statusText');
        this.detectedList = document.getElementById('detectedStudents');
        this.videoContainer = document.getElementById('videoFeedContainer');
        this.startBtn = document.getElementById('startVideoBtn');
        this.closeBtn = document.getElementById('closeVideoBtn');
        this.ws = null;
        this.detectedStudents = new Set();
        
        this.setupEventListeners();
        this.setupWebSocket();

        // Absent Present Counter
        this.totalStudents = document.querySelectorAll('.student-row').length;
        this.presentCounter = document.getElementById('presentCount').querySelector('h3');
        this.absentCounter = document.getElementById('absentCount').querySelector('h3');
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startVideoAttendance());
        this.closeBtn.addEventListener('click', () => this.stopVideoAttendance());
    }

    setupWebSocket() {
        const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
        console.log('Protocol:', window.location.protocol);
        console.log('Host:', window.location.host);
        
        const wsUrl = `${wsScheme}://${window.location.host}/ws/attendance/`;
        console.log('Attempting to connect to WebSocket URL:', wsUrl);
        
        try {
            this.ws = new WebSocket(wsUrl);
            console.log('WebSocket instance created');
            
            this.ws.onopen = () => {
                console.log('WebSocket connection established');
                this.updateStatus('Connected to face recognition service');
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if(data.student) {
                    console.log('Received message:', {"type" : data.type, "stu": data.student});
                }
                else {
                    console.log('Received message:', {"type" : data.type});
                }
                this.handleWebSocketMessage(data);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                console.error('WebSocket readyState:', this.ws.readyState);
                this.updateStatus('Connection error', 'error');
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket closed with code:', event.code, 'reason:', event.reason);
                console.log('WebSocket readyState:', this.ws.readyState);
                this.updateStatus('Disconnected', 'error');
            };
        } catch (error) {
            console.error('Error creating WebSocket:', error);
        }
    }

    startVideoAttendance() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            // Show video container
            this.videoContainer.classList.remove('hidden');
            this.startBtn.disabled = true;

            const segments = window.location.pathname.split('/').filter(Boolean);
            const courseId = segments[segments.length - 1]; // This gives '2'
            console.log(`The course Id is ${courseId}`);

            // Request backend to start streaming
            this.ws.send(JSON.stringify({
                type: 'start_stream',
                courseid: courseId
            }));
        } else {
            this.updateStatus('Not connected to server', 'error');
        }
    }

    handleWebSocketMessage(data) {
        console.log('****************')
        if (data.type === 'frame_update') {
            // Update video frame
            this.video.src = data.frame;

            console.log("Recognition Result is Not Found")
            const name = data.student.name;
            const similarity = data.student.similarity;
            const id = data.student.id;
            this.updateDetectedStudents(id);
            this.updateStatus(`Detected: ${name} (${similarity})`);
        }
        else if (data.type === 'no_detected') {
            this.video.src = data.frame;
        }
        else if (data.type === 'error') {
            this.updateStatus(Error: ${data.message}, 'error');
        }
        else {
            console.log(`We are left with type : ${data.type}`)
            this.video.src = data.frame;
        }
    }

    updateDetectedStudents(id) {
        if (!this.detectedStudents.has(id)) {
            this.detectedStudents.add(id);
            
            // Update the UI
            const studentElement = document.createElement('div');
            studentElement.className = 'detected-student';
            studentElement.textContent = id;
            this.detectedList.appendChild(studentElement);

            // Mark the student as present in the attendance form
            const studentRow = document.querySelector(`[data-student-id="${id}"]`);
            console.log(`Student with id ${id} is found`)
            console.log(`Found Student Row`)
            console.log(studentRow)
            if (studentRow) {
                const checkbox = studentRow.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = true;
                    this.updateCounters();
                }
            }
            else{
                this.updateStatus(`${studentName} is not in the database`);
            }
        }
    }

    // Update counters function
    updateCounters() {
        const presentCount = document.querySelectorAll('.status-checkbox:checked').length;
        const absentCount = this.totalStudents - presentCount;
        
        this.presentCounter.textContent = presentCount;
        this.absentCounter.textContent = absentCount;
    }

    updateStatus(message, type = 'info') {
        this.statusText.textContent = message;
        this.statusText.className = `status-text ${type}`;
    }

    stopVideoAttendance() {
        // Close WebSocket
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        // Reset UI
        this.videoContainer.classList.add('hidden');
        this.startBtn.disabled = false;
        this.detectedList.innerHTML = '';
        
        // Mark remaining students as absent
        this.markRemainingAbsent();
    }

    markRemainingAbsent() {
        document.querySelectorAll('.status-checkbox:not(:checked)').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('change'));
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VideoAttendance();
}); 