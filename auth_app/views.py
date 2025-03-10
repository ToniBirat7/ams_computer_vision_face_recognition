import io
import numpy as np
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User
from .forms import LoginForm, UserRegistrationForm, TeacherForm, StudentForm, CourseForm, StudentClassForm
from .models import Teacher, Student, Course, StudentClass, Attendance
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db.models import Count
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta
from django.db.models import Q
import matplotlib.pyplot as plt
import base64
from sklearn.ensemble import RandomForestClassifier
import json
import matplotlib
import pickle
from pathlib import Path
import pandas as pd
import random
from scipy import stats  # Add this import
matplotlib.use('Agg')

def login_page(request):
    next = request.GET.get('next')
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember_me = request.POST.get('remember')
        
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            
            # Handle remember me functionality
            if not remember_me:
                request.session.set_expiry(0)
            
            if user.is_superuser:
                return redirect('admin-page-name')
            else:
                return redirect('course-list')
        else:
            messages.error(request, 'Invalid username or password.')
    
    return render(request, 'auth/login.html')

@login_required
def admin_view(request):
    teachers = Teacher.objects.select_related('user').all()
    students = Student.objects.order_by('-id')[:5]
    courses = Course.objects.select_related('teacher', 'teacher__user').all()
    
    context = {
        'teachers': teachers,
        'students': students,
        'courses': courses,
        'teacher_count': teachers.count(),
        'student_count': students.count(),
        'course_count': courses.count(),
    }
    
    return render(request, 'auth/admin.html', context)

@login_required
def logout_user(request):
    logout(request)
    return redirect('login')

@login_required
def register_user(request):
    print("Register User")
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            print(form.cleaned_data)
            first_name = form.cleaned_data.get('first_name')
            last_name = form.cleaned_data.get('last_name')
            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')
            pswd1 = form.cleaned_data.get('password1')
            pswd2 = form.cleaned_data.get('password2')

            if User.objects.filter(username=username).exists():
                form.add_error('username', f'Username with {username} already exists')
                print("Username already exists")
            else:
                User.objects.create_user(first_name=first_name, last_name=last_name, username=username, email=email, password=pswd1)
                messages.success(request, 'User Registered Successfully')
                form = UserRegistrationForm()
        else: 
            print("Field Errors")
            print(form.errors)
            print("Non-Field Errors")
            print(form.non_field_errors())
    else:
        form = UserRegistrationForm()
    return render(request, 'auth/registration.html', {'form': form})

@login_required
def teacher(request):
    user_list = User.objects.exclude(is_superuser=True)
    form = TeacherForm()

    if request.method == 'POST':
        print(request.POST)
        print(request.FILES)
        form = TeacherForm(request.POST, request.FILES)

        if form.is_valid():
            print("Cleaned Data")
            print("*************")
            print(form.cleaned_data)
            user = form.cleaned_data['teacher']
            address = form.cleaned_data['address']
            dob = form.cleaned_data['dob']
            primary_number = form.cleaned_data['primary_number']
            secondary_number = form.cleaned_data['secondary_number']
            sex = form.cleaned_data['sex']
            my_image = form.cleaned_data['my_image']

            if Teacher.objects.filter(user=user).exists():
                print("User already exists")
                form.add_error('teacher', f'User with {user.username} already exists')
            else:
                try:
                    Teacher.objects.create(user=user,
                                        address=address, 
                                        dob=dob, 
                                        primary_number=primary_number, 
                                        secondary_number=secondary_number,
                                        sex=sex,
                                        image=my_image)
                    messages.success(request, 'Teacher Created Successfully')
                    form = TeacherForm()
                except Exception as e:
                    print("Error in Creating User")
        else:   
            print("Form is Invalid")
            print(form.errors)

    return render(request, 'auth/PersonRegistration.html', {'teachers': user_list, 'form': form})

def teacher_image(request):
    teacher = Teacher.objects.all()
    for item in teacher:
        print(item.image)
    return render(request, 'auth/teacher_image.html', {'teachers': teacher})

