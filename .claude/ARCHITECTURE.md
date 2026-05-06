# Architecture

## System diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│                                                                 │
│  Admin UI (templates/auth/)          Teacher UI (templates/     │
│  - Dashboard, CRUD tables            attendance/)               │
│  - Student reports, charts           - Course list              │
│  - Attendance review                 - Attendance form          │
│  - Grade prediction                  - Live video feed          │
│                                      - Profile management       │
│         │ HTTP (Fetch API, forms)           │ HTTP + WebSocket  │
└─────────┼─────────────────────────────────┼────────────────────┘
          │                                 │
          ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│          Daphne (ASGI) — port 8000                              │
│  HTTP requests → Django views                                   │
│  WebSocket /ws/attendance/ → VideoAttendanceConsumer            │
├─────────────────────────────────────────────────────────────────┤
│                    Django Application                           │
│                                                                 │
│  auth_app/                    teacher_app/                      │
│  ├── views.py (30+ views)     ├── views.py (6 views)           │
│  ├── models.py (all models)   ├── forms.py (ImageForm)         │
│  ├── forms.py (5 forms)       └── templatetags/                │
│  ├── consumers.py             │   └── custom_filters.py        │
│  └── routing.py               │                                │
│                               │                                │
│  ┌────────────────────────────▼──────────────────────────────┐ │
│  │              Django ORM                                    │ │
│  └────────────────────────────┬──────────────────────────────┘ │
│                               │                                │
│  ┌────────────────────────────▼──────────────────────────────┐ │
│  │              SQLite (db.sqlite3)                           │ │
│  │  teacher | student | course | student_class | attendance   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────┐  ┌────────────────────────────────┐  │
│  │  Face Recognition    │  │  ML Grade Predictor            │  │
│  │  Face_Rec/check.py   │  │  Model/student_grade_          │  │
│  │  - MTCNN detection   │  │  classifier.pkl                │  │
│  │  - InceptionResnetV1 │  │  (scikit-learn, pre-trained)   │  │
│  │  - Cosine similarity │  └────────────────────────────────┘  │
│  │  - cv2.VideoCapture  │                                      │
│  │    (local webcam: 0) │                                      │
│  └──────────────────────┘                                      │
└─────────────────────────────────────────────────────────────────┘
```

> ⚠️ Unverified (README claim): The README describes an Arduino UNO camera module streaming over WebSocket. The actual `consumers.py` implementation uses `cv2.VideoCapture(0)` — a local server webcam, not a remote Arduino stream. The Arduino path may be a future integration target.

## Module map

| Module / File | Responsibility |
|---|---|
| `AMS/settings.py` | Global configuration: DB, installed apps, channels, static/media paths |
| `AMS/asgi.py` | Protocol routing: HTTP → Django, WebSocket → `VideoAttendanceConsumer` |
| `AMS/urls.py` | Root URL dispatch: `auth_app.urls` + `teacher_app.urls` |
| `auth_app/models.py` | All database models (Teacher, Student, Course, StudentClass, Attendance) |
| `auth_app/views.py` | Admin views: login, CRUD, reports, grade prediction, attendance audit |
| `auth_app/forms.py` | Form classes with validation: Login, UserRegistration, Teacher, Student, Course, StudentClass |
| `auth_app/urls.py` | ~23 URL patterns for admin operations |
| `auth_app/consumers.py` | WebSocket consumer: opens camera, runs face recognition loop, sends results to browser |
| `auth_app/routing.py` | WebSocket URL → `VideoAttendanceConsumer` |
| `auth_app/middleware.py` | Debug middleware: logs WebSocket connection path |
| `auth_app/management/commands/runserver.py` | Overrides `manage.py runserver` to launch Daphne |
| `teacher_app/views.py` | Teacher views: course list, attendance marking, profile, Excel download |
| `teacher_app/urls.py` | 6 URL patterns under `/teacher/` prefix |
| `teacher_app/forms.py` | ImageForm (profile photo, <2MB) |
| `teacher_app/templatetags/custom_filters.py` | `get_id`, `get_status` dict-access filters for attendance grid |
| `Face_Rec/check.py` | `take_face(frame)` — face detection + embedding + cosine similarity → name string |
| `Face_Rec/dataset_maker.py` | Offline: crop aligned faces from raw images using MTCNN |
| `Face_Rec/model_train.py` | Offline: generate 512-dim embeddings, save to `known_face_embeddings.pkl` |
| `Face_Rec/known_face_embeddings.pkl` | Stored embeddings: list of `(ndarray[512], str)` tuples |
| `Model/student_grade_classifier.pkl` | Pre-trained scikit-learn grade classifier |
| `static/teacher/websocket.js` | Browser WebSocket client: connects, handles frame/detection messages |
| `static/teacher/attendance.js` | Attendance form: checkbox counters, mark all present, form submission |
| `static/admin/student_list.js` | Inline CRUD for student table via Fetch API |
| `static/admin/student_report.js` | Chart.js rendering + grade prediction UI |

## Data flow

### Flow 1: Manual attendance marking

```
1. Teacher → GET /teacher/attendance/<course_id>/
      teacher_app/views.take_attendance (GET)
      ├─ Course.objects.get(id=course_id)
      ├─ StudentClass.objects.filter(course=course)  [enrolled students]
      ├─ Attendance.objects.filter(student__in=students, today_date__gte=7 days ago)
      └─ render 'attendance/student_list.html' with {students, attendance_history}

