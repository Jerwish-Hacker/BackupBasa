# Generated by Django 3.1.5 on 2022-10-07 05:44

from django.db import migrations, models
import django.db.models.deletion
import django_tenants.postgresql_backend.base


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('mainapp', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('schema_name', models.CharField(db_index=True, max_length=63, unique=True, validators=[django_tenants.postgresql_backend.base._check_schema_name])),
                ('admin_user', models.CharField(max_length=100, verbose_name='Admin User')),
                ('name', models.CharField(max_length=100, verbose_name='Organisation Name')),
                ('paid_until', models.DateField(verbose_name='Paid Until')),
                ('on_trial', models.BooleanField(verbose_name='On Trail ?')),
                ('created_on', models.DateField(auto_now_add=True)),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('subscription', models.IntegerField(default=0, verbose_name='Subscription')),
                ('status', models.BooleanField(default=True, verbose_name='Status')),
                ('logo', models.ImageField(blank=True, null=True, upload_to='media/uploads/na3ohXaeOhleeng7/')),
                ('title_logo', models.ImageField(blank=True, null=True, upload_to='media/uploads/na3ohXaeOhleeng7/')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Domain',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('domain', models.CharField(db_index=True, max_length=253, unique=True)),
                ('is_primary', models.BooleanField(db_index=True, default=True)),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='domains', to='tenant.client')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='AppPermissionGroups',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('group_name', models.CharField(max_length=100, verbose_name='Group Name')),
                ('subscription', models.IntegerField(default=0, verbose_name='Subscription')),
                ('app_name', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mainapp.apps')),
            ],
        ),
    ]