@login_required
def add_student(request):
    print(request.POST)
    if request.method == 'POST':
        form = StudentForm(request.POST)    
        print("Post Request")
        print(form)
        if form.is_valid():
            print(form.cleaned_data)
            form.save()
            messages.success(request, 'Student Added Successfully')
            form = StudentForm()
        else:
            print(form.errors)
    else: 
        form = StudentForm()
        print("Get Request")
        print(form)
    return render(request, 'auth/addstudent.html', {'form': form})

@login_required
def add_course(request):
    teachers = Teacher.objects.prefetch_related('user').all()
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            print(form.cleaned_data)
            form.save()
            messages.success(request, 'Course Added Successfully')
            form = CourseForm()
        else: 
            print(form.errors)
    else:
        form  = CourseForm()
        form.fields['teacher'].choices = [(teacher.id, f'{teacher.user.first_name} {teacher.user.last_name}') for teacher in teachers]
    return render(request, 'auth/addcourse.html', {'form': form})

@login_required
def add_student_class(request):
    if request.method == "POST":
        form = StudentClassForm(request.POST)
        print(request.POST)
        if form.is_valid():
            print(form.cleaned_data)
            for item in form.cleaned_data.get('student'):
                StudentClass.objects.create(course=form.cleaned_data['course'], student=item)
            messages.success(request, 'Student Class Added Successfully')
            form = StudentClassForm()
        else:
            print("Form is Invalid")
            print(form.errors)
    else:
        form = StudentClassForm()
    return render(request, 'auth/addclass.html',{'form': form})

@login_required
def list_students(request):
    students = Student.objects.all()
    return render(request, 'auth/list_students.html', {'students': students})

@login_required
def list_teachers(request):
    teachers = Teacher.objects.all()
    return render(request, 'auth/list_teachers.html', {'teachers': teachers})

@login_required
def get_student(request, id):
    student = get_object_or_404(Student, id=id)
    data = {
        'name': student.name,
        'address': student.address,
        'age': student.age,
        'phone_number': student.phone_number
    }
    return JsonResponse(data)

@login_required
def edit_student(request, id):
    if request.method == 'POST':
        student = get_object_or_404(Student, id=id)
        try:
            student.name = request.POST.get('name')
            student.address = request.POST.get('address')
            student.age = request.POST.get('age')
            student.phone_number = request.POST.get('phone_number')
            student.save()
            messages.success(request, 'Student updated successfully')
            return JsonResponse({'success': True})
        except Exception as e:
            messages.error(request, 'Error updating student')
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required
@require_POST
def update_student(request):
    try:
        student_id = request.POST.get('student_id')
        student = Student.objects.get(id=student_id)
        
        # Update student details
        student.name = request.POST.get('name')
        student.address = request.POST.get('address')
        student.phone_number = request.POST.get('phone_number')
        student.age = request.POST.get('age')
        student.save()

        return JsonResponse({
            'status': 'success',
            'message': 'Student updated successfully'
        })

    except Student.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Student not found'
        }, status=404)
    
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
@require_POST
def delete_student(request, id):
    try:
        student = Student.objects.get(id=id)
        student.delete()

        return JsonResponse({
            'success': True,
            'message': 'Student deleted successfully'
        })
        
    except Student.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Student not found'
        }, status=404)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
def get_teacher(request, id):
    teacher = get_object_or_404(Teacher, id=id)
    data = {
        'address': teacher.address,
        'primary_number': teacher.primary_number,
        'secondary_number': teacher.secondary_number,
        'dob': teacher.dob,
        'image_url': teacher.my_image.url if teacher.my_image else None
    }
    return JsonResponse(data)

@login_required
@require_POST
def update_teacher(request):
    try:
        teacher_id = request.POST.get('teacher_id')
        teacher = Teacher.objects.get(id=teacher_id)
        
        # Update teacher details
        teacher.address = request.POST.get('address')
        teacher.primary_number = request.POST.get('primary_number')
        teacher.secondary_number = request.POST.get('secondary_number', '')
        teacher.dob = request.POST.get('dob')
        teacher.save()

        return JsonResponse({
            'status': 'success',
            'message': 'Teacher updated successfully'
        })

    except Teacher.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Teacher not found'
        }, status=404)
    
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
@require_POST
def delete_teacher(request, id):
    try:
        teacher = Teacher.objects.get(id=id)
        
        # Delete associated user
        if teacher.user:
            teacher.user.delete()  # This will cascade delete the teacher due to OneToOne relationship
        else:
            teacher.delete()

        return JsonResponse({
            'success': True,
            'message': 'Teacher deleted successfully'
        })
        
    except Teacher.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Teacher not found'
        }, status=404)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
