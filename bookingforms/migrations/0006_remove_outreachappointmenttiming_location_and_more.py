# Generated by Django 4.1.2 on 2022-10-31 10:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bookingforms', '0005_outreachappointmentlocation_outreach_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='outreachappointmenttiming',
            name='location',
        ),
        migrations.DeleteModel(
            name='OutreachList',
        ),
        migrations.RemoveField(
            model_name='outreachpatientcalldetails',
            name='patient',
        ),
        migrations.DeleteModel(
            name='OutreachAppointmentLocation',
        ),
        migrations.DeleteModel(
            name='OutreachAppointmentTiming',
        ),
        migrations.DeleteModel(
            name='OutreachPatient',
        ),
        migrations.DeleteModel(
            name='OutreachPatientCallDetails',
        ),
    ]
