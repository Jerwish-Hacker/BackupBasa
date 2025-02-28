# Generated by Django 4.1.2 on 2023-01-10 05:48

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('outreach', '0005_outreachpatient_is_active_outreachpatient_member_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='IngressBlob',
        ),
        migrations.RemoveField(
            model_name='outreachfilters',
            name='age',
        ),
        migrations.AddField(
            model_name='outreachfilters',
            name='age_from',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=250, null=True, verbose_name='From Age List'), default=[1], size=30),
        ),
        migrations.AddField(
            model_name='outreachfilters',
            name='age_to',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=250, null=True, verbose_name='To Age List'), default=[1], size=30),
        ),
    ]
