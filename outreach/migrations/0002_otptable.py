# Generated by Django 4.1.2 on 2022-11-01 12:42

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('outreach', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='OTPTable',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('otp', models.CharField(blank=True, max_length=100, null=True, verbose_name='OTP')),
                ('session', models.CharField(blank=True, max_length=100, null=True, verbose_name='Session')),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'OTP',
                'verbose_name_plural': 'OTP',
            },
        ),
    ]
