class VideoAttendance {
  constructor() {
    try {
      console.log('[CONSTRUCTOR] Starting VideoAttendance constructor');
      this.video = document.getElementById('videoElement');
      console.log('[CONSTRUCTOR] video element:', this.video);
      this.statusText = document.getElementById('statusText');
      console.log('[CONSTRUCTOR] statusText element:', this.statusText);
      this.detectedList = document.getElementById('detectedStudents');
      console.log('[CONSTRUCTOR] detectedList element:', this.detectedList);
      this.videoContainer = document.getElementById('videoFeedContainer');
      console.log('[CONSTRUCTOR] videoContainer element:', this.videoContainer);
      this.startBtn = document.getElementById('startVideoBtn');
      console.log('[CONSTRUCTOR] startBtn element:', this.startBtn);
      this.closeBtn = document.getElementById('closeVideoBtn');
      console.log('[CONSTRUCTOR] closeBtn element:', this.closeBtn);
      this.ws = null;
      this.detectedStudents = new Set();

      this.setupEventListeners();
      this.setupWebSocket();
      console.log('[CONSTRUCTOR] VideoAttendance initialized successfully');
    } catch (error) {
      console.error('[CONSTRUCTOR] Error in VideoAttendance constructor:', error);
      throw error;
    }
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
        console.log(
          'WebSocket closed with code:',
          event.code,
          'reason:',
          event.reason,
        );
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

      // Extract course ID from URL (e.g., /teacher/attendance/1/)
      const pathParts = window.location.pathname.split('/').filter((p) => p);
      const courseId = pathParts[pathParts.length - 1];

      console.log('Extracted course ID:', courseId);

      // Request backend to start streaming with course ID
      this.ws.send(
        JSON.stringify({
          type: 'start_stream',
          courseid: parseInt(courseId),
        }),
      );
    } else {
      this.updateStatus('Not connected to server', 'error');
    }
  }

  handleWebSocketMessage(data) {
    try {
      console.log('Received message type:', data.type, 'data:', data);
      if (!data || !data.type) {
        console.warn('Invalid message: no type', data);
        return;
      }

      if (data.type === 'frame_update' || data.type === 'no_detected') {
        // Update video frame (for both regular frames and no-detection frames)
        if (data.frame) {
          this.video.src = data.frame;
        }
      } else if (data.type === 'student_detected') {
        const student = data.student;
        console.log('Student detected:', student);
        console.log(
          'Student object keys:',
          student ? Object.keys(student) : 'NULL',
        );
        if (student && !this.detectedStudents.has(student.id)) {
          this.detectedStudents.add(student.id);
          console.log('Adding student to detected list:', student);

          // Update detected students list
          const studentElement = document.createElement('div');
          studentElement.className = 'detected-student';
          const name = student.name || 'Unknown';
          const similarity =
            typeof student.similarity === 'number'
              ? (student.similarity * 100).toFixed(2)
              : 'N/A';
          studentElement.textContent = `${name} (${similarity}%)`;
          this.detectedList.appendChild(studentElement);

          // Mark student as present in the attendance form
          const checkbox = document.getElementById(`status_${student.id}`);
          console.log(
            'Looking for checkbox:',
            `status_${student.id}`,
            'found:',
            !!checkbox,
          );
          if (checkbox) {
            checkbox.checked = true;
            this.updateAttendanceCounts();
          }

          // Update status
          const statusMsg = `Detected: ${name}`;
          this.updateStatus(statusMsg);
        }
      } else if (data.type === 'error') {
        const message = (data && data.message) || 'Unknown error';
        this.updateStatus(`Error: ${message}`, 'error');
      } else {
        console.warn('Unknown message type:', data.type, 'full data:', data);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error, data);
    }
  }

  updateAttendanceCounts() {
    const totalStudents = document.querySelectorAll('.student-row').length;
    const presentStudents = document.querySelectorAll(
      '.status-checkbox:checked',
    ).length;

    document.querySelector('#presentCount h3').textContent = presentStudents;
    document.querySelector('#absentCount h3').textContent =
      totalStudents - presentStudents;
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
    document
      .querySelectorAll('.status-checkbox:not(:checked)')
      .forEach((checkbox) => {
        checkbox.checked = false;
        checkbox.dispatchEvent(new Event('change'));
      });
  }
}

// Initialize immediately AND on DOMContentLoaded
console.log('[INIT] Script loaded, document.readyState:', document.readyState);

function initVideoAttendance() {
  console.log('[INIT] Initializing VideoAttendance');
  try {
    window.videoAttendance = new VideoAttendance();
    console.log('[INIT] VideoAttendance initialized successfully');
  } catch (error) {
    console.error('[INIT] Error initializing VideoAttendance:', error);
  }
}

// If DOM is already ready, initialize immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideoAttendance);
} else {
  // DOM is already loaded, initialize now
  initVideoAttendance();
}
