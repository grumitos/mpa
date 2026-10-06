from django.test import TestCase

from api.models import Usuario
from api.tests.support import fast_hashers


@fast_hashers
class UsuarioManagerTests(TestCase):
    def test_create_user_uses_email_as_username_by_default(self):
        user = Usuario.objects.create_user(email='ana@example.com', password='clave-de-prueba-1')

        self.assertEqual(user.username, 'ana@example.com')
        self.assertTrue(user.check_password('clave-de-prueba-1'))
        self.assertFalse(user.is_staff)

    def test_create_user_normalizes_the_email_domain(self):
        user = Usuario.objects.create_user(email='ana@EXAMPLE.COM', password='clave-de-prueba-1')

        self.assertEqual(user.email, 'ana@example.com')

    def test_create_user_requires_an_email(self):
        with self.assertRaises(ValueError):
            Usuario.objects.create_user(email='', password='clave-de-prueba-1')

    def test_create_superuser_sets_admin_flags(self):
        user = Usuario.objects.create_superuser(email='root@example.com', password='clave-de-prueba-1')

        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertEqual(user.rol, 'admin')

    def test_create_superuser_rejects_a_non_staff_flag(self):
        with self.assertRaises(ValueError):
            Usuario.objects.create_superuser(
                email='root@example.com', password='clave-de-prueba-1', is_staff=False
            )

    def test_string_representation_is_the_email(self):
        user = Usuario.objects.create_user(email='ana@example.com', password='clave-de-prueba-1')

        self.assertEqual(str(user), 'ana@example.com')
