python manage.py makemigrations 
python manage.py migrate 

export LANG=C.UTF-8

celery -A config worker -l info --without-gossip --without-mingle --without-heartbeat -Ofair --pool=solo -B --detach
celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler --detach