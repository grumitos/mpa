import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno del archivo .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

User = get_user_model()

class Command(BaseCommand):
    help = 'Crear superusuario automáticamente usando variables de entorno'

    def handle(self, *args, **options):
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', email)  # Usar email como username por defecto

        if not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    'Variables de entorno DJANGO_SUPERUSER_EMAIL y DJANGO_SUPERUSER_PASSWORD son requeridas'
                )
            )
            return

        try:
            # Verificar si ya existe un superusuario con este email
            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.WARNING(f'Superusuario con email {email} ya existe')
                )
                return

            # Crear superusuario
            superuser = User.objects.create_superuser(
                email=email,
                password=password,
                username=username
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Superusuario creado exitosamente: {email}')
            )
            
        except IntegrityError as e:
            self.stdout.write(
                self.style.ERROR(f'Error al crear superusuario: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error inesperado: {e}')
            )
