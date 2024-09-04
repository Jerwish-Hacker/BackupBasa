# Generated by Django 4.1.2 on 2023-01-19 11:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mainapp', '0005_alter_apps_app_logo'),
        ('outreach', '0009_alter_outreachpatient_member'),
    ]

    operations = [
        migrations.AlterField(
            model_name='outreachappointmenttiming',
            name='location',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mainapp.location'),
        ),
        migrations.AlterField(
            model_name='outreachpatient',
            name='outreach',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='outreach.outreachlist'),
        ),
        migrations.DeleteModel(
            name='OutreachAppointmentLocation',
        ),
    ]
