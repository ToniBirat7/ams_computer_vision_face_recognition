from django.urls import path
from . import views

urlpatterns = [
    path('attendance/<int:course_id>/', views.take_attendance, name='attendance'),
    path('download-report/<int:course_id>/', views.download_report, name='download-report'),
    path('edit-profile/', views.edit_profile, name='edit-profile'),
]
