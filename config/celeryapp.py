import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.conf.beat_schedule = {
    'loa_checker':{
        'task':'covidtestlogin.tasks.loa_check',
        'schedule': crontab(minute=00, hour=10),
    },
    'monday_add':{
        'task':'covidtestlogin.tasks.monday_employee_add',
        'schedule': crontab(minute=00, hour=11, day_of_week='monday'),
    },
    'tuesday_add':{
        'task':'covidtestlogin.tasks.tuesday_employee_add',
        'schedule': crontab(minute=00, hour=11, day_of_week='tuesday'),
    },
    'wednesday_add':{
        'task':'covidtestlogin.tasks.wednesday_employee_add',
        'schedule': crontab(minute=00, hour=11, day_of_week='wednesday'),
    },
    'thursday_add':{
        'task':'covidtestlogin.tasks.thursday_employee_add',
        'schedule': crontab(minute=00, hour=11, day_of_week='thursday'),
    },
    'wednesday_booster_add':{
        'task':'covidtestlogin.tasks.wednesday_booster_employee_add',
        'schedule': crontab(minute=30, hour=11, day_of_week='wednesday'),
    },
}
app.autodiscover_tasks()