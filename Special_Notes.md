Server Start : `daphne -b 127.0.0.1 -p 8000 AMS.asgi:application`

Students List To Be Added For Prediction

- Akshay Kumar
- Alia Bhatt
- Amitabh Bachchan
- Anushka Sharma
- Hrithik Roshan
- Priyanka Chopra
- Virat Kohli

Copy the `list` from Seed.py

Navigate to the project running directory.

Run : `python manage.py shell`

Run : `from auth_app.models import Student`

Run :

```Python
students_data = [
    {"name": "Akshay Kumar", "address": "Mumbai, MH", "age": 27, "phone_number": "9876543210"},
    {"name": "Alia Bhatt", "address": "Juhu, Mumbai", "age": 24, "phone_number": "9876543211"},
    {"name": "Amitabh Bachchan", "address": "Jalsa, Mumbai", "age": 30, "phone_number": "9876543212"},
    {"name": "Anushka Sharma", "address": "Versova, Mumbai", "age": 26, "phone_number": "9876543213"},
    {"name": "Hrithik Roshan", "address": "Andheri West, Mumbai", "age": 29, "phone_number": "9876543214"},
    {"name": "Priyanka Chopra", "address": "Bandra, Mumbai", "age": 28, "phone_number": "9876543215"},
    {"name": "Virat Kohli", "address": "Worli, Mumbai", "age": 25, "phone_number": "9876543216"},
]
```

Run :

```Python
for data in students_data:
    Student.objects.get_or_create(phone_number=data["phone_number"], defaults=data)
```
