# Generated by Django 4.1.2 on 2022-10-27 04:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bookingforms', '0002_healthplanpatient_outreach'),
    ]

    operations = [
        migrations.CreateModel(
            name='OutreachPatient',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('appointment_type', models.CharField(blank=True, max_length=100, null=True, verbose_name='Appointment Type')),
                ('mrn', models.CharField(blank=True, max_length=50, null=True, verbose_name='MRN')),
                ('first_name', models.CharField(blank=True, max_length=100, null=True, verbose_name='First Name')),
                ('last_name', models.CharField(blank=True, max_length=100, null=True, verbose_name='Last Name')),
                ('date_of_birth', models.DateField(blank=True, null=True, verbose_name='Date of Birth')),
                ('phone_number', models.CharField(blank=True, max_length=100, null=True, verbose_name='Phone Number')),
                ('provider', models.CharField(blank=True, max_length=250, null=True, verbose_name='Provider')),
                ('outreach', models.CharField(blank=True, max_length=100, null=True, verbose_name='Outreach Name')),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('modified_datetime', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Outreach Patient',
                'verbose_name_plural': 'Outreach Patients',
            },
        ),
        migrations.CreateModel(
            name='OutreachPatientCallDetails',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('outreach', models.CharField(blank=True, max_length=100, null=True, verbose_name='Outreach Name')),
                ('out_reach_status', models.CharField(blank=True, max_length=250, null=True, verbose_name='Out Reach Status')),
                ('call_back_date_time', models.DateTimeField(blank=True, null=True, verbose_name='Call Back Date')),
                ('appointment_location', models.CharField(blank=True, max_length=250, null=True, verbose_name='Appointment Location')),
                ('appointment_date', models.DateField(blank=True, null=True, verbose_name='Appointment Date')),
                ('appointment_time', models.CharField(blank=True, max_length=100, null=True, verbose_name='Appointment Time')),
                ('is_accept_text_messages', models.BooleanField(blank=True, default=False, null=True, verbose_name='Is Accept Text Messages?')),
                ('text_message_new_phone_number', models.CharField(blank=True, max_length=100, null=True, verbose_name='Text Message New Phone Number')),
                ('patient_primary_language', models.CharField(blank=True, max_length=100, null=True, verbose_name='Patient Primary Language')),
                ('is_appointment_scheduled_patient_reminded', models.BooleanField(blank=True, default=False, null=True, verbose_name='Is Appointment Scheduled Patient Reminded?')),
                ('appointment_created_by', models.CharField(blank=True, max_length=100, null=True, verbose_name='Appointment Created By')),
                ('appointment_confirmed_by', models.CharField(blank=True, max_length=100, null=True, verbose_name='Appointment Confirmed By')),
                ('appointment_confirmed_datetime', models.DateTimeField(blank=True, null=True, verbose_name='Appointment Confirmed Date Time')),
                ('appointment_cancelation_requested_by', models.CharField(blank=True, max_length=100, null=True, verbose_name='Appointment Cancelation Requested By')),
                ('appointment_cancelation_requested_datetime', models.DateTimeField(blank=True, null=True, verbose_name='Appointment Cancelation Requested Date Time')),
                ('appointment_canceled_by', models.CharField(blank=True, max_length=100, null=True, verbose_name='Appointment Canceled By')),
                ('appointment_canceled_datetime', models.DateTimeField(blank=True, null=True, verbose_name='Appointment Canceled Date Time')),
                ('reason_for_cancelation', models.TextField(blank=True, null=True, verbose_name='Reason for Cancelation')),
                ('is_cancelation_requested_by_csv', models.BooleanField(blank=True, default=False, null=True, verbose_name='Is Cancelation Requested By CSV?')),
                ('comments', models.TextField(blank=True, null=True, verbose_name='Comments')),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('modified_datetime', models.DateTimeField(auto_now=True)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='bookingforms.outreachpatient')),
            ],
            options={
                'verbose_name': 'Outreach Patient Call Detail',
                'verbose_name_plural': 'Outreach Patient Call Details',
            },
        ),
    ]
