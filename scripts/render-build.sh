#!/usr/bin/env bash
# Render, fase de build: instala las dependencias del backend y prepara estáticos y base de datos.
# Se puede ejecutar desde cualquier carpeta: trabaja siempre sobre backend/.
set -o errexit

cd "$(dirname "$0")/../backend"

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
