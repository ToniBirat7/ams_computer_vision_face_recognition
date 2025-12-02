from django import forms
import re
from django.contrib.auth.models import User
from .models import Student, Teacher, Course

class LoginForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={'class' : 'input', 'maxlength' : '100', 'placeholder' : 'Enter Username'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class' : 'input', 'maxlength' : '100', 'placeholder' : 'Enter Password'}))

    # def clean_username(self):
    #     uname = self.cleaned_data.get('username')
    #     if len(uname) <= 5 and ' ' in uname:
    #         raise forms.ValidationError('Username must be more than 5 characters and should not contain spaces')
    #     return uname
    
    # def clean_password(self):
    #     pwd = self.cleaned_data.get('password')
    #     if '$' not in pwd:
    #         raise forms.ValidationError('Password Must Contain $')
    #     return pwd
    
class UserRegistrationForm(forms.Form):
    first_name = forms.CharField(widget=forms.TextInput(attrs={'placeholder' : 'Enter First Name'}))
    last_name = forms.CharField(widget=forms.TextInput(attrs={'placeholder' : 'Enter Last Name'}))
    username = forms.CharField(widget=forms.TextInput(attrs={'placeholder' : 'Enter Username'}))
    email = forms.EmailField(widget=forms.EmailInput(attrs={'placeholder' : 'Enter Email'}))
    password1 = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder' : 'Enter Password'}))
    password2 = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder' : 'Confirm Password'}))

    def clean_first_name(self):
        fname = self.cleaned_data.get('first_name')
        if not fname.isalpha():
            raise forms.ValidationError('First Name should contain only alphabets')
        return fname
    
    def clean_last_name(self):
        lname = self.cleaned_data.get('last_name')
        if not lname.isalpha():
            raise forms.ValidationError('Last Name should contain only alphabets')
        return lname
    
    def clean_username(self):
        uname = self.cleaned_data.get('username')
        if len(uname) <= 5 and ' ' in uname:
            raise forms.ValidationError('Username must be more than 5 characters')
        return uname
    
    def clean_password2(self):
        pswd1 = self.cleaned_data.get('password1')
        pswd2 = self.cleaned_data.get('password2')
        
        if  pswd1 != pswd2:
            raise forms.ValidationError('The Passwords do not match')
        
        return pswd2

    def clean_password1(self):
        pwd1 = self.cleaned_data.get('password1')
        if len(pwd1) < 8:
            raise forms.ValidationError('Password must be more than 8 characters')
        if not re.search('[A-Z]',pwd1):
            raise forms.ValidationError('Password must contain at least 1 uppercase letter')
        if not re.search('[a-z]',pwd1):
            raise forms.ValidationError('Password must contain at least 1 uppercase letter')
        if not re.search('[0-9]',pwd1):
            raise forms.ValidationError('Password must contain at least 1 digit')
        if not re.search('[\W*]',pwd1):
            raise forms.ValidationError('Password must contain at least 1 special character')
        
        return pwd1
    
    def clean(self):
        data = super().clean()
        
        return data 

class TeacherForm(forms.Form):
    teacher = forms.ModelChoiceField(queryset=User.objects.exclude(is_superuser=True), widget=forms.Select(attrs={'class' : 'custom-class'})) 
    address = forms.CharField(widget=forms.TextInput(attrs={'placeholder' : 'Enter Address'}))
    primary_number = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Enter your number','maxlength': '10','minlength': '10'}))
    secondary_number = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Enter your number','maxlength': '10','minlength': '10'}))
    dob = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}))
    sex = forms.ChoiceField(choices=[('M','Male'),('F','Female')],widget=forms.Select(attrs={'class' : 'custom-class'}))
    my_image = forms.ImageField(widget=forms.FileInput(attrs={'class' : 'custom-file-upload', 'style' : 'display:none'}))

    def clean_my_image(self):
        img = self.cleaned_data.get('my_image')
        if img.size > 1024*1024:
            raise forms.ValidationError('Image size should be less than 1MB')
        
        valid_content_types = ['image/jpeg', 'image/png']
        if img.content_type not in valid_content_types:
            raise forms.ValidationError('Image should be in jpg or png format')
        
        return img

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = [
            'name',
            'address',
            'age',
            'phone_number'
        ]
    
        widgets = {
            'name' : forms.TextInput(attrs={'placeholder' : 'Enter Name','class' : 'input-box'}),
            'address' : forms.TextInput(attrs={'placeholder' : 'Enter Address','class' : 'input-box'}),
            'age' : forms.NumberInput(attrs={'placeholder' : 'Enter Age','class' : 'input-box'}),
            'phone_number' : forms.TextInput(attrs={'placeholder' : 'Enter Phone Number','class' : 'input-box'})
        }

    # def clean_name(self):
    #     name = self.cleaned_data.get('name')
    #     if not name.isalpha():
    #         raise forms.ValidationError('First Name should contain only alphabets')
    #     return name
    
    def clean_address(self):
        address = self.cleaned_data.get('address')
        if not address.isalpha():
            raise forms.ValidationError('Address should contain only alphabets')
        return address

class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = [
            'teacher',
            'title',
            'duration',
            'shift'
        ]
        widgets = {
            'teacher' : forms.Select(attrs={'class' : 'custom-class'}),
            'title' : forms.TextInput(attrs={'placeholder' : 'Enter Title'}),
            'duration' : forms.TextInput(attrs={'placeholder' : 'Enter Duration'}),
            'shift' : forms.Select(attrs={'class' : 'custom-class'})
        }
    
    def clean_duration(self):
        duration = self.cleaned_data.get('duration')
        if int(duration) < 0:
            raise forms.ValidationError('Duration should be a positive number')
        return duration


class StudentClassForm(forms.Form):
    student = forms.ModelMultipleChoiceField(
        queryset=Student.objects.all(),
        widget = forms.SelectMultiple(attrs={'class' : 'custom-class select2-multiple'})
    )
    course = forms.ModelChoiceField(
        queryset=Course.objects.all(),
        widget = forms.Select(attrs={'class' : 'custom-class'})
    )


