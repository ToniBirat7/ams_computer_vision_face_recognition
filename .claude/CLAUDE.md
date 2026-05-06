# BCU AMS — Attendance Management System

## Project overview

BCU AMS is a Django 5.0.7 web application that automates classroom attendance tracking for educational institutions. It provides role-based dashboards for **Admins** (superusers) and **Teachers**, supporting two modes of attendance capture: manual checkbox marking and automated face recognition via live video.

The face recognition pipeline uses MTCNN for detection and FaceNet (InceptionResnetV1, pretrained on CASIA-WebFace) to generate 512-dimensional embeddings, compared against stored embeddings using cosine similarity. Live video is captured from the server's local webcam (`cv2.VideoCapture(0)`) and streamed to the teacher's browser over WebSocket using Django Channels and Daphne (ASGI). The README describes an Arduino IoT integration, but the current implementation captures directly from the server camera — that Arduino path is aspirational and not yet wired in the server-side consumer.

A scikit-learn classifier in `Model/student_grade_classifier.pkl` predicts student grade outcomes from attendance rate and prior grade. The project is development-stage: functional, but not hardened for production (DEBUG=True, hardcoded SECRET_KEY, SQLite, InMemoryChannelLayer).

## Tech stack

| Layer | Technology | Version |
|---|---|---|
| Language | Python | 3.x (no `.python-version` file) |
| Web framework | Django | 5.0.7 |
| ASGI server | Daphne | 4.1.2 |
| WebSocket | Django Channels | 4.2.2 |
| Database | SQLite | (via Django ORM) |
| Face detection | MTCNN (facenet-pytorch) | 2.6.0 |
| Face embedding | InceptionResnetV1 (FaceNet) | facenet-pytorch 2.6.0 |
| Deep learning | PyTorch | 2.2.2 |
| Computer vision | OpenCV | 4.11.0.86 |
| ML prediction | scikit-learn | 1.3.2 |
| Data | NumPy 1.24.3, SciPy 1.11.4 |  |
| Excel export | OpenPyXL (transitive dep) | — |
| Image handling | Pillow | 10.0.1 |
| CORS | django-cors-headers | 4.3.1 |
| Frontend | Vanilla JS, Chart.js, Fetch API, WebSocket API | — |
| Icons | Boxicons, Font Awesome, Remix Icon | — |

## Repository structure

```
BCU_AMS_CV_Project/
├── AMS/                        # Django project config
│   ├── settings.py             # DEBUG=True, hardcoded SECRET_KEY, InMemoryChannelLayer
│   ├── urls.py                 # Root router: auth_app + teacher_app
│   ├── asgi.py                 # Channels ProtocolTypeRouter (HTTP + WebSocket)
│   └── wsgi.py                 # Fallback WSGI entry point
│
├── auth_app/                   # Admin-facing app
│   ├── models.py               # ALL models: Teacher, Student, Course, StudentClass, Attendance
│   ├── views.py                # 30+ views: auth, CRUD, reports, prediction, attendance review
│   ├── forms.py                # Login, Registration, Teacher, Student, Course, StudentClass forms
│   ├── urls.py                 # ~23 admin URL patterns
│   ├── consumers.py            # VideoAttendanceConsumer (WebSocket, face rec, camera loop)
│   ├── routing.py              # WebSocket URL: /ws/attendance/
│   ├── middleware.py           # Debug middleware (prints WebSocket path)
│   └── management/commands/runserver.py  # Wraps daphne; `manage.py runserver` → daphne
│
├── teacher_app/                # Teacher-facing app
│   ├── views.py                # course_list, take_attendance, profile, edit_profile, download_report
│   ├── urls.py                 # 6 teacher URL patterns (prefixed /teacher/)
│   ├── forms.py                # ImageForm (profile photo upload, <2MB)
│   └── templatetags/custom_filters.py  # get_id, get_status filters for attendance grid
│
├── Face_Rec/                   # Face recognition pipeline
│   ├── check.py                # take_face(frame) → "name: similarity" or None
│   ├── dataset_maker.py        # Crop faces from raw images using MTCNN (run offline)
│   ├── model_train.py          # Generate embeddings → known_face_embeddings.pkl (run offline)
│   └── known_face_embeddings.pkl  # Serialized list of (512-dim ndarray, name_str) tuples
│
├── Face_Data_Cropped/          # Pre-processed face images
│   ├── faces_training/         # By person name (7 test subjects — Bollywood celebrities)
│   └── faces_validation/       # Same structure
│
├── Model/
│   └── student_grade_classifier.pkl   # scikit-learn grade predictor (pre-trained offline)
│
├── templates/
│   ├── auth/                   # Admin templates (login, dashboard, CRUD, reports)
│   ├── attendance/             # Teacher templates (course list, attendance form, profile)
│   └── core/                   # base.html, nav.html (shared layout)
│
├── static/
│   ├── admin/                  # Admin JS/CSS (sidebar, CRUD modals, charts, registration)
│   ├── teacher/                # Teacher JS/CSS (websocket.js, attendance.js, profile)
│   ├── css/                    # Shared global styles
│   ├── js/                     # Shared global scripts (login.js)
│   └── images/                 # Default_img.jpg
│
├── media_files/                # User-uploaded teacher photos (served at /media/)
├── db.sqlite3                  # SQLite database (contains dev data)
├── manage.py                   # Django CLI
├── requirements.txt            # Single source of truth for Python deps
├── README.md                   # Full project documentation (977 lines)
└── CLEANUP_PLAN.md             # Record of files removed during cleanup
```