2. Teacher checks/unchecks boxes → POST /teacher/attendance/<course_id>/
      teacher_app/views.take_attendance (POST)
      ├─ For each StudentClass in course:
      │    IF student_id in POST data → stats='P'
      │    ELSE                       → stats='A'
      └─ Attendance.objects.bulk_create([...]) → redirect with success message
```

### Flow 2: Video-based attendance (face recognition)

```
1. Teacher opens attendance page → browser loads attendance.js + websocket.js

2. Teacher clicks "Start Video Attendance"
   websocket.js:
   ├─ Creates WebSocket: ws://127.0.0.1:8000/ws/attendance/
   └─ On connect, sends: {type: 'start_stream', courseid: <id>}

3. VideoAttendanceConsumer.receive() [auth_app/consumers.py]
   ├─ Sets self.course_id = <id>
   ├─ Clears self.detected_students set
   ├─ Opens cv2.VideoCapture(0) [server local webcam]
   └─ Spawns asyncio task: process_frames()

4. process_frames() loop (10 FPS):
   ├─ camera.read() → raw OpenCV frame
   ├─ take_face(frame) [Face_Rec/check.py]
   │    ├─ MTCNN.detect(PIL image) → bounding boxes
   │    ├─ Crop face → 160×160 tensor
   │    ├─ InceptionResnetV1(face_tensor) → 512-dim embedding
   │    ├─ cosine_similarity(embedding, each known_embedding)
   │    └─ If max_sim ≥ 0.8 → "Name: 0.92", else "Unknown: 0.45"
   │
   ├─ If name recognized and not in detected_students:
   │    ├─ StudentClass.objects.filter(course_id, student__name=name)
   │    ├─ self.detected_students.add(student.id)  [prevents re-detection]
   │    └─ send: {type:'student_detected', student:{id, name, similarity}}
   │
   └─ Always send: {type:'frame_update', frame:<base64 JPEG>}
              OR  {type:'no_detected', frame:<base64>, recognition_result:...}

5. Browser receives WebSocket message:
   ├─ 'frame_update' / 'no_detected' → videoElement.src = 'data:image/jpeg;base64,...'
   └─ 'student_detected' → document.getElementById('status_<id>').checked = true

6. Teacher reviews auto-filled checkboxes → clicks "Save Attendance"
   → POST /teacher/attendance/<course_id>/ (same as Flow 1, step 2)
```

### Flow 3: Grade prediction

```
1. Admin clicks "Predict" on student_report.html
   → GET /predict-performance/<student_id>/

2. auth_app/views.predict_performance:
   ├─ Load Model/student_grade_classifier.pkl
   ├─ Attendance.objects.filter(student=id, today_date__gte=90 days ago)
   ├─ attendance_rate = (present_count / total_count) * 100
   ├─ If insufficient data: generate synthetic samples (NumPy normal dist)
   ├─ model.predict([[attendance_rate, previous_grade_numeric]])
   ├─ model.predict_proba([...]).max() → confidence
   ├─ Matplotlib figure → base64 PNG
   └─ JsonResponse({predicted_grade, confidence, chart_image})

3. static/admin/student_report.js:
   ├─ Renders chart in <img> tag
   └─ Displays grade label + confidence badge
```

## Database schema

```
auth_user (Django built-in)
│  id (PK), username, password, email, first_name, last_name, is_superuser
│
└─1:1─ teacher
         id, user_id (FK→auth_user, CASCADE), address (30),
         primary_number (10, unique), secondary_number (10, unique),
         dob (date, nullable), sex (M/F), image (file, nullable)
         [UniqueConstraint on (primary_number, secondary_number)]
         │
         └─1:N─ course
                  id, title (100), teacher_id (FK→teacher, CASCADE),
                  shift (M/D), duration (int, weeks)
                  │
                  ├─1:N─ student_class
                  │        id, course_id (FK→course, CASCADE),
                  │        student_id (FK→student, CASCADE)
                  │
                  └─1:N─ attendance
                           id, course_id (FK→course, CASCADE),
                           student_id (FK→student, CASCADE),
                           today_date (date), stats (P/A)

student
  id, name (30), address (30), age (int, 20–30), phone_number (10, unique)
  ↑ referenced by student_class and attendance via FK
