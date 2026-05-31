import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='teacher',
            name='secondary_number',
            field=models.CharField(
                blank=True,
                max_length=10,
                null=True,
                unique=True,
                validators=[django.core.validators.MinLengthValidator(10)],
            ),
        ),
    ]
