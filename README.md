# BCU AMS — Attendance Management System

A production-grade attendance management system for educational institutions. Features role-based dashboards for **Admins** and **Teachers**, manual attendance marking, real-time **face recognition attendance** via WebSocket video streaming, ML-based grade prediction, and Excel report export.

**Stack:** Django 5 (ASGI/Daphne) · Next.js 15 (React 19) · PyTorch + FaceNet · SQLite / PostgreSQL · Redis (optional)

---

## Features

| Feature | Description |
|---|---|
| Role-based auth | Admin (superuser) and Teacher roles with separate dashboards |
| Manual attendance | Teacher marks students present/absent via checkbox grid |
| Face recognition | Live webcam stream via WebSocket; students auto-marked when face matched |
| Grade prediction | scikit-learn classifier predicts at-risk students from attendance rate |
| Excel export | Per-course attendance report as `.xlsx` |
| Full CRUD | Admin manages teachers, students, courses, and class enrollments |
| Attendance review | Admin can alter any attendance record retroactively |

---

## Architecture

```
Browser (Next.js 15)
    │
    │  HTTP  /api/django/* → proxied to Django
    │  WS    ws://host/ws/attendance/
    │
Next.js Dev Server (port 3000)  OR  nginx (production)
    │
Daphne ASGI Server (port 8000)
    │
Django 5
    ├── apps/accounts   — auth, admin CRUD, dashboard, ML prediction
    └── apps/attendance — teacher views, WebSocket consumer, face rec
        │
        ├── SQLite (dev) / PostgreSQL (prod)
        ├── Redis (optional, required for multi-process WebSocket)
        └── Face Recognition
                MTCNN → FaceNet embeddings → cosine similarity
```

---

## Project Structure

```
BCU_AMS_CV_Project/
├── backend/
│   ├── apps/
│   │   ├── accounts/        # Auth, admin CRUD, dashboard, ML views
│   │   │   ├── models.py    # Teacher, Student, Course, StudentClass, Attendance
│   │   │   ├── views.py     # 30+ API endpoints
│   │   │   └── consumers.py # WebSocket video + face recognition
│   │   └── attendance/      # Teacher-facing views
│   │       └── views.py     # take_attendance, download_report, edit_profile
│   ├── config/
│   │   ├── settings.py      # python-decouple config, production-ready
│   │   ├── urls.py
│   │   └── asgi.py          # Channels ProtocolTypeRouter
│   ├── services/
│   │   └── face_recognition/
│   │       ├── check.py         # take_face(frame) → match or None
│   │       ├── dataset_maker.py # Crop faces with MTCNN (run offline)
│   │       ├── model_train.py   # Generate embeddings.pkl (run offline)
│   │       └── embeddings.pkl   # Pre-built face embeddings
│   ├── ml_models/
│   │   └── grade_classifier.pkl # Pre-trained scikit-learn classifier
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example         # Copy to .env and fill in values
│   └── db.sqlite3           # Dev database (git-ignored)
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── (auth)/      # Login page
│   │   │   ├── admin/       # Admin dashboard, students, teachers, courses, reports
│   │   │   └── teacher/     # Teacher dashboard, attendance, profile
│   │   ├── components/      # Shared UI components
│   │   ├── lib/api.ts       # All API calls
│   │   ├── hooks/           # useWebSocket, useSearch
│   │   └── middleware.ts    # Route protection (role-based)
│   ├── next.config.ts       # Proxies /api/django/* → Django
│   ├── .env.local.example   # Copy to .env.local and fill in values
│   └── package.json
│
└── DEPLOYMENT.md            # Azure VM deployment guide
```

---

## Local Development Setup

### Prerequisites

- Python 3.10+
- Node.js 20+
- A webcam attached to the server machine (for face recognition)

### 1. Clone

```bash
git clone https://github.com/ToniBirat7/BCU_AMS_CV_Project.git
cd BCU_AMS_CV_Project
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv ../.venv
source ../.venv/bin/activate   # Linux/Mac
# ..\.venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

Edit `backend/.env` — at minimum set `SECRET_KEY` and `DEBUG=True`:

```bash
# Generate a secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

```bash
# Apply migrations
python manage.py migrate

# Create admin account
python manage.py createsuperuser

# Start Django (Daphne ASGI server)
daphne -b 127.0.0.1 -p 8000 config.asgi:application
```

Django API is now running at `http://127.0.0.1:8000`.

### 3. Frontend

```bash
# In a new terminal, from project root
cd frontend

npm install

cp .env.local.example .env.local
# Default values work for local dev — no edits needed

npm run dev
```

Open `http://localhost:3000`.

### Default Login

