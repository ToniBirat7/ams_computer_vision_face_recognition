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
                console.log('Received message:', event.data);
                const data = JSON.parse(event.data);
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
            
            // Request backend to start streaming
            this.ws.send(JSON.stringify({
                type: 'start_stream'
            }));
        } else {
            this.updateStatus('Not connected to server', 'error');
        }
    }

    handleWebSocketMessage(data) {
        if (data.type === 'frame_update') {
            // Update video frame
            this.video.src = data.frame;
        } 
        else if (data.type === 'student_detected') {
            const student = data.student;
            if (!this.detectedStudents.has(student.id)) {
                this.detectedStudents.add(student.id);
                
                // Update detected students list
                const studentElement = document.createElement('div');
                studentElement.className = 'detected-student';
                studentElement.textContent = `${student.name} (${(student.similarity * 100).toFixed(2)}%)`;
                this.detectedList.appendChild(studentElement);

                // Mark student as present in the attendance form
                const checkbox = document.getElementById(`status_${student.id}`);
                if (checkbox) {
                    checkbox.checked = true;
                    this.updateAttendanceCounts();
                }

                // Update status
                this.updateStatus(`Detected: ${student.name}`);
            }
        } 
        else if (data.type === 'error') {
            this.updateStatus(`Error: ${data.message}`, 'error');
        }
    }

    updateAttendanceCounts() {
        const totalStudents = document.querySelectorAll('.student-row').length;
        const presentStudents = document.querySelectorAll('.status-checkbox:checked').length;
        
        document.querySelector('#presentCount h3').textContent = presentStudents;
        document.querySelector('#absentCount h3').textContent = totalStudents - presentStudents;
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