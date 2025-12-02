from django.urls import path
from auth_app import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('', views.login_page, name='login'),
    path('admin-page/', views.admin_view, name='admin-page-name'),
    path('logout/', views.logout_user, name='logout'),
    path('register/', views.register_user, name='register'),
    path('teacher/', views.teacher, name='teacher'),
    path('image/', views.teacher_image, name='image'),
    path('student/', views.add_student, name='add-student'),
    path('add-course', views.add_course, name='add-course'),
    path('add-student-class', views.add_student_class, name='add-student-class'),
    path('list-students/', views.list_students, name='list-students'),
    path('list-teachers/', views.list_teachers, name='list-teachers'),
    path('get-student/<int:id>/', views.get_student, name='get-student'),
    path('delete-student/<int:id>/', views.delete_student, name='delete-student'),
    path('get-teacher/<int:id>/', views.get_teacher, name='get-teacher'),
    path('delete-teacher/<int:id>/', views.delete_teacher, name='delete-teacher'),
    path('update_teacher/', views.update_teacher, name='update_teacher'),
    path('update_student/', views.update_student, name='update_student'),
    path('get-student-report/<int:student_id>/', views.get_student_report, name='get-student-report'),
    path('student-report/', views.student_report_view, name='student-report'),
    path('predict-performance/<int:student_id>/', views.predict_performance, name='predict-performance'),
    path('teacher-details/<int:teacher_id>/', views.teacher_details, name='teacher-details'),
    path('review-attendance/', views.review_attendance, name='review-attendance'),
    path('alter-attendance/<int:attendance_id>/', views.alter_attendance, name='alter-attendance'),
]