```

**Key relationships:**
- `User` ↔ `Teacher`: OneToOne (CASCADE delete)
- `Teacher` → `Course`: 1-to-many (CASCADE)
- `Student` ↔ `Course`: many-to-many through `StudentClass`
- `Attendance`: ties Student + Course + date + status

**No unique constraint on Attendance** — duplicate attendance records for the same student/course/date can be created if the view is called twice. The `take_attendance` view does not currently guard against this.

## External integrations

No third-party service integrations (no email provider, no payment processor, no analytics). All data stays local.

| Artifact | Source | Location |
|---|---|---|
| FaceNet weights | CASIA-WebFace (via facenet-pytorch) | Downloaded on first use by facenet-pytorch |
| Grade classifier | Pre-trained offline | `Model/student_grade_classifier.pkl` |
| Face embeddings | Generated locally from face images | `Face_Rec/known_face_embeddings.pkl` |

## Auth & authorization

**Authentication:** Django session-based auth (`django.contrib.auth`). `authenticate(username, password)` + `login(request, user)`.

**Role detection:** `request.user.is_superuser` — True → Admin, False → Teacher. No intermediate roles.

**Login flow (`auth_app/views.login_page`):**
```
POST /  → authenticate() → is_superuser? → /admin-page/ or /teacher/course-list/
```

**Protection:** `@login_required` decorator on all non-public views. `LOGIN_URL = 'login'` in settings.

**Teacher identity resolution:**
```python
teacher = Teacher.objects.get(user=request.user)
```
Called at the start of teacher views to get the linked Teacher record.

**No JWT, no OAuth, no third-party auth provider.** Pure Django sessions.

## State management

**Server-side state:** Django sessions (cookie-based session ID, server-stored session data).

**WebSocket state:** Stored as instance attributes on `VideoAttendanceConsumer`:
- `self.camera` — `cv2.VideoCapture` object (None until `start_stream` received)
- `self.course_id` — course being attended
- `self.detected_students` — `set` of student IDs already detected (session-scoped, in-memory)

**Browser state:** No JavaScript framework. DOM is the state. Attendance checkboxes reflect current state. WebSocket messages mutate the DOM directly.

**Chart data:** Fetched fresh on each page load from `/get-student-report/<id>/` (no client-side caching).

## Background processing

No background task queue (no Celery, no BullMQ, no Redis queue).

The face recognition frame-processing loop runs as an `asyncio.create_task()` inside the WebSocket consumer — it is concurrent but runs within the same Daphne process, not a separate worker.

## Configuration model

All configuration is in `AMS/settings.py`. No environment-based switching. No `.env` file.

| Setting | Dev value | Production target |
|---|---|---|
| `DEBUG` | `True` | `False` |
| `SECRET_KEY` | Hardcoded | Env var via `python-decouple` |
| `ALLOWED_HOSTS` | `['*']` | `['yourdomain.com']` |
| `DATABASES` | SQLite | PostgreSQL |
| `CHANNEL_LAYERS` | `InMemoryChannelLayer` | `RedisChannelLayer` |
| `CORS_ALLOW_ALL_ORIGINS` | `True` | `False` + explicit origins |
| `MEDIA_ROOT` | `BASE_DIR / 'media_files'` | Persistent storage volume |
| `STATIC_ROOT` | `BASE_DIR / 'staticfiles'` | CDN or web server |

## Performance considerations

- **N+1 risk:** `take_attendance` GET fetches StudentClass records then iterates. Use `select_related('student')` (currently present via `prefetch_related` in some views).
- **Frame processing:** 10 FPS loop (`asyncio.sleep(0.1)`) runs in async consumer. Heavy CPU work (MTCNN + FaceNet) may block the event loop if not offloaded. Currently runs inline.
- **No pagination on teacher views:** All students in a course render at once. Large courses (100+ students) will have slow page loads.
- **Matplotlib chart generation:** Each prediction call generates a chart synchronously. No caching.
- **No index on Attendance.today_date:** Queries filtering by date range on large attendance tables will be slow without adding a DB index.

## Security considerations

**Critical gaps (dev-only settings that must be changed before production):**
- `SECRET_KEY` is hardcoded and committed to version control
- `DEBUG=True` exposes stack traces and settings in error pages
- `ALLOWED_HOSTS=['*']` allows Host header injection
- `CORS_ALLOW_ALL_ORIGINS=True` allows cross-origin requests from any domain

**Input validation:**
- Form field validation in `auth_app/forms.py` (length, character sets, uniqueness)
- File upload validation: MIME type check + size limit in `TeacherForm` and `ImageForm`
- Phone numbers validated for 10-digit length only (no format or country code check)

**CSRF:** Django's `CsrfViewMiddleware` is active. Templates include `{% csrf_token %}`. JavaScript AJAX calls must include `X-CSRFToken` header.

**Password policy (enforced in `UserRegistrationForm`):** min 8 chars, uppercase, lowercase, digit, special character.

**No rate limiting** on any endpoint. Authentication endpoint (`login_page`) has no brute-force protection.

**Print statements** throughout `consumers.py` and `views.py` log request data to stdout — review before production to avoid leaking sensitive values.
