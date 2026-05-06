# Agent skills

## Add a new admin view

### When to use
Adding a new page or AJAX endpoint accessible to the admin (superuser) role.

### Files to read first
- `auth_app/views.py` — understand existing view patterns
- `auth_app/urls.py` — understand URL structure and naming
- `auth_app/models.py` — understand available models

### Step-by-step process
1. Add the view function to `auth_app/views.py`
   - Decorate with `@login_required`
   - For HTML views: return `render(request, 'auth/<template>.html', context)`
   - For AJAX endpoints: return `JsonResponse({'key': value})`
   - For form submissions (POST): validate, save, then `redirect('view_name')`
2. Create the template at `templates/auth/<template_name>.html` if needed
   - Extend `templates/core/base.html` or match the pattern of `templates/auth/admin.html`
3. Add the URL pattern to `auth_app/urls.py`:
   ```python
   path('my-new-page/', views.my_view, name='my_view'),
   ```
4. Add a link in the admin sidebar (`templates/auth/admin.html`) if it's a primary page
5. Add any required JS to `static/admin/` and link it in the template

### Verification checklist
- [ ] Start server: `python manage.py runserver`
- [ ] Log in as superuser, navigate to the new URL
- [ ] Verify the page renders without 500 errors
- [ ] Test both GET and POST paths if applicable
- [ ] Verify `@login_required` redirects to login when not authenticated

### Example
See `auth_app/views.py:review_attendance` and `templates/auth/review_attendance.html` for a complete reference implementation.

---

## Add a new teacher view

### When to use
Adding a new page or action accessible to the teacher role only.

### Files to read first
- `teacher_app/views.py` — existing teacher view patterns
- `teacher_app/urls.py` — URL structure
- `auth_app/models.py` — models (all models live here)

### Step-by-step process
1. Add the view function to `teacher_app/views.py`
   - Decorate with `@login_required`
   - Resolve teacher identity at the top: `teacher = Teacher.objects.get(user=request.user)`
   - Handle `Teacher.DoesNotExist` gracefully (redirect with error message)
2. Create template at `templates/attendance/<template_name>.html` if needed
3. Add URL pattern to `teacher_app/urls.py`:
   ```python
   path('my-action/<int:some_id>/', views.my_view, name='my_view'),
   ```
   All teacher URLs are automatically prefixed with `/teacher/` via `AMS/urls.py`.
4. Add any JS to `static/teacher/`

### Verification checklist
- [ ] Log in as teacher (non-superuser account with Teacher profile)
- [ ] Navigate to `/teacher/<new-url>/`
- [ ] Verify only teachers can access (not unauthenticated users)
- [ ] Verify superusers cannot access teacher-specific data by role mismatch

---

## Add a new database model

### When to use
Adding a new entity to the database schema.

### Files to read first
- `auth_app/models.py` — all existing models and their field definitions
- `auth_app/migrations/0001_initial.py` — understand migration baseline

### Step-by-step process
1. Add the model class to `auth_app/models.py`
   - Define fields with appropriate validators (use `MinValueValidator`, `MaxValueValidator`, `MinLengthValidator`)
   - Define `Meta` class with `db_table`, `ordering`, and any `UniqueConstraint`
   - Add `__str__` if useful for admin display
2. Create migration:
   ```bash
   python manage.py makemigrations auth_app
   ```
3. Inspect the generated migration file in `auth_app/migrations/` — verify it matches intent
4. Apply migration:
   ```bash
   python manage.py migrate
   ```
5. Register in `auth_app/admin.py` if admin panel access is needed
6. Create form in `auth_app/forms.py` if user input is required

### Verification checklist
- [ ] `python manage.py migrate` completes without error
- [ ] `python manage.py shell` — instantiate and save an object, confirm no DB errors
- [ ] If adding FK: confirm CASCADE behavior is correct for your use case
- [ ] If adding UniqueConstraint: test that duplicate creation raises `IntegrityError`

---

## Add a field to an existing model

### When to use
Adding a new column to an existing database table.

### Files to read first
- `auth_app/models.py` — the model you're modifying
- Existing migration files to understand the migration chain

### Step-by-step process
1. Add the field to the model in `auth_app/models.py`
   - If the table has existing rows, the field **must** have either `null=True` or a `default=` value
