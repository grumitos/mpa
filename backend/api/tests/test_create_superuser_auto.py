import os
from io import StringIO
from unittest import mock

from django.core.management import call_command
from django.test import TestCase

from api.models import Usuario
from api.tests.support import fast_hashers


@fast_hashers
class CreateSuperuserAutoTests(TestCase):
    def run_command(self, **env):
        """Ejecuta el comando con exactamente estas variables (vacías = ausentes)."""
        values = {
            'DJANGO_SUPERUSER_EMAIL': '',
            'DJANGO_SUPERUSER_PASSWORD': '',
            'DJANGO_SUPERUSER_USERNAME': '',
        }
        values.update(env)
        out = StringIO()
        with mock.patch.dict(os.environ, values):
            call_command('create_superuser_auto', stdout=out)
        return out.getvalue()

    def test_creates_the_superuser_from_the_environment(self):
        output = self.run_command(
            DJANGO_SUPERUSER_EMAIL='root@example.com', DJANGO_SUPERUSER_PASSWORD='clave-de-prueba-1'
        )

        user = Usuario.objects.get(email='root@example.com')
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.check_password('clave-de-prueba-1'))
        self.assertEqual(user.username, 'root@example.com')
        self.assertIn('creado', output)

    def test_uses_the_configured_username(self):
        self.run_command(
            DJANGO_SUPERUSER_EMAIL='root@example.com',
            DJANGO_SUPERUSER_PASSWORD='clave-de-prueba-1',
            DJANGO_SUPERUSER_USERNAME='admin',
        )

        self.assertEqual(Usuario.objects.get(email='root@example.com').username, 'admin')

    def test_running_twice_does_not_duplicate_the_user(self):
        env = {'DJANGO_SUPERUSER_EMAIL': 'root@example.com', 'DJANGO_SUPERUSER_PASSWORD': 'clave-de-prueba-1'}
        self.run_command(**env)

        output = self.run_command(**env)

        self.assertEqual(Usuario.objects.count(), 1)
        self.assertIn('ya existe', output)

    def test_does_nothing_without_credentials(self):
        output = self.run_command()

        self.assertEqual(Usuario.objects.count(), 0)
        self.assertIn('requeridas', output)

    def test_ignores_the_example_password(self):
        self.run_command(DJANGO_SUPERUSER_EMAIL='root@example.com', DJANGO_SUPERUSER_PASSWORD='tu_clave_aqui')

        self.assertEqual(Usuario.objects.count(), 0)
