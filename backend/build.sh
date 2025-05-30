#!/bin/bash
python manage.py collectstatic --noinput
python manage.py migrate
gunicorn mpa_project.wsgi:application --bind 0.0.0.0:$PORT
