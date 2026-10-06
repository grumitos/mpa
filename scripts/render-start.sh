#!/usr/bin/env bash
# Render, fase de arranque: migra, crea el superusuario desde las variables DJANGO_SUPERUSER_* y
# sirve el backend con gunicorn en el puerto que asigna Render ($PORT).
# Se puede ejecutar desde cualquier carpeta: trabaja siempre sobre backend/.
set -o errexit

cd "$(dirname "$0")/../backend"

python manage.py collectstatic --noinput
python manage.py migrate
python manage.py create_superuser_auto
gunicorn mpa_project.wsgi:application --bind 0.0.0.0:$PORT
