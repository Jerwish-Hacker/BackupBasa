# Generated by Django 4.1.2 on 2023-01-18 05:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainapp', '0004_alter_apps_app_logo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='apps',
            name='app_logo',
            field=models.FileField(blank=True, default='media/uploads/na3ohXaeOhleeng7/phone.png', null=True, upload_to='media/uploads/na3ohXaeOhleeng7/', verbose_name='App Logo'),
        ),
    ]
