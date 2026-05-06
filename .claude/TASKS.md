# Project task status

## Completion summary

**~70% — Functional Beta.** All core features work end-to-end: authentication, admin CRUD, teacher attendance (manual and video-based), face recognition pipeline, grade prediction, Excel export, and reporting charts. The codebase is clean and well-organized. What's missing is production hardening, test coverage, and some UX polish. The system is ready for internal use or demo but not for public deployment.

## Completed work

- **Authentication system:** Login/logout with role-based redirect (admin vs teacher). Password strength validation. Session-based auth.
- **Admin dashboard:** Full CRUD for Teachers, Students, Courses, and enrollment (StudentClass). Inline edit/delete without page reload via Fetch API.
- **Teacher dashboard:** Course list, attendance marking form with 7-day history calendar, profile view/edit, profile photo upload/remove.
- **Manual attendance:** Checkbox-based marking for all enrolled students; creates Attendance records (P/A) on submit.
- **Video attendance (server webcam):** WebSocket consumer opens local camera (`cv2.VideoCapture(0)`), runs MTCNN + FaceNet face recognition at 10 FPS, auto-checks attendance checkboxes in browser.
- **Face recognition pipeline:** Dataset preparation (`dataset_maker.py`), embedding generation (`model_train.py`), and real-time inference (`check.py`). Pre-loaded with 7 test subjects.
- **ML grade prediction:** `predict_performance` view loads pre-trained scikit-learn model, computes attendance rate, generates prediction + confidence + Matplotlib chart.
- **Attendance reporting:** Monthly attendance rates via Chart.js, overall rate, present/absent counts. Teacher-level report with per-course stats.
- **Attendance audit:** Admin can review and alter individual attendance records.
- **Excel download:** Teacher can download per-course attendance as `.xlsx` file via `openpyxl`.
- **Custom Django runserver command:** `manage.py runserver` launches Daphne automatically.
- **Codebase cleanup:** Removed legacy requirement files, temp docs, empty test files, and Python cache.

## In progress

- **Arduino IoT integration:** The README documents Arduino UNO streaming over WebSocket. The server consumer currently uses `cv2.VideoCapture(0)` (local webcam). The Arduino-as-camera-source architecture is planned but not implemented server-side. The `start_stream` message type is wired in the browser client (`websocket.js`) but the consumer assumes local camera only.

- **Environment configuration:** `python-decouple` and `python-dotenv` are installed but unused. `AMS/settings.py` still has hardcoded `SECRET_KEY`, `DEBUG=True`, and `ALLOWED_HOSTS=['*']`. The transition to env-var-based config is pending.

## Known TODOs & FIXMEs

No `TODO` or `FIXME` comments were found in the codebase (grep found none). The following are structural issues identified during audit:

| Issue | File | Severity |
|---|---|---|
| `SECRET_KEY` hardcoded in version control | `AMS/settings.py:28` | Critical |
| `DEBUG = True` | `AMS/settings.py:31` | Critical |
| `ALLOWED_HOSTS = ['*']` | `AMS/settings.py:33` | Critical |
| `CORS_ALLOW_ALL_ORIGINS = True` | `AMS/settings.py:178` | High |
| `InMemoryChannelLayer` — no multi-process support | `AMS/settings.py:154` | High |
| Camera is `cv2.VideoCapture(0)` — not Arduino stream | `auth_app/consumers.py:130` | High |
| `print()` debug statements throughout production code | `auth_app/consumers.py` (multiple lines) | Medium |
| `print()` debug statements in views | `auth_app/views.py` (multiple lines) | Medium |
| Form validation error message bug: says "uppercase" but checks lowercase | `auth_app/forms.py:64` | Low |
| Phone number validation checks length only, not format | `auth_app/forms.py` | Low |
| No unique constraint preventing duplicate Attendance records | `auth_app/models.py` | Medium |
| `CLEANUP_PLAN.md` lists non-existent files as "kept" | `CLEANUP_PLAN.md` | Low |
| Relative path for pickle file — server must run from project root | `Face_Rec/check.py:14` | Low |
| Cosine similarity threshold hardcoded at 0.8 | `Face_Rec/check.py:61` | Low |

## Missing tests

**All test files were deleted during cleanup.** Zero test coverage exists.

