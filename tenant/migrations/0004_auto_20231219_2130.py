# Generated by Django 3.1.5 on 2023-12-20 02:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tenant', '0003_memberconsenthistory_revoked_by'),
    ]

    operations = [
        migrations.AlterField(
            model_name='memberpatient',
            name='photo',
            field=models.FileField(blank=True, default='media/uploads/na3ohXaeOhleeng7/phone.png', null=True, upload_to='media/uploads/na3ohXaeOhleeng7/', verbose_name='Photo'),
        ),
    ]
