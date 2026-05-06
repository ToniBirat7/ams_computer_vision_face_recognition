from django.urls import path
from apps.accounts import views

urlpatterns = [
    # Auth API endpoints
    path('api/login/', views.api_login, name='api-login'),
    path('api/logout/', views.api_logout, name='api-logout'),
    path('api/whoami/', views.api_whoami, name='api-whoami'),

    # CRUD API endpoints
    path('get-student/<int:id>/', views.get_student, name='get-student'),
    path('delete-student/<int:id>/', views.delete_student, name='delete-student'),
    path('update_student/', views.update_student, name='update_student'),
    path('get-teacher/<int:id>/', views.get_teacher, name='get-teacher'),
    path('delete-teacher/<int:id>/', views.delete_teacher, name='delete-teacher'),
    path('update_teacher/', views.update_teacher, name='update_teacher'),
    path('get-student-report/<int:student_id>/', views.get_student_report, name='get-student-report'),
    path('predict-performance/<int:student_id>/', views.predict_performance, name='predict-performance'),
    path('alter-attendance/<int:attendance_id>/', views.alter_attendance, name='alter-attendance'),
    path('delete-course/<int:id>/', views.delete_course, name='delete-course'),
    path('delete-class/<int:id>/', views.delete_class, name='delete-class'),

    # Legacy CRUD routes (kept for Next.js compatibility)
    path('student/', views.add_student, name='add-student'),
    path('add-course/', views.add_course, name='add-course'),
    path('add-student-class/', views.add_student_class, name='add-student-class'),
    path('register/', views.register_user, name='register'),
    path('teacher/', views.add_teacher, name='add-teacher'),

    # Dashboard and data API endpoints
    path('api/dashboard/', views.api_dashboard, name='api-dashboard'),
    path('api/teachers/', views.api_teachers_list, name='api-teachers-list'),
    path('api/students/', views.api_students_list, name='api-students-list'),
    path('api/courses/', views.api_courses_list, name='api-courses-list'),
    path('api/classes/', views.api_classes_list, name='api-classes-list'),
    path('api/teacher/courses/', views.api_teacher_courses, name='api-teacher-courses'),
    path('api/teacher/profile/', views.api_teacher_profile, name='api-teacher-profile'),
    path('api/attendance/<int:course_id>/', views.api_attendance_data, name='api-attendance-data'),
    path('api/review-attendance/', views.api_review_attendance, name='api-review-attendance'),
    path('api/teacher-details/<int:teacher_id>/', views.api_teacher_details, name='api-teacher-details'),
    path('api/users/', views.api_users_list, name='api-users-list'),
    path('api/attendance-record/<int:attendance_id>/', views.api_attendance_record, name='api-attendance-record'),
]