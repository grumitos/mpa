#!/bin/bash
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py create_superuser_auto
gunicorn mpa_project.wsgi:application --bind 0.0.0.0:$PORT
