# Generated by Django 4.1.2 on 2023-01-11 11:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('outreach', '0008_outreachlist_is_published'),
    ]

    operations = [
        migrations.AlterField(
            model_name='outreachpatient',
            name='member',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='outreach.memberpatient'),
        ),
    ]
