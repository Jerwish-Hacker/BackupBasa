# Generated by Django 4.1.2 on 2023-03-02 10:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('covidtestlogin', '0007_vaccinemanagementlist_checkbox_one_file_upload_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='vaccinemanagementlist',
            old_name='file_format',
            new_name='file_type',
        ),
    ]