## Getting started

```bash
# 1. Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate          # Linux/Mac
# .venv\Scripts\activate           # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply database migrations
python manage.py migrate

# 4. Create an admin (superuser) account
python manage.py createsuperuser

# 5. Start the server (automatically runs Daphne via custom runserver command)
python manage.py runserver
# OR run Daphne directly:
daphne -b 127.0.0.1 -p 8000 AMS.asgi:application
```

Access at `http://127.0.0.1:8000/`

- **Admin login:** use superuser credentials → redirected to `/admin-page/`
- **Teacher login:** use teacher account created by admin → redirected to `/teacher/course-list/`

## Environment variables

No `.env` file or `.env.example` exists. All configuration is hardcoded in `AMS/settings.py`. The packages `python-decouple` and `python-dotenv` are installed but **not currently used**.

| Setting | Current value | Required change for production |
|---|---|---|
| `SECRET_KEY` | Hardcoded string (insecure) | Load from env var |
| `DEBUG` | `True` | Set to `False` |
| `ALLOWED_HOSTS` | `['*']` | Restrict to specific domain(s) |
| `CORS_ALLOW_ALL_ORIGINS` | `True` | Set to `False`, specify origins |
| `CHANNEL_LAYERS` | `InMemoryChannelLayer` | Use `RedisChannelLayer` |
| `DATABASES` | SQLite at `db.sqlite3` | Use PostgreSQL/MySQL |

To properly move these out of settings.py, use `python-decouple` (already installed):
```python
from decouple import config
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
```

## Architecture overview

```
Browser (Teacher)
    ↕ HTTP (Fetch API, form POST)
    ↕ WebSocket (/ws/attendance/)
        ↓
Daphne (ASGI Server, port 8000)
    ↓
Django Application
    ├── auth_app (admin views, models, WebSocket consumer)
    └── teacher_app (teacher views, Excel export)
        ↓
Django ORM → SQLite (db.sqlite3)

Face Recognition (called inline from WebSocket consumer):
    Server Camera (cv2.VideoCapture(0))
        → MTCNN (face detection)
        → InceptionResnetV1 (512-dim embedding)
        → Cosine similarity vs known_face_embeddings.pkl
        → Match result → auto-check student checkbox
```

All models live in `auth_app/models.py`. `teacher_app` has no models of its own.

## Key conventions

- **Models:** All defined in `auth_app/models.py` only. `teacher_app/models.py` is empty.
- **URL namespacing:** Admin routes at `/` (no prefix), teacher routes at `/teacher/`.
- **Authentication:** Django session auth; `@login_required` decorator on protected views; `request.user.is_superuser` used for role splitting.
- **AJAX pattern:** Admin list pages use Fetch API with JSON responses (`JsonResponse`). No DRF serializers currently in use.
- **Static files:** Namespaced by role — `static/admin/` and `static/teacher/`. Global styles in `static/css/`.
- **Templates:** Namespaced — `templates/auth/` (admin), `templates/attendance/` (teacher), `templates/core/` (shared layout).
- **Face recognition:** Only call `take_face()` from `Face_Rec/check.py`. Do not import model classes directly in consumers.
- **Template filters:** Custom filters (`get_id`, `get_status`) live in `teacher_app/templatetags/custom_filters.py`. Load with `{% load custom_filters %}`.
- **No test files:** All test files were deleted during cleanup. No test infrastructure exists.

