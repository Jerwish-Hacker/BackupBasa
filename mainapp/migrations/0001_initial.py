# Generated by Django 3.1.5 on 2022-10-06 11:26

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Apps',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('app_name', models.CharField(max_length=200, verbose_name='App Name')),
                ('app_type', models.CharField(max_length=200, verbose_name='App Type')),
                ('point_of_contact', models.CharField(blank=True, max_length=200, null=True, verbose_name='Point of Contact')),
                ('domain_name', models.CharField(blank=True, max_length=200, null=True, verbose_name='Domain Name')),
                ('info_text', models.TextField(blank=True, null=True, verbose_name='Info Text')),
                ('is_hidden', models.BooleanField(default=False, verbose_name='Is Hidden')),
                ('app_logo', models.FileField(blank=True, null=True, upload_to='media/uploads/na3ohXaeOhleeng7/', verbose_name='App Logo')),
                ('modified_by', models.CharField(blank=True, max_length=200, null=True, verbose_name='Modified By')),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('modified_datetime', models.DateTimeField(auto_now=True)),
                ('subscription', models.IntegerField(default=-1)),
                ('tenant_app_id', models.IntegerField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'App',
                'verbose_name_plural': 'Apps',
            },
        ),
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Location')),
            ],
        ),
        migrations.CreateModel(
            name='OrganisationSSO',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('client_id', models.CharField(max_length=200, verbose_name='Client ID')),
                ('secret_id', models.CharField(max_length=200, verbose_name='Secret ID')),
                ('tenant_id', models.CharField(max_length=200, verbose_name='Tenant ID')),
            ],
        ),
        migrations.CreateModel(
            name='UserAssignedLocations',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('app', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mainapp.apps')),
                ('location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mainapp.location')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='PasswordResetOTP',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('otp', models.CharField(blank=True, max_length=100, null=True, verbose_name='OTP')),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='FavouriteApps',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('app', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='mainapp.apps')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Favourite App',
                'verbose_name_plural': 'Favourite Apps',
            },
        ),
        migrations.CreateModel(
            name='AppsButtons',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('button_text', models.CharField(max_length=200, verbose_name='Button Text')),
                ('button_href', models.CharField(blank=True, max_length=200, null=True, verbose_name='Button href')),
                ('modified_by', models.CharField(blank=True, max_length=200, null=True, verbose_name='Modified By')),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('modified_datetime', models.DateTimeField(auto_now=True)),
                ('tenant_button_id', models.IntegerField(blank=True, null=True)),
                ('app', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mainapp.apps')),
            ],
            options={
                'verbose_name': 'App Button',
                'verbose_name_plural': 'App Buttons',
            },
        ),
        migrations.CreateModel(
            name='AppOrdering',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.CharField(blank=True, max_length=200, null=True, verbose_name='Order')),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('app', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mainapp.apps')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'App Ordering',
                'verbose_name_plural': 'Apps Ordering',
            },
        ),
        migrations.CreateModel(
            name='AppLocation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('app', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mainapp.apps')),
                ('location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mainapp.location')),
            ],
        ),
        migrations.CreateModel(
            name='AppAdmins',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('app', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mainapp.apps')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='AppAccessData',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('app_name', models.CharField(max_length=200, verbose_name='App Name')),
                ('app_specific_page_name', models.CharField(max_length=200, verbose_name='App Specific Page Name')),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'App Access Data',
                'verbose_name_plural': 'App Access Datas',
            },
        ),
    ]
