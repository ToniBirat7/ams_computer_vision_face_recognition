from django.urls import path
from . import views

urlpatterns = [
    path('course-list/', views.course_list, name='course-list'),
    path('download-report/<int:course_id>/', views.download_report, name='download-report'),
    path('profile/', views.profile, name='profile'),
    path('remove-image/', views.remove_image, name='remove-image'),
    path('edit-profile/', views.edit_profile, name='edit-profile'),
    path('attendance/<int:course_id>/', views.take_attendance, name='attendance'),
]