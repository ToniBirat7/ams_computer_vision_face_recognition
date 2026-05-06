import os
import openpyxl
from datetime import date

from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.decorators.http import require_POST
from django.conf import settings
from django.core.files.storage import default_storage

from apps.accounts.models import Teacher, Course, StudentClass, Attendance


@login_required
def take_attendance(request, course_id):
    """Accept POST from Next.js attendance form and save records."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        course = Course.objects.get(id=course_id)
        today = date.today()

        if Attendance.objects.filter(course=course_id, today_date=today).exists():
            return JsonResponse({'error': 'Attendance already taken today'}, status=409)

        students = StudentClass.objects.prefetch_related('student').filter(course=course_id)

        for item in students:
            student_id = item.student.id
            status = request.POST.get(str(student_id), 'A')
            Attendance.objects.create(
                today_date=today,
                student_id=student_id,
                course_id=course_id,
                stats=status
            )

        return JsonResponse({'message': 'Attendance saved successfully'})

    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def download_report(request, course_id):
    """Return an Excel attendance report for the given course."""
    try:
        course = Course.objects.get(id=course_id)
        records = Attendance.objects.filter(course=course)

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = f"Attendance - {course.title}"
        ws.append(['Date', 'Student Name', 'Status'])

        for r in records:
            ws.append([
                r.today_date.strftime('%Y-%m-%d'),
                r.student.name,
                'Present' if r.stats == 'P' else 'Absent',
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=attendance_{course.title}.xlsx'
        wb.save(response)
        return response

    except Course.DoesNotExist:
        return HttpResponse('Course not found.', status=404)


@login_required
@require_POST
def edit_profile(request):
    """Update teacher contact info and email."""
    try:
        teacher = Teacher.objects.get(user=request.user)

        teacher.address = request.POST.get('address', teacher.address)
        teacher.primary_number = request.POST.get('primary_number', teacher.primary_number)
        teacher.secondary_number = request.POST.get('secondary_number', teacher.secondary_number)

        new_email = request.POST.get('email')
        if new_email and new_email != request.user.email:
            if User.objects.filter(email=new_email).exclude(id=request.user.id).exists():
                return JsonResponse({'error': 'Email already in use'}, status=400)
            request.user.email = new_email
            request.user.save()

        teacher.save()
        return JsonResponse({'message': 'Profile updated successfully'})

    except Teacher.DoesNotExist:
        return JsonResponse({'error': 'Teacher profile not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
