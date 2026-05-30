"""Seed the initial admin superuser and the face-recognition student roster.

Idempotent: safe to run on every container start. The student names MUST match
the labels the face-recognition model was trained on (the folder names under
services/face_recognition/training_data/Face_Data_Cropped), otherwise a
recognised face will not resolve to a Student row and attendance won't be marked.

Run automatically from entrypoint.sh, or manually:

    python manage.py seed
"""

import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import Student

# Trained face-recognition roster. `name` == trained embedding label (exact).
STUDENTS = [
    {"name": "Akshay Kumar",     "address": "Mumbai, MH",           "age": 27, "phone_number": "9876543210"},
    {"name": "Alia Bhatt",       "address": "Juhu, Mumbai",         "age": 24, "phone_number": "9876543211"},
    {"name": "Amitabh Bachchan", "address": "Jalsa, Mumbai",        "age": 30, "phone_number": "9876543212"},
    {"name": "Anushka Sharma",   "address": "Versova, Mumbai",      "age": 26, "phone_number": "9876543213"},
    {"name": "Hrithik Roshan",   "address": "Andheri West, Mumbai", "age": 29, "phone_number": "9876543214"},
    {"name": "Priyanka Chopra",  "address": "Bandra, Mumbai",       "age": 28, "phone_number": "9876543215"},
    {"name": "Virat Kohli",      "address": "Worli, Mumbai",        "age": 25, "phone_number": "9876543216"},
]


class Command(BaseCommand):
    help = "Seed the admin superuser and the trained student roster (idempotent)."

    @transaction.atomic
    def handle(self, *args, **options):
        self._seed_admin()
        self._seed_students()

    def _seed_admin(self):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@bcu.local")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "Admin@1234")

        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "is_staff": True, "is_superuser": True},
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created superuser '{username}'."))
        else:
            self.stdout.write(f"Superuser '{username}' already exists - left unchanged.")

    def _seed_students(self):
        created = 0
        for data in STUDENTS:
            _, was_created = Student.objects.get_or_create(
                phone_number=data["phone_number"], defaults=data,
            )
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(
            f"Students: {created} created, {len(STUDENTS) - created} already present "
            f"({len(STUDENTS)} trained names total)."
        ))
