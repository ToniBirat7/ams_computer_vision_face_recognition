from django.shortcuts import render
from auth_app.models import Teacher, Course
from django.shortcuts import redirect
from .forms import ImageForm
from auth_app.models import StudentClass, Attendance
from django.contrib import messages
import openpyxl
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User

import os 
from django.conf import settings
from django.core.files.storage import default_storage
from datetime import date, timedelta
import calendar

# Create your views here.

@login_required
def course_list(request):
    try:
        teacher = Teacher.objects.get(user=request.user)
        courses = Course.objects.filter(teacher=teacher).select_related('teacher__user')
        
        print(f"Found {courses.count()} courses for teacher {teacher}")
        for course in courses:
            print(f"Course: {course.title}, Teacher: {course.teacher.user.get_full_name()}")
        
        context = {
            'courses': courses,
        }
        return render(request, 'attendance/course_list.html', context)
    except Teacher.DoesNotExist:
        print(f"No teacher profile found for user {request.user}")
        messages.error(request, 'Teacher profile not found.')
        return redirect('logout')
    except Exception as e:
        print(f"Error in course_list view: {str(e)}")
        messages.error(request, 'An error occurred while loading courses.')
        return redirect('logout')

@login_required
def download_report(request, course_id):
    try:
        # Fetch the course
        course = Course.objects.get(id=course_id)

        # Fetch attendance records for the course
        attendance_records = Attendance.objects.filter(course=course)

        # Create a new Excel workbook
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = f"Attendance Report for {course.title}"

        # Set headers for the Excel sheet
        headers = ['Date', 'Student Name', 'Status']
        ws.append(headers)

        # Add data rows
        for record in attendance_records:
            ws.append([
                record.today_date.strftime('%Y-%m-%d'),
                record.student.name,
                'Present' if record.stats == 'P' else 'Absent'
            ])

        # Prepare the response with the Excel file
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=attendance_{course.title}.xlsx'

        # Save workbook to the response
        wb.save(response)
        return response

    except Course.DoesNotExist:
        return HttpResponse("Course not found.", status=404)

@login_required
def profile(request):
    user_id = request.user.id
    teacher = Teacher.objects.get(user=user_id)
    list_of_courses = Course.objects.filter(teacher=teacher).prefetch_related('teacher')

    if request.method == 'POST':
        form = ImageForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                # Delete old image if it exists and is not the default
                if teacher.image and teacher.image.name != 'NA':
                    if os.path.isfile(teacher.image.path):
                        os.remove(teacher.image.path)
                
                # Save new image
                teacher.image = form.cleaned_data['image']
                teacher.save()
                
                messages.success(request, 'Profile photo updated successfully')
            except Exception as e:
                print(f"Error updating image: {str(e)}")
                messages.error(request, 'Error updating profile photo')
        else:
            messages.error(request, 'Invalid image file')
            print(form.errors)
    else:
        form = ImageForm()

    return render(request, 'attendance/profile.html', {
        'courses': list_of_courses,
        'teacher': teacher,
        'form': form
    })

@login_required
def remove_image(request):
    user_id = request.user.id
    teacher = Teacher.objects.get(user=user_id)
    if teacher.image and teacher.image.name != 'NA':
        image_path = os.path.join(settings.MEDIA_ROOT, teacher.image.name)
        print("Image Path")
        print(image_path)
        if default_storage.exists(image_path):
            default_storage.delete(image_path)
            teacher.image = 'NA'
            teacher.save()
    return redirect('profile')

@login_required
def edit_profile(request):
    user_id = request.user.id
    teacher = Teacher.objects.get(user=user_id)

    if request.method == "POST":
        try:
            # Update teacher info
            teacher.address = request.POST.get('address')
            teacher.primary_number = request.POST.get('primary_number')
            teacher.secondary_number = request.POST.get('secondary_number')
            
            # Update user email
            new_email = request.POST.get('email')
            if new_email and new_email != teacher.user.email:
                # Check if email is already in use
                if User.objects.filter(email=new_email).exclude(id=user_id).exists():
                    messages.error(request, 'This email is already in use.')
                    return redirect('edit-profile')
                teacher.user.email = new_email
                teacher.user.save()
            
            # Validate phone numbers
            if not teacher.primary_number.isdigit() or len(teacher.primary_number) != 10:
                messages.error(request, 'Primary phone number must be 10 digits.')
                return redirect('edit-profile')
            
            if teacher.secondary_number and (not teacher.secondary_number.isdigit() or len(teacher.secondary_number) != 10):
                messages.error(request, 'Secondary phone number must be 10 digits.')
                return redirect('edit-profile')
            
            teacher.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('profile')
            
        except Exception as e:
            print(f"Error updating profile: {str(e)}")
            messages.error(request, 'An error occurred while updating your profile.')
            return redirect('edit-profile')

    return render(request, 'attendance/edit-profile.html', {
        'teacher': teacher
    })

# Calender Views

@login_required
def take_attendance(request, course_id):
    # Attendance.objects.all().delete()
    try:
        course_obj = Course.objects.get(id=course_id)
        todays_date = date.today()
        month_name = calendar.month_name[todays_date.month]
        students = StudentClass.objects.prefetch_related('student').filter(course=course_id)

        # Check if attendance already taken for today
        attendance_exists = Attendance.objects.filter(
            course=course_id,
            today_date=todays_date
        ).exists()

        if attendance_exists:
            messages.warning(request, f'Attendance for {course_obj.title} has already been taken today.')
            return redirect('course-list')

        past_date = [todays_date - timedelta(days=i) for i in range(1,8)]

        if request.method == "POST":
            try:
                # Double check attendance hasn't been taken while form was open
                if Attendance.objects.filter(course=course_id, today_date=todays_date).exists():
                    messages.warning(request, f'Attendance for {course_obj.title} has already been taken today.')
                    return redirect('course-list')

                # Process attendance
                for item in students:
                    student_id = item.student.id
                    status = request.POST.get(str(student_id), 'A')  # Default to absent if not marked
                    Attendance.objects.create(
                        today_date=todays_date,
                        student_id=student_id,
                        course_id=course_id,
                        stats=status
                    )
                
                messages.success(request, f'Attendance has been marked successfully for {course_obj.title}')
                return redirect('course-list')
            
            except Exception as e:
                print(f"Error taking attendance: {str(e)}")
                messages.error(request, 'An error occurred while saving attendance.')
                return redirect('course-list')
    
        # For GET request, prepare attendance view
        status_dict = {}
        for item in students:
            student_id = item.student.id
            status_dict[student_id] = {}
            for d in past_date:
                try:
                    obj = Attendance.objects.get(
                        today_date=d,
                        student=student_id,
                        course=course_id
                    )
                    status_dict[student_id][d.day] = obj.stats
                except Attendance.DoesNotExist:
                    status_dict[student_id][d.day] = 'NA'

        context = {
            'month_name': month_name,
            'today_date': todays_date,
            'students': students,
            'past_date': past_date,
            'status_dict': status_dict,
            'course': course_obj
        }
        
        return render(request, 'attendance/student_list.html', context)

    except Course.DoesNotExist:
        messages.error(request, 'Course not found.')
        return redirect('course-list')
    except Exception as e:
        print(f"Error in take_attendance view: {str(e)}")
        messages.error(request, 'An error occurred while loading the attendance page.')
        return redirect('course-list')