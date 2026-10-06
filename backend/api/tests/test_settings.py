import importlib.util
import os
from pathlib import Path
from unittest import mock

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase

SETTINGS_PATH = Path(settings.BASE_DIR) / 'mpa_project' / 'settings.py'


def load_settings(**env):
    """Ejecuta una copia de settings.py con un entorno controlado y sin leer el .env real."""
    spec = importlib.util.spec_from_file_location('settings_under_test', SETTINGS_PATH)
    module = importlib.util.module_from_spec(spec)
    with mock.patch.dict(os.environ, env, clear=True), mock.patch('dotenv.load_dotenv'):
        spec.loader.exec_module(module)
    return module


class SecretKeyTests(SimpleTestCase):
    def test_refuses_to_load_without_a_secret_key_outside_debug(self):
        with self.assertRaises(ImproperlyConfigured):
            load_settings()

    def test_refuses_the_example_value_outside_debug(self):
        with self.assertRaises(ImproperlyConfigured):
            load_settings(SECRET_KEY='tu_clave_aqui')

    def test_uses_the_key_from_the_environment(self):
        module = load_settings(SECRET_KEY='  clave-larga-de-prueba  ')

        self.assertEqual(module.SECRET_KEY, 'clave-larga-de-prueba')
        self.assertFalse(module.DEBUG)

    def test_generates_an_ephemeral_key_in_debug(self):
        first = load_settings(DEBUG='True')
        second = load_settings(DEBUG='true')

        self.assertTrue(first.DEBUG)
        self.assertGreaterEqual(len(first.SECRET_KEY), 50)
        self.assertNotEqual(first.SECRET_KEY, second.SECRET_KEY)
        self.assertFalse(first.SECRET_KEY.startswith('django-insecure-'))


class HostListTests(SimpleTestCase):
    def test_defaults_to_local_hosts_and_the_angular_dev_server(self):
        module = load_settings(DEBUG='True')

        self.assertEqual(module.ALLOWED_HOSTS, ['localhost', '127.0.0.1'])
        self.assertEqual(module.CORS_ALLOWED_ORIGINS, ['http://localhost:4200'])

    def test_reads_comma_separated_lists(self):
        module = load_settings(
            DEBUG='True',
            ALLOWED_HOSTS='app.example.com, ,api.example.com',
            CORS_ALLOWED_ORIGINS='https://front.example.com',
        )

        self.assertEqual(module.ALLOWED_HOSTS, ['app.example.com', 'api.example.com'])
        self.assertEqual(module.CORS_ALLOWED_ORIGINS, ['https://front.example.com'])