2. Run `python manage.py makemigrations auth_app`
3. Review the generated migration — confirm it doesn't drop or rename existing columns
4. Run `python manage.py migrate`
5. Update any forms that should expose the new field (`auth_app/forms.py`)
6. Update any views that read or write the field
7. Update any templates that display the field

### Verification checklist
- [ ] Migration applies cleanly
- [ ] Existing data is accessible (no data loss)
- [ ] New field appears correctly in any forms/templates updated

---

## Modify the face recognition pipeline

### When to use
Adding new people to the face recognition system, changing recognition threshold, or updating the embedding model.

### Files to read first
- `Face_Rec/check.py` — inference pipeline and threshold
- `Face_Rec/dataset_maker.py` — face cropping logic
- `Face_Rec/model_train.py` — embedding generation

### Step-by-step process

**To add a new person:**
1. Create a folder: `Face_Data/<Person Name>/` (use the exact same name as the Student's `name` field in the database)
2. Add 20–50 clear face photos (JPEG or PNG)
3. Run the dataset preparation script:
   ```bash
   python Face_Rec/dataset_maker.py
   ```
   This crops and saves aligned faces to `Face_Data_Cropped/faces_training/<Person Name>/`
4. Run the embedding generation script:
   ```bash
   python Face_Rec/model_train.py
   ```
   This regenerates `Face_Rec/known_face_embeddings.pkl` with all known faces

**To change recognition threshold:**
1. Edit `Face_Rec/check.py`, line ~61:
   ```python
   SIMILARITY_THRESHOLD = 0.8   # Lower = more permissive, Higher = stricter
   ```

**Important:** The `Student.name` in the database must exactly match the folder name in `Face_Data/`. The face recognition result string is matched directly against `Student.objects.get(name=name)` in `consumers.py`.

### Verification checklist
- [ ] `dataset_maker.py` completes without errors; cropped images appear in `Face_Data_Cropped/`
- [ ] `model_train.py` completes; `known_face_embeddings.pkl` has a recent modification time
- [ ] Start server, trigger video attendance, verify the new person is detected by name
- [ ] Verify the name matches exactly a `Student.name` in the database (or detection will log "not found" without checking in checkbox)

---

## Add a new URL and AJAX endpoint (JSON API)

### When to use
Adding a server-side endpoint that returns JSON data to a JavaScript `fetch()` call.

### Files to read first
- `auth_app/views.py` — look at `get_student`, `get_teacher`, `get_student_report` for patterns
- `static/admin/student_list.js` or `static/admin/student_report.js` for client-side fetch patterns

### Step-by-step process
1. Add view to `auth_app/views.py` (admin) or `teacher_app/views.py` (teacher):
   ```python
   @login_required
   def my_data_endpoint(request, some_id):
       obj = MyModel.objects.get(id=some_id)
       return JsonResponse({'field': obj.field, ...})
   ```
2. Handle errors with appropriate status codes:
   ```python
   try:
       obj = MyModel.objects.get(id=some_id)
   except MyModel.DoesNotExist:
       return JsonResponse({'error': 'Not found'}, status=404)
   ```
3. Add URL to appropriate `urls.py`:
   ```python
   path('my-data/<int:some_id>/', views.my_data_endpoint, name='my_data'),
   ```
4. Add JavaScript fetch call in appropriate `static/` file:
   ```javascript
   fetch(`/my-data/${id}/`, {
       headers: {'X-CSRFToken': getCookie('csrftoken')}
   })
   .then(r => r.json())
   .then(data => { /* use data */ });
   ```

### Verification checklist
- [ ] Navigate to the URL directly in browser — verify JSON response
- [ ] Test from JS `fetch()` — verify data appears in the UI
- [ ] Test with invalid ID — verify 404 response and no unhandled exception

---

## Handle a form submission

### When to use
Adding a POST handler that validates user input and saves to the database.

### Files to read first
- `auth_app/forms.py` — existing form validation patterns
- `auth_app/views.py` — look at `add_student`, `add_course`, `register_user` for patterns

### Step-by-step process
1. Create or update a form class in `auth_app/forms.py` (or `teacher_app/forms.py`):
   ```python
   class MyForm(ModelForm):
       class Meta:
           model = MyModel
           fields = ['field1', 'field2']

       def clean_field1(self):
           value = self.cleaned_data['field1']
           # validation logic
           return value
   ```
2. In the view, handle GET and POST:
   ```python
   def my_view(request):
       if request.method == 'POST':
           form = MyForm(request.POST, request.FILES)
           if form.is_valid():
               form.save()
               return redirect('success_view_name')
       else:
           form = MyForm()
       return render(request, 'auth/my_template.html', {'form': form})
   ```
3. In the template, include `{% csrf_token %}` inside the `<form>` tag
4. Display form errors: `{{ form.field.errors }}` or `{{ form.errors }}`

### Verification checklist
- [ ] Submit valid data — confirm DB record created and redirect occurs
- [ ] Submit invalid data — confirm form re-renders with errors displayed
- [ ] Submit without CSRF token — confirm 403 Forbidden response
- [ ] Test required field constraints (submit empty form)

---

## Write a test

### When to use
Adding tests for any view, form, model, or utility function.

### Files to read first
- The file being tested
- `auth_app/models.py` (for fixtures/setup)

### Step-by-step process
Since no test files exist, create them first:

```bash
# Create test files (deleted during cleanup)
touch auth_app/tests.py
touch teacher_app/tests.py
```

**For view tests:**
```python
from django.test import TestCase, Client
from django.contrib.auth.models import User
from auth_app.models import Teacher, Student

class MyViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser('admin', 'a@a.com', 'pass')
        self.client.login(username='admin', password='pass')

    def test_view_returns_200(self):
        response = self.client.get('/my-url/')
        self.assertEqual(response.status_code, 200)
```

**For form tests:**
```python
from auth_app.forms import UserRegistrationForm

class RegistrationFormTest(TestCase):
    def test_weak_password_rejected(self):
        form = UserRegistrationForm(data={
            'username': 'testuser', 'password1': 'simple', 'password2': 'simple'
        })
        self.assertFalse(form.is_valid())
```

**Run tests:**
```bash
python manage.py test auth_app
python manage.py test teacher_app
python manage.py test  # all
```

### Verification checklist
- [ ] All tests pass: `python manage.py test` exits with 0
- [ ] No test modifies `db.sqlite3` (Django test runner uses a separate test DB by default)

---

## Add an environment variable

### When to use
Adding a new configuration value that should differ between environments (dev vs. production).

### Files to read first
- `AMS/settings.py` — see how other settings are currently configured

### Step-by-step process
1. Create or update `.env` in the project root (this file does not yet exist):
   ```
   MY_SETTING=value
   ```
2. Create `.env.example` with a placeholder (so other developers know what's needed):
   ```
   MY_SETTING=your_value_here
   ```
3. Update `AMS/settings.py` to use `python-decouple` (already installed):
   ```python
   from decouple import config
   MY_SETTING = config('MY_SETTING', default='fallback_value')
   ```
4. Add `.env` to `.gitignore` if it doesn't exist yet:
   ```
   .env
   ```

### Verification checklist
- [ ] Server starts without errors after the settings change
- [ ] Value is loaded correctly: `python manage.py shell` then `from django.conf import settings; print(settings.MY_SETTING)`
- [ ] `.env` is NOT committed to git
- [ ] `.env.example` IS committed to git

---

## Download and review the Excel attendance report

### When to use
Understanding or modifying the Excel export feature.

### Files to read first
- `teacher_app/views.py:download_report` — the view that generates the file
- `teacher_app/urls.py` — route: `/teacher/download-report/<course_id>/`

### Step-by-step process
1. The view queries `Attendance` records for the given course, ordered by date
2. Uses `openpyxl.Workbook()` to create an in-memory workbook
3. Headers row: Date | Student Name | Status
4. Iterates all attendance records, writes one row per record
5. Returns `HttpResponse` with MIME type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**To modify the export format:**
- Edit `teacher_app/views.py:download_report`
- Add/remove columns by modifying the header row and the data row loop
- Test by downloading the file from the teacher dashboard

### Verification checklist
- [ ] Log in as teacher, navigate to a course, click "Download Report"
- [ ] File downloads with `.xlsx` extension
- [ ] Open in Excel/LibreOffice — verify headers and data are correct
- [ ] Test with a course that has no attendance records (should download empty file, not error)
