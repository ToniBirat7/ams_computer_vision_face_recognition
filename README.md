# BCU AMS - Attendance Management System

A Django-based Attendance Management System with real-time face recognition using PyTorch and WebSocket communication.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
daphne -b 127.0.0.1 -p 8000 AMS.asgi:application
```

Open `http://127.0.0.1:8000` and login with teacher credentials.

## Features

✅ **Real-Time Face Recognition** - WebSocket video streaming with GPU acceleration  
✅ **Automatic Attendance Marking** - Students auto-marked present when face recognized  
✅ **Teacher Dashboard** - Course management and attendance reports  
✅ **Secure Authentication** - Teacher login with role-based access  

## Table of Contents (Full Documentation)

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Core Modules](#core-modules)
  - [Authentication & User Management](#1-authentication--user-management)
  - [Admin Dashboard](#2-admin-dashboard)
  - [Teacher Dashboard](#3-teacher-dashboard)
  - [Attendance System](#4-attendance-system)
  - [Face Recognition Engine](#5-face-recognition-engine)
  - [Performance Prediction](#6-performance-prediction)
  - [Real-time WebSocket Layer](#7-real-time-websocket-layer)
  - [Data Export & Reporting](#8-data-export--reporting)
- [Database Schema](#database-schema)
- [Data Flow](#data-flow)
- [API & URL Routes](#api--url-routes)
- [Face Recognition Pipeline](#face-recognition-pipeline)
- [ML Performance Prediction Pipeline](#ml-performance-prediction-pipeline)
- [Frontend Architecture](#frontend-architecture)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)

---

## Project Overview

The Sunway AMS is designed to address the inefficiencies of manual attendance tracking in educational institutions. It provides:

- A role-based web interface for **Admins** and **Teachers**
- **Manual attendance marking** via an interactive checklist UI
- **Automated attendance marking** via real-time facial recognition powered by an **IoT camera module mounted on an Arduino UNO**, which streams video frames directly to the server over WebSocket
- **Performance prediction** using a trained ML classifier to forecast student grades based on attendance patterns
- **Reporting and Excel export** for attendance records

The system operates as an ASGI application (via Daphne), enabling both standard HTTP request handling and persistent WebSocket connections simultaneously — which is required for the real-time video attendance feature.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    IoT HARDWARE LAYER                            │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Arduino UNO + Camera Module                            │   │
│   │  - Physically mounted in the classroom                  │   │
│   │  - Activated when teacher triggers attendance session   │   │
│   │  - Establishes WebSocket connection to server           │   │
│   │    (includes course/class ID in connection payload)     │   │
│   │  - Continuously streams raw JPEG frames over WebSocket  │   │
│   └───────────────────────┬─────────────────────────────────┘   │
└───────────────────────────┼──────────────────────────────────────┘
                            │ WebSocket (raw video frames + class_id)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     DAPHNE (ASGI Server)                          │
│  Handles HTTP, Browser WebSocket, and Arduino WebSocket           │
├───────────────────────────────────────────────────────────────────┤
│                      DJANGO APPLICATION                           │
│                                                                   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │   auth_app      │  │   teacher_app    │  │  Django Channels│  │
│  │   (Admin views) │  │  (Teacher views) │  │  (WebSocket)    │  │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬────────┘  │
│           │                   │                      │            │
│  ┌────────▼───────────────────▼──────────────────────▼────────┐  │
│  │                     ORM Layer (Django)                      │  │
│  └────────────────────────────┬────────────────────────────────┘  │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────────┐  │
│  │                     SQLite Database                          │  │
│  │   User | Teacher | Student | Course | StudentClass |         │  │
│  │   Attendance                                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐  │
│  │  Face Recognition    │  │   ML Performance Predictor       │  │
│  │  Engine              │  │                                  │  │
│  │  - MTCNN Detection   │  │   - student_grade_classifier.pkl │  │
│  │  - InceptionResnet   │  │   - Scikit-learn Classifier      │  │
│  │    V1 Embeddings     │  │   - Matplotlib Chart Generation  │  │
│  │  - Cosine Similarity │  │                                  │  │
│  │  - known_face_       │  │                                  │  │
│  │    embeddings.pkl    │  │                                  │  │
│  └──────────────────────┘  └──────────────────────────────────┘  │
│                    │ processed frames + detection events          │
└────────────────────┼──────────────────────────────────────────────┘
                     │ WebSocket (video_frame / student_detected)
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│  ┌──────────────────────┐     ┌──────────────────────────────┐   │
│  │  HTML/CSS/JS (Admin) │     │  HTML/CSS/JS (Teacher)       │   │
│  │  - Dashboard UI      │     │  - Attendance Form UI        │   │
│  │  - Student/Teacher   │     │  - Live Video Feed Display   │   │
│  │    CRUD interfaces   │     │  - Auto-checkbox on detect   │   │
│  │  - Reports & Charts  │     │  - Profile Management        │   │
│  └──────────┬───────────┘     │  - Excel Download            │   │
│             │                 └─────────────┬────────────────┘   │
│             │ HTTP (Fetch API / Form Submit) │ WebSocket          │
└─────────────┴───────────────────────────────┴────────────────────┘
```

---

## Technology Stack

### Backend

| Technology            | Version | Purpose                                              |
| --------------------- | ------- | ---------------------------------------------------- |
| Django                | 5.0.7   | Core web framework (routing, ORM, templating, forms) |
| Django REST Framework | 3.16.0  | API views and serializers                            |
| Django Channels       | 4.2.2   | WebSocket protocol support                           |
| Daphne                | 4.1.2   | ASGI server (replaces WSGI for async support)        |

### Machine Learning & Computer Vision

| Technology      | Version   | Purpose                                                            |
| --------------- | --------- | ------------------------------------------------------------------ |
| PyTorch         | 2.2.2     | Deep learning framework for FaceNet                                |
| Torchvision     | 0.17.2    | Image transforms and pre-processing                                |
| FaceNet-PyTorch | 2.6.0     | MTCNN face detection + InceptionResnetV1 embedding model           |
| OpenCV          | 4.11.0    | Video frame decoding and processing (frames received from Arduino) |
| Scikit-learn    | 1.6.1     | Grade prediction classifier                                        |
| NumPy           | 1.26.4    | Numerical array operations                                         |
| Pandas          | 2.2.3     | Data aggregation and manipulation                                  |
| SciPy           | 1.15.1    | Cosine distance / similarity computation                           |
| Matplotlib      | (bundled) | Prediction chart generation                                        |

### IoT Hardware

| Component     | Purpose                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Arduino UNO   | Microcontroller that manages the camera module and initiates the WebSocket connection to the server when attendance is triggered |
| Camera Module | Captures live video frames in the classroom and sends them to the Arduino for transmission                                       |

The Arduino acts as the sole video source for the attendance system. It is responsible for establishing the WebSocket connection (carrying the `course_id`) and continuously pushing JPEG frames to the Django server. No webcam or local camera on the server machine is used.

### Data & File Processing

| Technology | Version | Purpose                         |
| ---------- | ------- | ------------------------------- |
| OpenPyXL   | 3.1.5   | Excel (.xlsx) report generation |
| Pillow     | 10.2.0  | Image validation and processing |

### Frontend

| Technology                           | Purpose                                        |
| ------------------------------------ | ---------------------------------------------- |
| Vanilla JavaScript                   | All interactive logic (no framework)           |
| Chart.js                             | Attendance trend charts and data visualization |
| Fetch API                            | AJAX calls to backend (CRUD operations)        |
| WebSocket API                        | Real-time video attendance connection          |
| Boxicons / Font Awesome / Remix Icon | UI icon libraries                              |
| Custom CSS                           | All styling (no Bootstrap or Tailwind)         |

---

## Project Structure

```
Sunway_AMS_Project/
│
├── AMS/                            # Django project configuration
│   ├── settings.py                 # Global settings (DB, installed apps, channels, media)
│   ├── urls.py                     # Root URL dispatcher
│   ├── asgi.py                     # ASGI entrypoint (HTTP + WebSocket routing)
│   └── wsgi.py                     # WSGI entrypoint (for non-async deployment)
│
├── auth_app/                       # Admin-facing Django application
│   ├── models.py                   # All database models (Teacher, Student, Course, etc.)
│   ├── views.py                    # 30+ views for admin operations
│   ├── urls.py                     # URL patterns for admin routes
│   ├── forms.py                    # Forms with field-level validation
│   ├── consumers.py                # WebSocket consumer (face recognition attendance)
│   ├── routing.py                  # WebSocket URL routing
│   ├── middleware.py               # Custom middleware
│   ├── admin.py                    # Django admin panel registration
│   └── migrations/                 # Database migration files
│
├── teacher_app/                    # Teacher-facing Django application
│   ├── views.py                    # Teacher-specific views
│   ├── urls.py                     # URL patterns for teacher routes
│   ├── forms.py                    # ImageForm for profile photo upload
│   └── migrations/
│
├── Face_Rec/                       # Face recognition module (standalone scripts + live)
│   ├── dataset_maker.py            # Step 1: Crops faces from raw images using MTCNN
│   ├── model_train.py              # Step 2: Generates face embeddings and saves .pkl
│   ├── check.py                    # Step 3: Core recognition function (used by consumers.py)
│   └── test.py                     # Standalone webcam test for recognition pipeline
│
├── Face_Data_Cropped/              # Processed face datasets
│   ├── faces_training/             # Training images organized by person name
│   │   ├── Akshay Kumar/
│   │   ├── Alia Bhatt/
│   │   └── ...
│   └── faces_validation/           # Validation images (same structure)
│
├── Model/
│   └── student_grade_classifier.pkl  # Pre-trained grade prediction classifier
│
├── known_face_embeddings.pkl       # Stored 512-dim embeddings for all registered faces
│
├── templates/
│   ├── auth/                       # Admin HTML templates
│   │   ├── login.html
│   │   ├── admin.html              # Main admin dashboard
│   │   ├── registration.html       # User registration
│   │   ├── PersonRegistration.html # Teacher profile creation
│   │   ├── addstudent.html
│   │   ├── addcourse.html
│   │   ├── addclass.html
│   │   ├── list_students.html
│   │   ├── list_teachers.html
│   │   ├── student_report.html     # Analytics and prediction UI
│   │   ├── review_attendance.html
│   │   └── alter_attendance.html
│   │
│   ├── attendance/                 # Teacher HTML templates
│   │   ├── course_list.html
│   │   ├── student_list.html       # Attendance marking interface
│   │   ├── profile.html
│   │   └── edit-profile.html
│   │
│   └── core/
│       ├── base.html               # Base layout template
│       └── nav.html                # Navigation bar
│
├── static/
│   ├── admin/                      # Admin-side CSS and JavaScript
│   │   ├── admin.css / admin.js    # Dashboard layout and sidebar
│   │   ├── student_list.js         # CRUD operations via Fetch API
│   │   ├── student_report.js       # Chart rendering and report search
│   │   └── registration.js         # Client-side form validation
│   │
│   ├── teacher/                    # Teacher-side CSS and JavaScript
│   │   ├── attendance.js           # Manual attendance form logic
│   │   ├── websocket.js            # WebSocket video attendance client
│   │   ├── course.js               # Course list interactions
│   │   └── profile.js              # Profile edit interactions
│   │
│   ├── css/                        # Shared global styles
│   ├── images/                     # Static image assets
│   └── js/                         # Shared global scripts
│
├── media_files/                    # User-uploaded media (teacher profile photos)
├── db.sqlite3                      # SQLite database file
├── manage.py                       # Django management CLI
├── requirements_final.txt          # Full Python dependency list
└── Special_Notes.md                # Development notes and test data
```

---

## Core Modules

### 1. Authentication & User Management

**Files:** `auth_app/views.py` (login_page, register_user), `auth_app/forms.py`, `templates/auth/login.html`

The system uses Django's built-in `User` model extended with a `Teacher` profile model. There are two user roles:

- **Admin (Superuser):** Has access to the full admin dashboard. Created via Django's `createsuperuser` command.
- **Teacher:** A regular `User` with a linked `Teacher` profile. Access is restricted to the teacher dashboard.

**Login flow:**
1. User submits credentials to `login_page` view
2. `authenticate()` verifies against the database
3. `user.is_superuser` determines redirect destination:
   - `True` → `/admin-page/` (admin dashboard)
   - `False` → `/teacher/course-list/` (teacher dashboard)

**Registration:**
- Admin creates teacher accounts via `/register/`
- Password validation enforces: min 8 characters, uppercase, lowercase, digit, and special character

---

### 2. Admin Dashboard

**Files:** `auth_app/views.py`, `templates/auth/admin.html`, `static/admin/`

The admin dashboard provides complete oversight and management of the institution:

| Feature             | View Function        | Description                                            |
| ------------------- | -------------------- | ------------------------------------------------------ |
| Dashboard overview  | `admin_view`         | Counts of teachers, students, courses                  |
| Register users      | `register_user`      | Creates Django user accounts                           |
| Add teacher profile | `teacher`            | Associates user with a Teacher record (photo, contact) |
| Add student         | `add_student`        | Creates Student records                                |
| Add course          | `add_course`         | Creates courses linked to teachers                     |
| Enroll students     | `add_student_class`  | Links students to courses via StudentClass             |
| View student list   | `list_students`      | Paginated student table with inline edit/delete        |
| View teacher list   | `list_teachers`      | Teacher table with profile details                     |
| Student report      | `get_student_report` | Attendance analytics with charts                       |
| Review attendance   | `review_attendance`  | Audit trail of all attendance records                  |
| Alter attendance    | `alter_attendance`   | Admin correction of individual records                 |

Inline CRUD (edit/delete without page reload) is handled via the Fetch API in `static/admin/student_list.js`.

---

### 3. Teacher Dashboard

**Files:** `teacher_app/views.py`, `templates/attendance/`, `static/teacher/`

Teachers have a separate, restricted dashboard with:

| Feature          | View Function                      | Description                                                 |
| ---------------- | ---------------------------------- | ----------------------------------------------------------- |
| Course list      | `course_list`                      | Displays all courses assigned to the logged-in teacher      |
| Mark attendance  | `take_attendance`                  | Shows enrolled students with checkboxes + past week history |
| Video attendance | Initiated from `student_list.html` | Opens WebSocket session for face-recognition attendance     |
| Profile view     | `profile`                          | Displays teacher info and photo                             |
| Edit profile     | `edit_profile`                     | Updates contact info and profile photo                      |
| Download report  | `download_report`                  | Generates and serves an Excel file of attendance records    |

**Attendance Calendar:** The `take_attendance` view queries the last 7 days of attendance for each enrolled student and passes this as context, allowing teachers to see recent history before marking today's session.

---

### 4. Attendance System

The system supports two modes of attendance marking:

#### Manual Attendance

1. Teacher navigates to a course
2. `take_attendance` view fetches all enrolled students (`StudentClass` records) for that course
3. Template renders each student with a checkbox
4. On form submission (POST), the view creates `Attendance` records with:
   - `stats = 'P'` (Present) for checked students
   - `stats = 'A'` (Absent) for unchecked students
   - `today_date = datetime.date.today()`

#### Video-Based Attendance (IoT + Face Recognition)

Triggered by the teacher from the attendance page. When the teacher clicks the attendance button, the **Arduino UNO** (physically present in the classroom) establishes a WebSocket connection to the Django server, passing the `course_id`. The Arduino then streams raw video frames over that connection. The server runs face recognition on each frame and forwards processed frames and detection results back to the teacher's browser over a second WebSocket connection.

See [Section 7](#7-real-time-websocket-layer) for the full 3-party connection lifecycle and [Section 5](#5-face-recognition-engine) for the recognition pipeline.

---

### 5. Face Recognition Engine

**Files:** `Face_Rec/dataset_maker.py`, `Face_Rec/model_train.py`, `Face_Rec/check.py`, `Face_Rec/test.py`

The face recognition pipeline is a three-stage offline + online process:

#### Stage 1: Dataset Preparation (`dataset_maker.py`)

Runs once before training to prepare clean face crops:

```
Input:  Face_Data/<PersonName>/<image_files>   (raw photos, any size)
        ↓
        MTCNN detects faces and extracts bounding boxes
        ↓
        Crops aligned face region from each image
        ↓
Output: Face_Data_Cropped/faces_training/<PersonName>/<cropped_face_files>
        Face_Data_Cropped/faces_validation/<PersonName>/<cropped_face_files>
```

MTCNN (Multi-task Cascaded Convolutional Networks) performs:
- **P-Net (Proposal Network):** Generates candidate face regions
- **R-Net (Refine Network):** Filters and refines candidates
- **O-Net (Output Network):** Landmark detection and final bounding box

#### Stage 2: Embedding Generation (`model_train.py`)

Converts face images into compact numerical fingerprints:

```
Cropped Faces
        ↓
        Data Augmentation (RandomHorizontalFlip, RandomRotation, ColorJitter)
        ↓
        InceptionResnetV1 (pre-trained on CASIA-WebFace dataset)
        ↓
        512-dimensional embedding vector per face
        ↓
Output: known_face_embeddings.pkl
        Structure: {
            'embeddings': [list of 512-dim numpy arrays],
            'labels': [list of person name strings]
        }
```

`InceptionResnetV1` is a deep convolutional neural network trained to project faces into a metric space where the same person's faces are close together and different people's faces are far apart.

#### Stage 3: Real-time Recognition (`check.py`)

Called during live attendance:

```python
def take_face(frame):
    # 1. Detect faces in frame using MTCNN → returns list of face tensors
    # 2. For each detected face:
    #    a. Generate 512-dim embedding using InceptionResnetV1
    #    b. Compute cosine similarity against all known embeddings
    #    c. Find the best matching embedding
    #    d. If max_similarity >= 0.8: return person_name
    #    e. Else: return "Unknown"
```

**Cosine Similarity:**
```
similarity = dot(A, B) / (||A|| × ||B||)
Range: -1 to 1 (1 = identical, 0 = orthogonal, -1 = opposite)
Threshold used: 0.8
```

Higher threshold = stricter matching = fewer false positives.

---

### 6. Performance Prediction

**Files:** `auth_app/views.py` (`predict_performance`), `Model/student_grade_classifier.pkl`

The performance prediction system uses a scikit-learn classifier to forecast a student's grade based on their attendance pattern.

#### Prediction Flow

```
Request: GET /predict-performance/<student_id>/
        ↓
        Load Model/student_grade_classifier.pkl
        ↓
        Query Attendance records for student (last 90 days)
        ↓
        Calculate: attendance_rate = (present_days / total_days) × 100
        ↓
        If insufficient real data:
            Generate synthetic attendance samples (NumPy normal distribution)
        ↓
        Input features: [attendance_rate, previous_grade_numeric]
        ↓
        model.predict([features])          → predicted_grade (e.g., "A", "B+")
        model.predict_proba([features])    → confidence scores
        ↓
        Generate Matplotlib bar/scatter chart (base64 encoded PNG)
        ↓
        Response: JSON {
            predicted_grade, confidence, chart_image (base64)
        }
```

The model is pre-trained offline on a grade-vs-attendance dataset. Grade labels are mapped to numeric values for classifier compatibility.

---

### 7. Real-time WebSocket Layer

**Files:** `auth_app/consumers.py`, `auth_app/routing.py`, `AMS/asgi.py`, `static/teacher/websocket.js`

Django Channels provides WebSocket support on top of Django. Daphne (the ASGI server) routes WebSocket connections to the `VideoAttendanceConsumer`.

This is a **three-party system**: the Arduino UNO (IoT device), the Django server, and the teacher's browser all participate. There are two distinct WebSocket connections:

1. **Arduino → Server:** The Arduino sends raw camera frames and the class identity
2. **Server → Browser:** The server forwards processed frames and recognition events to the teacher's UI

#### WebSocket Lifecycle

```
Arduino UNO                  Server (VideoAttendanceConsumer)         Browser (websocket.js)
     │                                      │                                  │
     │  [Teacher presses attendance button] │                                  │
     │                                      │◀── connect ws://host/ws/attendance/
     │                                      │      accept browser connection   │
     │                                      │                                  │
     │── connect ws://host/ws/attendance/ ─▶│                                  │
     │    payload: { course_id: <id> }       │  accept Arduino connection       │
     │                                      │                                  │
     │── send: raw JPEG frame ─────────────▶│  receive()                       │
     │── send: raw JPEG frame ─────────────▶│    call take_face(frame)         │
     │── send: raw JPEG frame ─────────────▶│      ← check.py                  │
     │         (continuous stream)          │      MTCNN + FaceNet +           │
     │                                      │      cosine similarity           │
     │                                      │                                  │
     │                                      │    encode frame → base64 JPEG    │
     │                                      │────── {type: 'video_frame', ────▶│
     │                                      │        frame: <base64>}          │  update <img> src
     │                                      │                                  │
     │                                      │  [if face recognized]            │
     │                                      │    query StudentClass            │
     │                                      │    (skip if already detected)    │
     │                                      │────── {type: 'student_detected', ▶│
     │                                      │        student_name: <name>,     │  auto-check checkbox
     │                                      │        student_id: <id>}         │
     │                                      │                                  │
     │── disconnect (session ends) ────────▶│  close Arduino connection        │
     │                                      │────── {type: 'stream_ended'} ───▶│
     │                                      │  close browser connection        │
```

**Duplicate Prevention:** The consumer tracks detected students in a session-scoped set. Once a student is identified, they are not re-processed in the same session, preventing the same face from triggering multiple checkbox events.

**Channel Layer:** Uses `InMemoryChannelLayer` — suitable for single-server development. For production scale-out, this should be replaced with `RedisChannelLayer`.

---

### 8. Data Export & Reporting

**Files:** `teacher_app/views.py` (`download_report`), `auth_app/views.py` (`get_student_report`)

#### Excel Export (`download_report`)

Teachers can download attendance records for a course as an Excel file:

```
GET /teacher/download-report/<course_id>/
        ↓
        Query all Attendance records for this course
        ↓
        openpyxl creates workbook
        ↓
        Headers: Student Name | Date | Status
        ↓
        HttpResponse with Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
        ↓
        Browser downloads file: attendance_<course_title>.xlsx
```

#### Attendance Analytics (`get_student_report`)

Returns JSON for Chart.js rendering on the report page:

```
GET /student-report/?student_id=<id>&course_id=<id>
        ↓
        Query Attendance table filtered by student + course
        ↓
        Annotate with TruncMonth → group by month
        ↓
        Calculate: monthly_rate = (present / total) × 100 per month
        ↓
        Response JSON: {
            months: [...],
            attendance_rates: [...],
            overall_rate: float,
            total_present: int,
            total_absent: int
        }
```

Chart.js in `student_report.js` renders this as a line or bar chart on the frontend.

---

## Database Schema

```
┌──────────────┐        ┌──────────────────┐
│   auth_user  │        │     Teacher      │
│  (Django)    │1─────1│  id              │
│  id          │        │  user_id (FK)    │
│  username    │        │  address         │
│  password    │        │  primary_number  │
│  email       │        │  secondary_number│
│  first_name  │        │  dob             │
│  last_name   │        │  sex             │
│  is_superuser│        │  image           │
└──────────────┘        └────────┬─────────┘
                                 │ 1
                                 │
                                 │ *
                         ┌───────▼──────────┐
                         │     Course       │
                         │  id              │
                         │  title           │
                         │  teacher_id (FK) │
                         │  shift           │
                         │  duration        │
                         └───────┬──────────┘
                                 │ 1
                    ┌────────────┴────────────┐
                    │ *                        │ *
          ┌─────────▼────────┐      ┌─────────▼──────────┐
          │   StudentClass   │      │    Attendance       │
          │  id              │      │  id                 │
          │  course_id (FK)  │      │  course_id (FK)     │
          │  student_id (FK) │      │  student_id (FK)    │
          └─────────┬────────┘      │  today_date         │
                    │ *             │  stats (P/A)         │
                    │               └────────┬────────────┘
                    │                        │
                    └──────────┬─────────────┘
                               │ *
                    ┌──────────▼───────────┐
                    │       Student        │
                    │  id                  │
                    │  name                │
                    │  address             │
                    │  age                 │
                    │  phone_number        │
                    └──────────────────────┘
```

**Key Relationships:**
- `User` ↔ `Teacher`: One-to-one (each teacher has exactly one user account)
- `Teacher` → `Course`: One-to-many (a teacher can have many courses)
- `Student` ↔ `Course`: Many-to-many through `StudentClass` junction table
- `Attendance`: Ties a `Student` to a `Course` on a specific date with a status

---

## Data Flow

### Login and Role Routing

```
POST /login/
  → authenticate(username, password)
  → user.is_superuser == True  →  /admin-page/
  → user.is_superuser == False →  /teacher/course-list/
```

### Manual Attendance Submission

```
Teacher selects course → GET /teacher/attendance/<course_id>/
  → Fetch StudentClass WHERE course=<id>
  → Fetch Attendance WHERE student__in=[...] AND today_date > 7 days ago
  → Render template with student list + 7-day calendar

Teacher submits form → POST /teacher/attendance/<course_id>/
  → For each student in course:
      IF student_id in POST data → Attendance(stats='P')
      ELSE                       → Attendance(stats='A')
  → bulk_create Attendance records
  → Redirect with success message
```

### Video Attendance (IoT + WebSocket + Face Recognition)

```
Teacher clicks "Start Attendance" button on the course page
  → Browser (websocket.js) establishes WebSocket: ws://host/ws/attendance/
  → Server accepts and holds the browser connection open

Arduino UNO in the classroom:
  → Detects attendance trigger (via the teacher's button press)
  → Establishes its own WebSocket: ws://host/ws/attendance/
  → Sends connection payload: { course_id: <id> }

Server (consumers.py):
  → Now holds two open connections: Arduino + Browser
  → Loop: receives raw JPEG frame from Arduino
      name = take_face(frame)   [check.py → MTCNN + FaceNet + cosine sim]

      IF name != "Unknown" AND name NOT in already_detected:
          student = Student.objects.get(name=name)
          sc = StudentClass.objects.get(student=student, course_id=course_id)
          forward to browser: {type: 'student_detected', student_id: sc.id}
          already_detected.add(name)

      Encode frame → base64 JPEG
      forward to browser: {type: 'video_frame', frame: <base64>}

Browser (websocket.js):
  → On 'video_frame': renders frame in <img> tag (live feed display)
  → On 'student_detected': auto-checks the checkbox for that student_id

Arduino disconnects (session ends):
  → Server closes both connections
  → Teacher reviews auto-filled attendance list and submits the form
```

### Performance Prediction

```
Admin clicks "Predict" on student report page
  → GET /predict-performance/<student_id>/

Server:
  → Load Model/student_grade_classifier.pkl
  → attendance_records = Attendance.objects.filter(student=<id>, today_date__gte=90days_ago)
  → rate = present_count / total_count * 100
  → predicted_grade = model.predict([[rate, previous_grade]])
  → confidence = model.predict_proba([[rate, previous_grade]]).max()
  → chart = matplotlib figure → base64 PNG
  → return JsonResponse({predicted_grade, confidence, chart_image})

Client:
  → Render chart image in <img> tag
  → Display predicted grade and confidence badge
```

---

## API & URL Routes

### Admin Routes (`auth_app/urls.py`)

| Method   | URL                          | View                  | Description               |
| -------- | ---------------------------- | --------------------- | ------------------------- |
| GET/POST | `/`                          | `login_page`          | Login form                |
| GET      | `/admin-page/`               | `admin_view`          | Admin dashboard           |
| GET/POST | `/register/`                 | `register_user`       | Create user account       |
| GET/POST | `/teacher/`                  | `teacher`             | Create teacher profile    |
| GET/POST | `/student/`                  | `add_student`         | Add new student           |
| GET/POST | `/add-course/`               | `add_course`          | Create a course           |
| GET/POST | `/add-student-class/`        | `add_student_class`   | Enroll students           |
| GET      | `/list-students/`            | `list_students`       | View all students         |
| GET      | `/list-teachers/`            | `list_teachers`       | View all teachers         |
| GET      | `/get-student/<id>/`         | `get_student`         | Fetch student JSON (AJAX) |
| POST     | `/update-student/<id>/`      | `update_student`      | Edit student (AJAX)       |
| DELETE   | `/delete-student/<id>/`      | `delete_student`      | Remove student (AJAX)     |
| GET      | `/get-teacher/<id>/`         | `get_teacher`         | Fetch teacher JSON (AJAX) |
| DELETE   | `/delete-teacher/<id>/`      | `delete_teacher`      | Remove teacher (AJAX)     |
| GET      | `/student-report/`           | `get_student_report`  | Attendance analytics JSON |
| GET      | `/predict-performance/<id>/` | `predict_performance` | Grade prediction JSON     |
| GET      | `/review-attendance/`        | `review_attendance`   | Attendance audit view     |
| GET/POST | `/alter-attendance/<id>/`    | `alter_attendance`    | Edit attendance record    |
| GET      | `/logout/`                   | `logout_user`         | Log out                   |

### Teacher Routes (`teacher_app/urls.py`)

| Method   | URL                                     | View              | Description       |
| -------- | --------------------------------------- | ----------------- | ----------------- |
| GET      | `/teacher/course-list/`                 | `course_list`     | Teacher's courses |
| GET/POST | `/teacher/attendance/<course_id>/`      | `take_attendance` | Mark attendance   |
| GET      | `/teacher/profile/`                     | `profile`         | View profile      |
| GET/POST | `/teacher/edit-profile/`                | `edit_profile`    | Edit profile      |
| GET      | `/teacher/download-report/<course_id>/` | `download_report` | Export Excel      |

### WebSocket Route (`auth_app/routing.py`)

| Protocol | URL               | Consumer                  |
| -------- | ----------------- | ------------------------- |
| WS       | `/ws/attendance/` | `VideoAttendanceConsumer` |

---

## Face Recognition Pipeline

### Setting Up New Students for Face Recognition

1. Create a folder: `Face_Data/<Student Name>/`
2. Add 20-50 photos of the student's face
3. Run the dataset preparation script:
   ```bash
   python Face_Rec/dataset_maker.py
   ```
4. Run the embedding generation script:
   ```bash
   python Face_Rec/model_train.py
   ```
5. The updated `known_face_embeddings.pkl` is now ready for use

### Recognition Confidence

The recognition threshold is set to `0.8` cosine similarity. You can adjust this in `Face_Rec/check.py`:

```python
THRESHOLD = 0.8   # Lower = more permissive, Higher = stricter
```

### Current Test Subjects

The system comes pre-configured with face data for:
- Akshay Kumar
- Alia Bhatt
- Amitabh Bachchan
- Anushka Sharma
- Hrithik Roshan
- Priyanka Chopra
- Virat Kohli

These serve as dummy data for development and testing purposes.

---

## ML Performance Prediction Pipeline

The grade prediction classifier (`Model/student_grade_classifier.pkl`) is a scikit-learn model that was trained offline.

**Input features:**
1. `attendance_rate` — percentage of classes attended (0–100)
2. `previous_grade` — prior numeric grade

**Output:**
- `predicted_grade` — categorical grade label (e.g., A+, A, B+, B, C, F)
- `confidence` — probability of the predicted class (0–1)

**Synthetic Data Handling:**  
When a student has fewer than the minimum required attendance records, the system generates synthetic data points using a NumPy normal distribution centered around the student's actual rate. This ensures the classifier always receives a sufficient feature set.

---

## Frontend Architecture

The frontend uses no JavaScript frameworks. All interactivity is implemented with:

### Admin Side (`static/admin/`)

| File                | Purpose                                                 |
| ------------------- | ------------------------------------------------------- |
| `admin.js`          | Sidebar toggle, active link highlighting                |
| `student_list.js`   | Fetch API calls for inline edit/delete of students      |
| `student_report.js` | Chart.js rendering for attendance charts, prediction UI |
| `registration.js`   | Client-side password strength and field validation      |

### Teacher Side (`static/teacher/`)

| File            | Purpose                                                              |
| --------------- | -------------------------------------------------------------------- |
| `attendance.js` | Checkbox selection, present/absent counter, form submit logic        |
| `websocket.js`  | WebSocket lifecycle: connect, stream video frames, handle detections |
| `course.js`     | Course list search and filter                                        |
| `profile.js`    | Profile edit AJAX interactions                                       |

### WebSocket Client (`websocket.js`)

The browser opens a WebSocket connection to receive the stream forwarded from the Arduino by the server. The browser does not initiate the video — it only listens for frames and detection events pushed by the server.

```javascript
// Browser connects to receive forwarded stream from server
socket = new WebSocket('ws://' + window.location.host + '/ws/attendance/');

// Handle incoming messages from server
// (server receives raw frames from Arduino, processes them, then forwards here)
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'video_frame') {
        // Render the processed frame sent from server (originally from Arduino)
        videoElement.src = 'data:image/jpeg;base64,' + data.frame;
    } else if (data.type === 'student_detected') {
        // Auto-check the attendance checkbox for the identified student
        document.getElementById('checkbox-' + data.student_id).checked = true;
    } else if (data.type === 'stream_ended') {
        socket.close();
    }
};
```

---

## Installation & Setup

### Prerequisites

- Python 3.9+ installed
- pip and venv
- **Arduino UNO** with a compatible camera module connected to the same network as the server (for video attendance feature)
- The Arduino must be configured with the server's IP address and the WebSocket endpoint (`/ws/attendance/`)

### Steps

```bash
# 1. Clone the repository
git clone <repository_url>
cd Sunway_AMS_Project

# 2. Create and activate virtual environment
python -m venv env
source env/bin/activate         # Linux/Mac
# env\Scripts\activate          # Windows

# 3. Install dependencies
pip install -r requirements_final.txt

# 4. Apply database migrations
python manage.py migrate

# 5. Create a superuser (admin account)
python manage.py createsuperuser

# 6. Collect static files (for production)
python manage.py collectstatic

# 7. Prepare face recognition data (if adding new faces)
python Face_Rec/dataset_maker.py
python Face_Rec/model_train.py
```

---

## Environment Configuration

Key settings in `AMS/settings.py`:

| Setting                  | Current Value          | Production Recommendation      |
| ------------------------ | ---------------------- | ------------------------------ |
| `SECRET_KEY`             | Hardcoded string       | Load from environment variable |
| `DEBUG`                  | `True`                 | Set to `False`                 |
| `ALLOWED_HOSTS`          | `['*']`                | Set to specific domain(s)      |
| `CORS_ALLOW_ALL_ORIGINS` | `True`                 | Restrict to frontend origin    |
| `CHANNEL_LAYERS`         | `InMemoryChannelLayer` | Use `RedisChannelLayer`        |
| `DATABASES`              | SQLite                 | PostgreSQL or MySQL            |

---

## Running the Application

### Development (HTTP only, no WebSocket)

```bash
python manage.py runserver
```

Access at: `http://127.0.0.1:8000/`

### Development with WebSocket Support (recommended)

```bash
daphne -b 127.0.0.1 -p 8000 AMS.asgi:application
```

Access at: `http://127.0.0.1:8000/`

Daphne is required when using the video-based attendance feature, as Django's built-in `runserver` does not support WebSocket connections.

### Default Access

| Role    | URL                      | Credentials                                      |
| ------- | ------------------------ | ------------------------------------------------ |
| Admin   | `http://127.0.0.1:8000/` | Superuser account created with `createsuperuser` |
| Teacher | `http://127.0.0.1:8000/` | User account created by admin via `/register/`   |

---

## Key Design Decisions

**Why Arduino UNO as the camera source instead of a server-side webcam?**  
Mounting the camera on an Arduino UNO makes this a proper IoT deployment — the capture device is physically fixed in the classroom rather than tied to the server machine. The Arduino acts as a dedicated edge device: it establishes the WebSocket connection when attendance is triggered (carrying the `course_id`) and streams frames independently. This decouples the hardware from the server, allows the same server to receive feeds from multiple classrooms simultaneously (one WebSocket per Arduino), and avoids the need for a webcam physically attached to or near the Django host machine.

**Why Daphne over Gunicorn?**  
Daphne is the official ASGI server for Django Channels. Unlike Gunicorn (WSGI), Daphne handles asynchronous connections and the WebSocket protocol natively — which is required for the real-time video attendance consumer.

**Why InceptionResnetV1 (FaceNet) over other face recognition approaches?**  
FaceNet produces 512-dimensional embeddings that are highly discriminative. The pre-trained CASIA-WebFace weights provide strong generalization without requiring a large local dataset. Cosine similarity in embedding space is computationally cheap and highly effective for 1:N matching.

**Why cosine similarity over Euclidean distance?**  
Cosine similarity is magnitude-invariant, making it more robust to variations in face size and lighting across frames. It normalizes the comparison to a [−1, 1] range, making the threshold (0.8) directly interpretable as a percentage of alignment.

**Why SQLite?**  
This is a development-stage application. SQLite requires zero configuration and works out of the box, which is appropriate for prototyping. The ORM layer means switching to PostgreSQL for production requires only a settings change.

**Why InMemoryChannelLayer?**  
Sufficient for a single-server, single-process development environment. It does not persist across restarts and cannot be shared between multiple server processes. A Redis-backed channel layer would be required for any multi-process or multi-server deployment.