| Role | How to create | Redirect after login |
|---|---|---|
| Admin | `python manage.py createsuperuser` | `/admin` dashboard |
| Teacher | Admin creates via Teachers page | `/teacher` dashboard |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `SECRET_KEY` | **Yes** | — | Django secret key |
| `DEBUG` | No | `False` | Set `True` for development |
| `ALLOWED_HOSTS` | No | `127.0.0.1,localhost` | Comma-separated allowed hosts |
| `FRONTEND_URLS` | No | `http://localhost:3000,http://127.0.0.1:3000` | CORS/CSRF trusted origins |
| `DB_ENGINE` | No | `django.db.backends.sqlite3` | Database backend |
| `DB_NAME` | No | `db.sqlite3` path | Database name or path |
| `DB_USER` | No | — | PostgreSQL user |
| `DB_PASSWORD` | No | — | PostgreSQL password |
| `DB_HOST` | No | — | PostgreSQL host |
| `DB_PORT` | No | — | PostgreSQL port |
| `REDIS_URL` | No | — | Enables `RedisChannelLayer` for WebSocket |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_DJANGO_URL` | `http://127.0.0.1:8000` | Django API URL (browser-visible) |
| `NEXT_PUBLIC_WS_URL` | `ws://127.0.0.1:8000` | WebSocket base URL |
| `DJANGO_INTERNAL_URL` | `http://127.0.0.1:8000` | Internal Django URL (server-side proxy) |

---

## Face Recognition Setup

The system ships with pre-built embeddings for demo faces. To add real students:

```bash
cd backend

# 1. Create a folder named exactly as the student appears in the system
mkdir -p services/face_recognition/training_data/StudentName

# 2. Add 10–20 clear face photos (JPG/PNG) to that folder

# 3. Crop and align faces with MTCNN
python services/face_recognition/dataset_maker.py

# 4. Regenerate embeddings file
python services/face_recognition/model_train.py
```

The student's name in the database must match the folder name exactly.

---

## API Reference

All endpoints are called from the browser as `/api/django/<path>` (proxied by Next.js). Against Django directly use `/<path>`.

### Auth
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/login/` | JSON login → returns `{role}` |
| `POST` | `/api/logout/` | Clear session |
| `GET` | `/api/whoami/` | Current user + role |

### Admin CRUD
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/students/` | List students |
| `POST` | `/student/` | Add student |
| `GET/POST` | `/get-student/<id>/`, `/update_student/` | Get/update student |
| `DELETE` | `/delete-student/<id>/` | Delete student |
| `GET` | `/api/teachers/` | List teachers |
| `POST` | `/teacher/` | Add teacher |
| `GET` | `/api/courses/` | List courses |
| `POST` | `/add-course/` | Add course |
| `DELETE` | `/delete-course/<id>/` | Delete course |
| `GET` | `/api/classes/` | List enrollments |
| `POST` | `/add-student-class/` | Enroll student in course |
| `DELETE` | `/delete-class/<id>/` | Remove enrollment |

### Reports & ML
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/dashboard/` | Dashboard stats |
| `GET` | `/get-student-report/<id>/` | Student attendance report |
| `GET` | `/predict-performance/<id>/` | ML grade prediction |
| `GET` | `/api/review-attendance/` | All attendance records |
| `POST` | `/alter-attendance/<id>/` | Change attendance status |

### Teacher
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/teacher/courses/` | Teacher's assigned courses |
| `GET` | `/api/teacher/profile/` | Teacher profile |
| `GET` | `/api/attendance/<course_id>/` | Course attendance grid |
| `POST` | `/teacher/attendance/<course_id>/` | Save attendance |
| `GET` | `/teacher/download-report/<course_id>/` | Download Excel report |
| `POST` | `/teacher/edit-profile/` | Update profile photo |

### WebSocket
```
ws://host/ws/attendance/
```
After connecting, send:
```json
{"type": "start_stream", "courseid": 1}
```
Receives frames and `student_detected` events:
```json
{"type": "student_detected", "name": "Alice", "similarity": 0.92}
```

---

## Database Schema

| Table | Key Fields |
|---|---|
| `auth_user` | Django built-in |
| `teacher` | OneToOne → user; photo, phone, address, DOB, gender |
| `student` | name, age (15–50), phone (unique), address |
| `course` | title, shift (M/A/E), duration (weeks); FK → teacher |
| `student_class` | FK → course + student (enrollment junction) |
| `attendance` | FK → student + course; date; status ('P'/'A') |

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for a step-by-step guide to deploying on an **Azure VM** with nginx, Daphne, PostgreSQL, and Redis.

---

## Known Limitations

- **Camera is server-local.** The webcam (`cv2.VideoCapture(0)`) must be physically attached to the Django server machine.
- **SQLite is single-writer.** For concurrent production use, switch to PostgreSQL via environment variables.
- **InMemoryChannelLayer** does not work across multiple processes. Set `REDIS_URL` in production.
- **No pagination** on the teacher attendance view.

---

## License

MIT