def student_report_view(request):
    return render(request, 'auth/student_report.html')

@login_required
def get_student_report(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
        
        # Get student's courses through StudentClass
        student_classes = StudentClass.objects.filter(student=student)
        
        # Calculate attendance for each course
        courses_data = []
        total_present = 0
        total_absent = 0
        
        for sc in student_classes:
            course = sc.course
            # Using the correct field name 'stats' instead of 'status'
            present_days = Attendance.objects.filter(
                student=student,
                course=course,
                stats='P'
            ).count()
            
            absent_days = Attendance.objects.filter(
                student=student,
                course=course,
                stats='A'
            ).count()
            
            total_days = present_days + absent_days
            
            attendance_rate = (present_days / total_days * 100) if total_days > 0 else 0
            
            courses_data.append({
                'title': course.title,
                'present_days': present_days,
                'absent_days': absent_days,
                'attendance_rate': round(attendance_rate, 1)
            })
            
            total_present += present_days
            total_absent += absent_days

        # Calculate monthly attendance for the chart using correct field names
        monthly_attendance = (
            Attendance.objects.filter(student=student)
            .annotate(month=TruncMonth('today_date'))  # Using today_date instead of date
            .values('month')
            .annotate(
                present=Count('id', filter=Q(stats='P')),  # Using stats='P' instead of status='present'
                total=Count('id')
            )
            .order_by('month')
        )

        monthly_data = []
        for ma in monthly_attendance:
            rate = (ma['present'] / ma['total'] * 100) if ma['total'] > 0 else 0
            monthly_data.append({
                'month': ma['month'].strftime('%B %Y'),
                'rate': round(rate, 1)
            })

        # Calculate overall attendance rate
        total_days = total_present + total_absent
        overall_rate = (total_present / total_days * 100) if total_days > 0 else 0

        return JsonResponse({
            'id': student.id,
            'name': student.name,
            'courses': courses_data,
            'total_present': total_present,
            'total_absent': total_absent,
            'attendance_rate': round(overall_rate, 1),
            'monthly_attendance': monthly_data
        })

    except Student.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_POST
def predict_performance(request, student_id):
    try:
        # Log incoming request data
        print("Received prediction request for student:", student_id)
        print("Request body:", request.body.decode('utf-8'))
        
        # Load the trained model
        try:
            model_path = Path('Model/student_grade_classifier.pkl')
            with open(model_path, 'rb') as file:
                model = pickle.load(file)
            print("Model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return JsonResponse({'error': 'Error loading prediction model'}, status=500)

        # Parse the JSON data from request body
        data = json.loads(request.body)
        previous_grade = data.get('previous_grade')
        
        if not previous_grade:
            return JsonResponse({'error': 'Previous grade is required'}, status=400)

        # Get the student
        student = Student.objects.get(id=student_id)
        
        # Get attendance records
        attendance_records = Attendance.objects.filter(
            student=student,
            today_date__gte=datetime.now() - timedelta(days=90)
        ).select_related('course').order_by('today_date')

        # Calculate current attendance rate
        total_days = attendance_records.count()
        present_days = attendance_records.filter(stats='P').count()
        current_attendance = (present_days / total_days * 100) if total_days > 0 else 75  # Default to 75 if no records

        # Grade mapping for model input
        grade_order = {
            'A+': 6, 'A': 5, 'B+': 4, 'B': 3, 
            'C+': 2, 'C': 1, 'D+': 0, 'D': 0
        }

        # Reverse mapping for prediction output
        reverse_grade_map = {
            6: 'A+', 5: 'A', 4: 'B+', 3: 'B',
            2: 'C+', 1: 'C', 0: 'D+'
        }

        # Convert previous grade to numerical value
        prev_grade_num = grade_order.get(previous_grade)

        # Generate synthetic attendance data around current attendance
        num_samples = 90  # Changed to match the number of days
        synthetic_attendance = np.random.normal(
            loc=current_attendance, 
            scale=5,  # Standard deviation of 5%
            size=num_samples
        )
        synthetic_attendance = np.clip(synthetic_attendance, 50, 100)  # Clip between 50% and 100%

        # Prepare data for prediction (use only 30 samples for prediction)
        X_pred = pd.DataFrame({
            'Attendance': synthetic_attendance[:30],  # Use first 30 samples for prediction
            'Previous_Grade': [prev_grade_num] * 30
        })

        # Make predictions
        predictions = model.predict(X_pred)
        prediction_probs = model.predict_proba(X_pred)

        # Get the most common prediction and its confidence
        predicted_grade_num = int(stats.mode(predictions)[0])
        predicted_grade = reverse_grade_map[predicted_grade_num]
        
        # Calculate confidence as the highest probability for the predicted grade
        confidence = int(np.max(prediction_probs[:, predicted_grade_num]) * 100)

        # Generate visualization
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))
        fig.patch.set_facecolor('#f5f7fa')

        # Colors
        primary_color = '#003b5c'
        secondary_color = '#00a4bd'

        # Initialize attendance data
        dates = [record.today_date for record in attendance_records]
        attendance_rates = [100 if record.stats == 'P' else 0 for record in attendance_records]

        # Plot attendance trend using synthetic data
        if not attendance_records.exists() or len(attendance_rates) < 5:  # If not enough real attendance data
            # Generate dates for synthetic data (last 90 days)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=90)
            synthetic_dates = [start_date + timedelta(days=x) for x in range(90)]
            
            # Use synthetic attendance data (now same length as dates)
            ax1.plot(synthetic_dates, synthetic_attendance, label='Predicted Attendance', 
                    color=secondary_color, alpha=0.6)
            
            # Calculate and plot moving average of synthetic data
            window = 5
            moving_avg = np.convolve(synthetic_attendance, np.ones(window)/window, mode='valid')
            plot_dates = synthetic_dates[window-1:]
            ax1.plot(plot_dates, moving_avg, label='Trend', 
                    color=primary_color, linestyle='--')
        else:
            # Use real attendance data if available
            window = 5
            moving_avg = np.convolve(attendance_rates, np.ones(window)/window, mode='valid')
            plot_dates = dates[window-1:]
            ax1.plot(plot_dates, moving_avg, label='Attendance Trend', 
                    color=secondary_color, alpha=0.6)

        # Add average line
        ax1.axhline(y=current_attendance, color='red', linestyle=':', 
                   label=f'Average ({current_attendance:.1f}%)')
        
        # Customize first plot
        ax1.set_title('Attendance Pattern', fontsize=12, pad=15)
        ax1.set_ylabel('Attendance Rate (%)')
        ax1.set_ylim(0, 100)
        ax1.grid(True, alpha=0.3)
        ax1.legend()

        # Format x-axis dates
        ax1.xaxis.set_major_formatter(matplotlib.dates.DateFormatter('%Y-%m-%d'))
        plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')

        # Grade comparison plot
        grades = ['Previous', 'Predicted']
        grade_values = [prev_grade_num, predicted_grade_num]
        max_grade = 6  # Maximum grade value (A+)
        
        # Convert to percentage for visualization
        grade_percentages = [g * (100/max_grade) for g in grade_values]
        
        ax2.bar(grades, grade_percentages, color=[secondary_color, primary_color])
        ax2.set_title('Grade Comparison', fontsize=12, pad=15)
        ax2.set_ylabel('Grade Level (%)')
        ax2.set_ylim(0, 100)

        # Add grade labels on bars
        for i, (v, g) in enumerate(zip(grade_percentages, [previous_grade, predicted_grade])):
            ax2.text(i, v + 1, g, ha='center', va='bottom')

        plt.tight_layout()

        # Save plot to buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        plt.close()

        # Encode the image
        graphic = base64.b64encode(image_png).decode('utf-8')

        # Prepare response data
        response_data = {
            'predicted_grade': predicted_grade,
            'confidence': confidence,
            'attendance_rate': round(current_attendance, 1),
            'present_days': present_days,
            'course_performance': 'Good' if current_attendance >= 80 else 'Average',
            'chart_image': graphic
        }

        return JsonResponse(response_data)

    except Student.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)
    except Exception as e:
        print(f"Error in predict_performance: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)