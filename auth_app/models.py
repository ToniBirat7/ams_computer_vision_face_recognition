from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinLengthValidator, MinValueValidator, MaxValueValidator

Gender = [
    ('M', 'Male'),
    ('F', 'Female')
]

shift_choice = [
    ('M', 'Morning'),
    ('D', 'Day')
]

status_choice = [
    ('P', 'Present'),
    ('A', 'Absent')
]

def file_upload(self, filename):
    return f'{self.user.username}_{filename}'

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    address = models.CharField(max_length=30)
    primary_number = models.CharField(max_length=10, validators=[MinLengthValidator(10)],unique=True) 
    secondary_number = models.CharField(max_length=10, validators=[MinLengthValidator(10)],unique=True) 
    dob = models.DateField(null=True,blank=True)
    sex = models.CharField(max_length=1, choices=Gender)
    image = models.ImageField(upload_to=file_upload, null=True, blank=True)

    def __str__(self):
        return self.user.username
    
    class Meta: 
        db_table = 'teacher'
        ordering = ['user']
        verbose_name = 'Teacher'
        constraints = [
            models.UniqueConstraint(fields=['primary_number','secondary_number'], name='unique_primary_number')
        ] 

class Student(models.Model):
    name = models.CharField(max_length=30)
    address = models.CharField(max_length=30)
    age = models.PositiveIntegerField(validators=[
        MinValueValidator(20),
        MaxValueValidator(30)
    ])
    phone_number = models.CharField(max_length=10, validators=[MinLengthValidator(10)],unique=True)

    class Meta:
        verbose_name = 'Student'
        db_table = 'student'
        ordering = ['name']

    def __str__(self):
        return self.name
    
class Course(models.Model):
    title = models.CharField(max_length=100)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    shift = models.CharField(max_length=50)
    duration = models.IntegerField(help_text="Duration in weeks")

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'course'
        ordering = ['title']

class StudentClass(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    def __str__(self):
        return self.student.name

    class Meta:
        db_table = 'student_class'

class Attendance(models.Model):
    today_date = models.DateField(null=False, blank=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    stats = models.CharField(max_length=1, choices=status_choice)

    def __str__(self):
        return self.student.name
    
    class Meta:
        db_table = 'attendance'