Missing coverage areas:
- `auth_app/views.py` — login, register, student/teacher CRUD, report generation, prediction
- `teacher_app/views.py` — attendance marking logic, course list filtering, Excel export
- `auth_app/consumers.py` — WebSocket connect, message routing, face detection integration
- `auth_app/models.py` — model constraints, validation, cascade behavior
- `auth_app/forms.py` — form validation rules (password policy, phone number, file size)
- `Face_Rec/check.py` — face detection and similarity logic (unit tests with dummy frames)
- `teacher_app/templatetags/custom_filters.py` — `get_id`, `get_status` filter logic

Recommended test framework: `pytest-django` or Django's built-in `unittest`.

## Tech debt

1. **No environment configuration.** `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` are hardcoded. `python-decouple` is installed but unused.

2. **Print-based debugging.** `consumers.py` has 20+ `print()` statements with Unicode symbols (`✓`, `✗`) that should be replaced with `logger.info()` / `logger.debug()`.

3. **Face recognition loads models at module level.** `Face_Rec/check.py` loads MTCNN and InceptionResnetV1 on import. This causes slow startup and prevents reloading without server restart.

4. **No attendance uniqueness constraint.** Resubmitting the attendance form creates duplicate records. Should add `unique_together = ('student', 'course', 'today_date')` to `Attendance.Meta`.

5. **No pagination.** Teacher attendance views and admin list views render all records. Large datasets will cause slow pages.

6. **Fragile WebSocket message parsing.** `consumers.py` parses `result.split(':')` to extract name and similarity from `take_face()`. If the name contains a colon, this breaks silently.

7. **No database index on `Attendance.today_date`.** Attendance queries filter heavily by date. Add a DB index.

8. **`CLEANUP_PLAN.md` is stale.** Lists files that don't exist as "kept." Should be updated or removed.

9. **`auth_app/views.py` is monolithic.** 756 lines covering auth, CRUD, reports, ML prediction, attendance review. Should be split into separate view modules.

10. **Grade prediction uses synthetic data silently.** When attendance history is sparse, the system generates fake data with NumPy. This should be surfaced to the user as a warning.

## Blocked / needs decision

1. **Arduino integration design.** If the IoT path is a real requirement: how does the server identify which WebSocket connection is from the Arduino vs. the browser? Currently both connect to the same endpoint. A shared token or separate endpoint is needed.

2. **Production database.** SQLite is unsuitable for production. PostgreSQL migration requires a settings change and a data export/import step. Decision: which DB for production?

3. **Face recognition retraining workflow.** Adding a new student requires running two offline scripts. Should this be exposed as an admin UI action, or remain a CLI-only operation?

4. **Attendance uniqueness policy.** Should teachers be able to re-submit attendance for the same date (overwrite), or should the system prevent it? Model constraint depends on this decision.

5. **Grade classifier retraining.** The pre-trained model (`student_grade_classifier.pkl`) is a black box. If accuracy is poor, who retrains it, and with what data? No training pipeline or dataset is included.

## Next recommended actions

1. **[Critical] Move secrets to env vars.** Create a `.env` file and use `python-decouple` to load `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`. Takes ~30 minutes.

2. **[High] Add Attendance uniqueness constraint.** Add `unique_together = ('student', 'course', 'today_date')` to `Attendance.Meta`, run migration. Prevents data corruption.

3. **[High] Replace print statements with logging.** Replace all `print()` in `consumers.py` and `views.py` with `logger.info()` / `logger.debug()` calls. Improves production observability.

4. **[High] Add test suite.** Start with `auth_app/forms.py` validation tests (fast, no DB needed) and `teacher_app/views.py` attendance logic tests. Target: at least happy-path tests for every view.

5. **[Medium] Fix form validation error message bug.** `auth_app/forms.py:64` — error says "uppercase" but the check is for lowercase. One-line fix.

6. **[Medium] Add pagination.** Add Django's `Paginator` to list views and the attendance table. Prevents slow loads for large datasets.

7. **[Medium] Split `auth_app/views.py`.** Extract into: `auth_views.py`, `crud_views.py`, `report_views.py`. Reduces the 756-line monolith.

8. **[Low] Create `.env.example`.** Document all required environment variables so new developers know what to set up.

9. **[Low] Add DB index on `Attendance.today_date`.** Speeds up all attendance history queries.

10. **[Low] Clarify Arduino integration.** Document whether the Arduino path is a real requirement or an aspirational note, and track the implementation task accordingly.
