# Generated by Django 4.1.2 on 2022-12-20 13:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('outreach', '0002_otptable'),
    ]

    operations = [
        migrations.CreateModel(
            name='IngressBlob',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('blob', models.FileField(blank=True, null=True, upload_to='media/uploads/na3ohXaeOhleeng7/')),
            ],
        ),
    ]
