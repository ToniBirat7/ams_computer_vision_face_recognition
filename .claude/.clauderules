All database models are defined in auth_app/models.py — never create models in teacher_app/models.py or any other file.
Use @login_required decorator on every view that requires authentication.
Check user role with request.user.is_superuser — True means admin, False means teacher.
Resolve teacher identity at the start of every teacher view: teacher = Teacher.objects.get(user=request.user).
Admin views go in auth_app/views.py and auth_app/urls.py.
Teacher views go in teacher_app/views.py and teacher_app/urls.py.
Admin templates go in templates/auth/. Teacher templates go in templates/attendance/.
Static assets for admin go in static/admin/. Static assets for teachers go in static/teacher/.
Never use jQuery — use vanilla JS with document.getElementById(), querySelector(), and Fetch API.
Include the CSRF token in all non-GET fetch() calls using the X-CSRFToken header.
Return JsonResponse({'error': 'message'}, status=4xx) for AJAX errors, JsonResponse({'success': True, ...}) for success.
Use select_related() and prefetch_related() on any query that follows foreign keys to avoid N+1 queries.
Run python manage.py makemigrations after every model change, then python manage.py migrate immediately.
Never edit existing migration files — always create new ones.
The custom runserver command launches Daphne — python manage.py runserver already provides WebSocket support.
Start the server from the project root directory — Face_Rec/check.py loads known_face_embeddings.pkl via a relative path.
The face recognition name returned by take_face() must exactly match Student.name in the database.
The Student.name used in the DB must match the folder name in Face_Data/ for the recognition system to work.
Load custom template filters with {% load custom_filters %} — they live in teacher_app/templatetags/custom_filters.py.
Use logger = logging.getLogger(__name__) for logging — never use print() in production code paths.
WebSocket messages from the browser to the consumer must be JSON with a 'type' field (e.g., 'start_stream', 'stop_stream').
The detected_students set on VideoAttendanceConsumer is cleared on each start_stream — do not persist state across sessions.
Do not change SECRET_KEY, ALLOWED_HOSTS, or DEBUG in settings.py — move them to .env and use python-decouple.
python-decouple and python-dotenv are already installed — use them to read environment variables.
Do not create new files in staticfiles/ — it is the collectstatic output directory, auto-generated.
openpyxl is installed as a transitive dependency — import it directly (import openpyxl) without adding it to requirements.txt.
All attendance records use 'P' for Present and 'A' for Absent — never use full words or other abbreviations.
Student age is constrained to 20–30 in the model — enforce this in forms as well.
Phone number fields are exactly 10 characters — validate both length and digit-only in forms.
Teacher profile images must be JPEG or PNG and under 1MB — validate MIME type, not just extension.
Run Face_Rec/dataset_maker.py before Face_Rec/model_train.py — model_train.py requires cropped faces as input.
Do not touch db.sqlite3 directly — use Django ORM or manage.py shell for all database operations.
