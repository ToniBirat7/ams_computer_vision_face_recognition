# Agent guidelines

## Agent roles

**Backend agent** — modifies `auth_app/views.py`, `teacher_app/views.py`, models, forms, URL patterns. Owns server-side logic, database queries, and API responses.

**Frontend agent** — modifies `static/` and `templates/`. Responsible for JS, CSS, and HTML. No backend model changes.

**Face recognition agent** — modifies `Face_Rec/` scripts only. Runs `dataset_maker.py` and `model_train.py` to retrain embeddings. Does not touch Django application code.

**Migration agent** — modifies `auth_app/models.py` and runs `makemigrations` + `migrate`. Must verify existing data compatibility before applying destructive schema changes.

## Allowed operations

- Create or edit Python views, forms, models, URLs
- Create or edit JavaScript, CSS, HTML template files
- Create or edit scripts in `Face_Rec/`
- Run: `python manage.py runserver`, `python manage.py migrate`, `python manage.py makemigrations`, `python manage.py shell`
- Run: `python Face_Rec/dataset_maker.py`, `python Face_Rec/model_train.py`
- Install packages via `pip install <pkg>` and add to `requirements.txt`
- Read `db.sqlite3` content via `python manage.py shell` queries (read-only)

## Restricted operations

**Never do these without explicit human approval:**

- Delete or overwrite `db.sqlite3` — it contains live development data
- Delete or overwrite `Face_Rec/known_face_embeddings.pkl` or `Model/student_grade_classifier.pkl`
- Modify existing migration files in `auth_app/migrations/`
- Run `python manage.py migrate --fake` or destructive migration options
- Push commits to `main`/`master` branch
- Change `SECRET_KEY` in `AMS/settings.py` to anything — move it to env var instead
- Delete files from `Face_Data_Cropped/` (regenerated from raw data)
- Modify `auth_app/management/commands/runserver.py` — changing this alters server startup behavior

## Tool usage

```bash
# Package management
pip install -r requirements.txt          # install all deps
pip install <package>                    # install single package
# Always update requirements.txt after adding a package

# Django management
python manage.py runserver               # starts Daphne (custom command)
python manage.py migrate                 # apply migrations
python manage.py makemigrations          # create migration after model change
python manage.py createsuperuser         # create admin account
python manage.py collectstatic           # gather static files
python manage.py shell                   # interactive Django shell

# Face recognition pipeline (run from project root)
python Face_Rec/dataset_maker.py         # crop faces from Face_Data/<Name>/
python Face_Rec/model_train.py           # generate embeddings → known_face_embeddings.pkl
```

## Workflow

When implementing a feature or fixing a bug, follow this sequence:

1. **Read the relevant files first.** Start with `CLAUDE.md`, then the specific view, model, template, or JS file affected.
2. **Understand data flow.** Trace from URL → view → model → template (or WebSocket message → consumer → DB query → response).
3. **Check model constraints.** All models are in `auth_app/models.py`. Understand relationships before writing queries.
4. **Edit, don't create new files.** Prefer editing existing views/templates over adding new ones.
5. **If adding a URL:** add in the appropriate `urls.py` (`auth_app/urls.py` for admin, `teacher_app/urls.py` for teacher).
6. **If changing models:** run `python manage.py makemigrations` immediately, inspect the generated file, then run `python manage.py migrate`.
7. **Test the happy path manually:** start the server, log in, exercise the changed path.
8. **Check for regressions:** test related views that share models or templates.

## How to run the project

```bash
# From project root with venv activated:
python manage.py runserver
# Server starts at http://127.0.0.1:8000/
# WebSocket available at ws://127.0.0.1:8000/ws/attendance/

# Admin login: superuser credentials (create with createsuperuser)
# Teacher login: account created by admin via /register/
```

The custom `runserver` command at `auth_app/management/commands/runserver.py` wraps Daphne, so `manage.py runserver` already provides full WebSocket support.

## How to verify work

**For view/template changes:**
1. Start server: `python manage.py runserver`
2. Log in as the affected role (admin or teacher)
3. Navigate to the changed page and exercise the feature
4. Check the Django console for errors (500 responses, exceptions)
5. Verify database state if needed: `python manage.py shell` then ORM queries

**For model/migration changes:**
1. Run `python manage.py makemigrations` — inspect generated migration
2. Run `python manage.py migrate` — verify no errors
3. Test that existing data is accessible (open shell, query the model)

**For face recognition changes:**
1. Run `python Face_Rec/dataset_maker.py` — verify `Face_Data_Cropped/` output
2. Run `python Face_Rec/model_train.py` — verify `known_face_embeddings.pkl` updated
3. Start server, navigate to attendance page, trigger video attendance, verify face detection

**For WebSocket changes:**
1. Start Daphne server
2. Open attendance page in browser
3. Click "Start Video Attendance"
4. Verify WebSocket connects (check browser dev tools → Network → WS tab)
5. Verify video feed appears and face detection messages arrive

**No automated test suite exists.** All verification is manual.

## Code style rules

- Use Django ORM for all database access. No raw SQL.
- Use `@login_required` decorator on all views that require authentication.
- Return `JsonResponse({'error': 'message'}, status=400)` for AJAX error responses.
- Return `JsonResponse({'success': True, ...})` for AJAX success responses.
- Use `select_related()` when accessing related objects across FK boundaries (prevents N+1 queries).
- Use `render(request, 'template/path.html', context)` for HTML views.
- Use `redirect('view_name')` for post-form-submission redirects.
- Validate file uploads: check MIME type, check file size limit (1MB for teacher images, 2MB for profile photos).
- Do not print secrets or passwords to stdout (avoid `print(request.POST)` in auth views).
- Template filters go in `teacher_app/templatetags/custom_filters.py` — load with `{% load custom_filters %}`.
- JavaScript: use `document.getElementById()` and `querySelector()` directly — no jQuery.
- JavaScript: use Fetch API for AJAX, include CSRF token header on non-GET requests.
- Never hardcode URLs in JavaScript — use `window.location.host` for WebSocket URLs.

## Commit conventions

```
type: short description [scope optional]

Types: feat, fix, refactor, style, docs, chore
Examples:
  feat: add student bulk import from CSV
  fix: prevent duplicate attendance on double form submit
  refactor: extract face recognition config to settings
  chore: update requirements.txt
```

Keep commits focused — one logical change per commit. Branch from `master`.

## Context files to always read before starting work

1. `CLAUDE.md` — project overview, conventions, known gotchas
2. `auth_app/models.py` — all database models and relationships
3. `AMS/settings.py` — configuration, installed apps, channel layer
4. `auth_app/urls.py` — admin URL patterns
5. `teacher_app/urls.py` — teacher URL patterns

For WebSocket work, also read:
- `auth_app/consumers.py` — WebSocket consumer
- `auth_app/routing.py` — WebSocket URL routing
- `AMS/asgi.py` — ASGI protocol routing
- `static/teacher/websocket.js` — browser WebSocket client

For face recognition work, also read:
- `Face_Rec/check.py` — `take_face()` function
- `Face_Rec/model_train.py` — embedding generation pipeline