## Database

**ORM:** Django ORM (no separate query builder)

**Schema summary:**
- `auth_user` — Django built-in User model
- `teacher` — OneToOne with User; address, phone numbers, DOB, gender, profile image
- `student` — name, address, age (20–30), phone number (unique)
- `course` — title, shift, duration (weeks); FK to Teacher
- `student_class` — junction table; FK to Course + Student (enrollment)
- `attendance` — FK to Student + Course; date; status ('P' or 'A')

**Migrations:**
```bash
python manage.py makemigrations    # after model changes
python manage.py migrate           # apply migrations
```

Only one migration exists: `auth_app/migrations/0001_initial.py` (all tables created together).

## API

**Style:** Django views returning HTML (form-based) + JSON endpoints for AJAX.

**Auth:** Django session authentication. CSRF token required on all POST/DELETE/PATCH requests.

**Adding a new admin endpoint:**
1. Add view function to `auth_app/views.py`
2. Add URL pattern to `auth_app/urls.py`
3. Add `@login_required` decorator if auth required
4. Return `JsonResponse(data)` for AJAX, `render(request, template, context)` for HTML

**Adding a new teacher endpoint:**
1. Add view function to `teacher_app/views.py`
2. Add URL pattern to `teacher_app/urls.py`
3. Verify teacher role: `Teacher.objects.get(user=request.user)` at view start

**WebSocket endpoint:** `ws://host/ws/attendance/` — handled by `auth_app/consumers.py`.

## Testing

**No tests exist.** All `tests.py` files were deleted during cleanup. No test runner configuration.

To add tests:
```bash
# Run Django test suite (once tests are written)
python manage.py test

# Run specific app tests
python manage.py test auth_app
python manage.py test teacher_app
```

## Common commands

```bash
# Start development server (Daphne via custom runserver)
python manage.py runserver

# Start Daphne directly (more explicit)
daphne -b 127.0.0.1 -p 8000 AMS.asgi:application

# Database migrations
python manage.py makemigrations
python manage.py migrate

# Create admin account
python manage.py createsuperuser

# Collect static files (for production)
python manage.py collectstatic

# Face recognition: prepare dataset (add raw photos to Face_Data/<Name>/ first)
python Face_Rec/dataset_maker.py

# Face recognition: generate embeddings from cropped faces
python Face_Rec/model_train.py

# Open Django shell
python manage.py shell
```

## Do not touch

- `Face_Rec/known_face_embeddings.pkl` — regenerated by `Face_Rec/model_train.py`; do not edit manually
- `Model/student_grade_classifier.pkl` — pre-trained offline; replacement requires a full retraining pipeline
- `db.sqlite3` — live database file; contains development data; back up before destructive changes
- `auth_app/migrations/0001_initial.py` — do not modify; create new migrations for schema changes
- `Face_Data_Cropped/` — output of `dataset_maker.py`; regenerated automatically

## Known issues & gotchas

1. **Camera is server-local, not Arduino.** `consumers.py` calls `cv2.VideoCapture(0)` — the local webcam. The README describes an Arduino IoT setup, but that integration is not implemented server-side. The browser sends `{type: 'start_stream', courseid: <id>}` to trigger capture.

2. **Face embedding path is relative.** `Face_Rec/check.py` loads `'Face_Rec/known_face_embeddings.pkl'` with a relative path. The server must be started from the project root.

3. **`python manage.py runserver` runs Daphne**, not Django's dev server — due to the custom command at `auth_app/management/commands/runserver.py`.

4. **`python-decouple` and `python-dotenv` are installed but unused.** Settings are hardcoded. This is a known debt item.

5. **CLEANUP_PLAN.md lists files that don't exist.** It references `auth_app/authentication.py`, `auth_app/permissions.py`, `auth_app/serializers.py`, `auth_app/throttles.py` as "kept" — these files do not exist in the codebase.

6. **No pagination on teacher attendance view.** Large courses will render all students in one page.

7. **InMemoryChannelLayer is not shared across processes.** If you run multiple Daphne workers, WebSocket state won't be shared. Use RedisChannelLayer for multi-process setups.

8. **Custom filter `get_status` uses `value[day]` dict access.** The `attendance` context variable passed from `take_attendance` must be a dict keyed by date string — mismatch will cause KeyError in template.
