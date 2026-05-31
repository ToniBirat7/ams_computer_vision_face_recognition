# Python Standard Library
import io
import json
import base64
import pickle
from datetime import datetime, timedelta
from pathlib import Path

# Third Party Imports
import numpy as np
# pandas / matplotlib / scipy are imported lazily inside predict_performance() — they
# add ~80-150 MB resident and only that one view needs them. Deferring keeps the
# Daphne worker light at boot (matters on RAM-constrained hosts).

# Django Imports
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from functools import wraps

def api_login_required(view_func):
    """Return JSON 401 for unauthenticated requests instead of redirecting."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


def validate_required_fields(data: dict, fields: list) -> tuple[bool, str]:
    """Validate that all required fields are present and non-empty."""
    for field in fields:
        value = data.get(field, '').strip() if isinstance(data.get(field), str) else data.get(field)
        if not value:
            return False, f'{field} is required'
    return True, ''

# Local Imports
from .models import (
    Teacher,
    Student,
    Course,
    StudentClass,
    Attendance
)


# ── Admin CRUD endpoints (for Next.js frontend) ─────────────────────────────

@api_login_required
@require_POST
def add_student(request):
    try:
        name = request.POST.get('name', '').strip()
        address = request.POST.get('address', '').strip()
        age = request.POST.get('age', '').strip()
        phone_number = request.POST.get('phone_number', '').strip()

        # Validate required fields
        valid, msg = validate_required_fields({
            'name': name,
            'address': address,
            'age': age,
            'phone_number': phone_number
        }, ['name', 'address', 'age', 'phone_number'])
        if not valid:
            return JsonResponse({'success': False, 'error': msg}, status=400)

        # Validate age range
        try:
            age_int = int(age)
            if age_int < 15 or age_int > 50:
                return JsonResponse({'success': False, 'error': 'Age must be between 15 and 50'}, status=400)
        except ValueError:
            return JsonResponse({'success': False, 'error': 'Age must be a valid number'}, status=400)

        # Validate phone format (basic)
        if not phone_number.isdigit() or len(phone_number) < 10:
            return JsonResponse({'success': False, 'error': 'Phone number must be at least 10 digits'}, status=400)

        student = Student.objects.create(
            name=name,
            address=address,
            age=age_int,
            phone_number=phone_number
        )
        return JsonResponse({
            'success': True,
            'message': 'Student added successfully',
            'student_id': student.id
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@api_login_required
@require_POST
def add_course(request):
    try:
        teacher_id = request.POST.get('teacher', '').strip()
        title = request.POST.get('title', '').strip()
        duration = request.POST.get('duration', '').strip()
        shift = request.POST.get('shift', 'M').strip()

        # Validate required fields
        if not teacher_id or not title or not duration:
            return JsonResponse({'success': False, 'error': 'Teacher, title, and duration are required'}, status=400)
        if len(title) < 3 or len(title) > 100:
            return JsonResponse({'success': False, 'error': 'Course title must be 3-100 characters'}, status=400)

        # Validate duration
        try:
            duration_int = int(duration)
            if duration_int < 1 or duration_int > 52:
                return JsonResponse({'success': False, 'error': 'Duration must be 1-52 weeks'}, status=400)
        except ValueError:
            return JsonResponse({'success': False, 'error': 'Duration must be a valid number'}, status=400)

        # Validate shift
        if shift not in ['M', 'A', 'E']:
            return JsonResponse({'success': False, 'error': 'Shift must be M (Morning), A (Afternoon), or E (Evening)'}, status=400)

        teacher = Teacher.objects.get(id=teacher_id)
        course = Course.objects.create(
            teacher=teacher,
            title=title,
            duration=duration_int,
            shift=shift
        )
        return JsonResponse({
            'success': True,
            'message': 'Course added successfully',
            'course_id': course.id
        })
    except Teacher.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Teacher not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@api_login_required
@require_POST
def add_student_class(request):
    try:
        course_id = request.POST.get('course')
        students = request.POST.getlist('student')

        course = Course.objects.get(id=course_id)
        created_count = 0

        for student_id in students:
            student = Student.objects.get(id=student_id)
            StudentClass.objects.create(course=course, student=student)
            created_count += 1

        return JsonResponse({
            'success': True,
            'message': f'{created_count} student(s) assigned to class',
            'created_count': created_count
        })
    except Course.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Course not found'}, status=404)
    except Student.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Student not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ── Authentication API endpoints ────────────────────────────────────────────

@csrf_exempt
def api_login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        data = json.loads(request.body)
        username = data.get('username', '')
        password = data.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            is_teacher = Teacher.objects.filter(user=user).exists()
            return JsonResponse({
                'role': 'admin' if user.is_superuser else 'teacher',
                'username': user.username,
            })
        return JsonResponse({'error': 'Invalid credentials'}, status=401)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def api_logout(request):
    logout(request)
    return JsonResponse({'message': 'Logged out'})


@api_login_required
def api_whoami(request):
    is_teacher = Teacher.objects.filter(user=request.user).exists()
    return JsonResponse({
        'id': request.user.id,
        'username': request.user.username,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'is_superuser': request.user.is_superuser,
        'is_teacher': is_teacher,
        'role': 'admin' if request.user.is_superuser else 'teacher',
    })

@api_login_required
def get_student(request, id):
    student = get_object_or_404(Student, id=id)
    data = {
        'name': student.name,
        'address': student.address,
        'age': student.age,
        'phone_number': student.phone_number
    }
    return JsonResponse(data)

@api_login_required
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

@api_login_required
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

@api_login_required
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

@api_login_required
def get_teacher(request, id):
    teacher = get_object_or_404(Teacher, id=id)
    data = {
        'address': teacher.address,
        'primary_number': teacher.primary_number,
        'secondary_number': teacher.secondary_number,
        'dob': teacher.dob.isoformat() if teacher.dob else None,
        'image_url': teacher.image.url if (teacher.image and teacher.image.name and teacher.image.name != 'NA') else None
    }
    return JsonResponse(data)

@api_login_required
@require_POST
def update_teacher(request):
    try:
        teacher_id = request.POST.get('teacher_id')
        teacher = Teacher.objects.get(id=teacher_id)
        
        # Update teacher details
        teacher.address = request.POST.get('address')
        teacher.primary_number = request.POST.get('primary_number')
        teacher.secondary_number = request.POST.get('secondary_number', '').strip() or None
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

@api_login_required
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

@api_login_required
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
        # Heavy scientific stack — imported here, not at module top, to keep idle RSS
        # low. Same order as before so matplotlib.dates stays reachable via pyplot.
        import pandas as pd
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import matplotlib.dates  # noqa: F401 — used as matplotlib.dates.DateFormatter below
        from scipy import stats

        # Log incoming request data
        print("Received prediction request for student:", student_id)
        print("Request body:", request.body.decode('utf-8'))
        
        # Load the trained model
        try:
            model_path = Path(__file__).resolve().parent.parent.parent / 'ml_models/grade_classifier.pkl'
            with open(model_path, 'rb') as file:
                model = pickle.load(file)
            print("Model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return JsonResponse({
                'error': 'Error loading prediction model',
                'details': str(e)
            }, status=500)

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
        try:
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            image_png = buffer.getvalue()
            buffer.close()
            plt.close()

            # Encode the image
            graphic = base64.b64encode(image_png).decode('utf-8')
        except Exception as e:
            print(f"Error generating plot: {str(e)}")
            return JsonResponse({
                'error': 'Error generating prediction visualization',
                'details': str(e)
            }, status=500)

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
        return JsonResponse({
            'error': 'An unexpected error occurred',
            'details': str(e)
        }, status=500)

@api_login_required
@require_POST
def alter_attendance(request, attendance_id):
    try:
        attendance = get_object_or_404(Attendance, id=attendance_id)
        attendance_data = json.loads(request.body)
        new_stats = attendance_data.get('stats', '')
        attendance.stats = new_stats
        attendance.save()
        return JsonResponse({'message': 'Attendance updated successfully'})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ── JSON API endpoints for Next.js frontend ──────────────────────────────────

@api_login_required
def api_dashboard(request):
    teachers = Teacher.objects.select_related('user').all()
    students = Student.objects.order_by('-id')[:5]
    courses = Course.objects.select_related('teacher', 'teacher__user').all()

    return JsonResponse({
        'teacher_count': teachers.count(),
        'student_count': Student.objects.count(),
        'course_count': courses.count(),
        'teachers': [
            {
                'id': t.id,
                'first_name': t.user.first_name,
                'last_name': t.user.last_name,
                'address': t.address,
                'primary_number': t.primary_number,
                'dob': t.dob.isoformat() if t.dob else None,
                'image_url': t.image.url if (t.image and t.image.name and t.image.name != 'NA') else None,
            }
            for t in teachers
        ],
        'students': [
            {
                'id': s.id,
                'name': s.name,
                'age': s.age,
                'address': s.address,
                'phone_number': s.phone_number,
            }
            for s in students
        ],
        'courses': [
            {
                'id': c.id,
                'title': c.title,
                'teacher_name': c.teacher.user.get_full_name(),
                'duration': c.duration,
                'shift': c.get_shift_display() if hasattr(c, 'get_shift_display') else c.shift,
            }
            for c in courses
        ],
    })


@api_login_required
def api_teachers_list(request):
    teachers = Teacher.objects.select_related('user').all()
    return JsonResponse({
        'teachers': [
            {
                'id': t.id,
                'first_name': t.user.first_name,
                'last_name': t.user.last_name,
                'username': t.user.username,
                'address': t.address,
                'primary_number': t.primary_number,
                'secondary_number': t.secondary_number,
                'dob': t.dob.isoformat() if t.dob else None,
                'sex': t.sex,
                'image_url': t.image.url if (t.image and t.image.name and t.image.name != 'NA') else None,
            }
            for t in teachers
        ]
    })


@api_login_required
def api_students_list(request):
    students = Student.objects.all()
    return JsonResponse({
        'students': [
            {
                'id': s.id,
                'name': s.name,
                'age': s.age,
                'address': s.address,
                'phone_number': s.phone_number,
            }
            for s in students
        ]
    })


@api_login_required
def api_courses_list(request):
    courses = Course.objects.select_related('teacher', 'teacher__user').all()
    return JsonResponse({
        'courses': [
            {
                'id': c.id,
                'title': c.title,
                'teacher_id': c.teacher.id,
                'teacher_name': c.teacher.user.get_full_name(),
                'duration': c.duration,
                'shift': c.shift,
                'shift_display': c.get_shift_display() if hasattr(c, 'get_shift_display') else c.shift,
            }
            for c in courses
        ]
    })


@api_login_required
def api_teacher_courses(request):
    """Courses assigned to the logged-in teacher."""
    try:
        teacher = request.user.teacher
    except Teacher.DoesNotExist:
        return JsonResponse({'error': 'Not a teacher'}, status=403)

    courses = Course.objects.filter(teacher=teacher).annotate(
        student_count=Count('studentclass')
    )
    return JsonResponse({
        'courses': [
            {
                'id': c.id,
                'title': c.title,
                'duration': c.duration,
                'shift': c.shift,
                'shift_display': c.get_shift_display() if hasattr(c, 'get_shift_display') else c.shift,
                'student_count': c.student_count,
            }
            for c in courses
        ]
    })


@api_login_required
def api_teacher_profile(request):
    try:
        teacher = request.user.teacher
    except Teacher.DoesNotExist:
        return JsonResponse({'error': 'Not a teacher'}, status=403)

    return JsonResponse({
        'id': teacher.id,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'username': request.user.username,
        'email': request.user.email,
        'address': teacher.address,
        'primary_number': teacher.primary_number,
        'secondary_number': teacher.secondary_number,
        'dob': teacher.dob.isoformat() if teacher.dob else None,
        'sex': teacher.sex,
        'image_url': teacher.image.url if (teacher.image and teacher.image.name and teacher.image.name != 'NA') else None,
    })


@api_login_required
def api_attendance_data(request, course_id):
    """Students enrolled in a course + their past attendance."""
    course = get_object_or_404(Course, id=course_id)
    student_classes = StudentClass.objects.filter(course=course).select_related('student')
    students = [sc.student for sc in student_classes]
    attendance_records = Attendance.objects.filter(course=course).select_related('student')

    past = {}
    for a in attendance_records:
        past.setdefault(a.student.id, []).append({
            'date': a.today_date.isoformat(),
            'status': a.stats,
        })

    return JsonResponse({
        'course': {
            'id': course.id,
            'title': course.title,
            'shift': course.shift,
            'shift_display': course.get_shift_display() if hasattr(course, 'get_shift_display') else course.shift,
        },
        'students': [
            {
                'id': s.id,
                'name': s.name,
                'past_attendance': past.get(s.id, []),
            }
            for s in students
        ],
    })


@api_login_required
def api_users_list(request):
    users = User.objects.exclude(is_superuser=True)
    return JsonResponse({
        'users': [
            {'id': u.id, 'username': u.username, 'first_name': u.first_name, 'last_name': u.last_name}
            for u in users
        ]
    })


@api_login_required
def api_attendance_record(request, attendance_id):
    attendance = get_object_or_404(Attendance, id=attendance_id)
    return JsonResponse({
        'id': attendance.id,
        'student_name': attendance.student.name,
        'student_id': attendance.student.id,
        'course_title': attendance.course.title,
        'date': attendance.today_date.isoformat(),
        'status': attendance.stats,
    })


@api_login_required
def api_teacher_details(request, teacher_id):
    teacher = get_object_or_404(Teacher.objects.select_related('user'), id=teacher_id)
    courses = Course.objects.filter(teacher=teacher)
    course_data = []
    for course in courses:
        student_count = StudentClass.objects.filter(course=course).count()
        attendance_records = Attendance.objects.filter(course=course)
        attendance_count = attendance_records.count()
        present_count = attendance_records.filter(stats='P').count()
        attendance_percentage = (
            round(present_count / attendance_count * 100, 1) if attendance_count > 0 else 0
        )
        course_data.append({
            'id': course.id,
            'title': course.title,
            'student_count': student_count,
            'attendance_count': attendance_count,
            'attendance_percentage': attendance_percentage,
        })
    return JsonResponse({
        'teacher': {
            'id': teacher.id,
            'first_name': teacher.user.first_name,
            'last_name': teacher.user.last_name,
            'address': teacher.address,
            'primary_number': teacher.primary_number,
            'dob': teacher.dob.isoformat() if teacher.dob else None,
            'image_url': teacher.image.url if (teacher.image and teacher.image.name and teacher.image.name != 'NA') else None,
        },
        'courses': course_data,
    })


@api_login_required
def api_review_attendance(request):
    attendance_records = Attendance.objects.select_related('student', 'course').order_by('-today_date')
    return JsonResponse({
        'records': [
            {
                'id': a.id,
                'date': a.today_date.isoformat(),
                'student_name': a.student.name,
                'course_title': a.course.title,
                'status': a.stats,
            }
            for a in attendance_records
        ]
    })


# ── Course Management API ────────────────────────────────────────────────────

@api_login_required
@require_POST
def delete_course(request, id):
    try:
        course = Course.objects.get(id=id)
        course.delete()
        return JsonResponse({'success': True, 'message': 'Course deleted successfully'})
    except Course.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Course not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@api_login_required
def api_classes_list(request):
    classes = StudentClass.objects.select_related('student', 'course').all()
    return JsonResponse({
        'classes': [
            {
                'id': sc.id,
                'student_id': sc.student.id,
                'student_name': sc.student.name,
                'course_id': sc.course.id,
                'course_title': sc.course.title,
            }
            for sc in classes
        ]
    })


@api_login_required
@require_POST
def delete_class(request, id):
    try:
        student_class = StudentClass.objects.get(id=id)
        student_class.delete()
        return JsonResponse({'success': True, 'message': 'Student removed from class successfully'})
    except StudentClass.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Class enrollment not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@api_login_required
@require_POST
def register_user(request):
    first_name = request.POST.get('first_name', '').strip()
    last_name = request.POST.get('last_name', '').strip()
    username = request.POST.get('username', '').strip()
    email = request.POST.get('email', '').strip()
    password1 = request.POST.get('password1', '')
    password2 = request.POST.get('password2', '')

    if not all([first_name, last_name, username, email, password1, password2]):
        return JsonResponse({'success': False, 'error': 'All fields are required'}, status=400)

    # Password validation
    if len(password1) < 8:
        return JsonResponse({'success': False, 'error': 'Password must be at least 8 characters'}, status=400)
    if password1 != password2:
        return JsonResponse({'success': False, 'error': 'Passwords do not match'}, status=400)
    if not any(c.isupper() for c in password1):
        return JsonResponse({'success': False, 'error': 'Password must contain at least one uppercase letter'}, status=400)
    if not any(c.isdigit() for c in password1):
        return JsonResponse({'success': False, 'error': 'Password must contain at least one digit'}, status=400)

    # Username/Email validation
    if len(username) < 3:
        return JsonResponse({'success': False, 'error': 'Username must be at least 3 characters'}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({'success': False, 'error': f'Username {username} already exists'}, status=400)
    if User.objects.filter(email=email).exists():
        return JsonResponse({'success': False, 'error': 'Email already registered'}, status=400)
    if '@' not in email or '.' not in email.split('@')[1]:
        return JsonResponse({'success': False, 'error': 'Invalid email address'}, status=400)

    try:
        User.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            username=username,
            email=email,
            password=password1,
        )
        return JsonResponse({'success': True, 'message': 'User registered successfully'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@api_login_required
@require_POST
def add_teacher(request):
    user_id = request.POST.get('teacher', '').strip()
    address = request.POST.get('address', '').strip()
    primary_number = request.POST.get('primary_number', '').strip()
    secondary_number = request.POST.get('secondary_number', '').strip() or None
    dob = request.POST.get('dob', '').strip()
    sex = request.POST.get('sex', 'M').strip()
    my_image = request.FILES.get('my_image')

    if not all([user_id, address, primary_number, dob]):
        return JsonResponse({'success': False, 'error': 'Required fields are missing'}, status=400)

    try:
        user = User.objects.get(id=int(user_id))
    except User.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)

    if Teacher.objects.filter(user=user).exists():
        return JsonResponse({'success': False, 'error': f'Teacher profile for {user.username} already exists'}, status=400)

    # Validate file upload if provided
    if my_image:
        # Check file size (max 2MB)
        if my_image.size > 2 * 1024 * 1024:
            return JsonResponse({'success': False, 'error': 'File size must be less than 2MB'}, status=400)
        # Check MIME type (images only)
        allowed_mimes = {'image/jpeg', 'image/png', 'image/gif', 'image/webp'}
        if my_image.content_type not in allowed_mimes:
            return JsonResponse({'success': False, 'error': f'Invalid file type. Allowed: {", ".join(allowed_mimes)}'}, status=400)

    try:
        Teacher.objects.create(
            user=user,
            address=address,
            dob=dob,
            primary_number=primary_number,
            secondary_number=secondary_number,
            sex=sex,
            image=my_image,
        )
        return JsonResponse({'success': True, 'message': 'Teacher registered successfully'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)