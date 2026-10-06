from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from api.models import Usuario
from api.tests.support import fast_hashers

PASSWORD = 'clave-de-prueba-1'


@fast_hashers
class UsuarioApiTests(APITestCase):
    def setUp(self):
        self.admin = Usuario.objects.create_superuser(email='root@example.com', password=PASSWORD)

    def authenticate(self):
        token = Token.objects.create(user=self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def test_anonymous_requests_are_rejected(self):
        response = self.client.get('/api/usuarios/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_list_never_exposes_passwords(self):
        self.authenticate()

        response = self.client.get('/api/usuarios/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertNotIn('password', response.data[0])

    def test_create_hashes_the_password_and_hides_it(self):
        self.authenticate()
        payload = {
            'email': 'alumno@example.com',
            'username': 'alumno',
            'password': PASSWORD,
            'rol': 'alumno',
        }

        response = self.client.post('/api/usuarios/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('password', response.data)
        created = Usuario.objects.get(email='alumno@example.com')
        self.assertNotEqual(created.password, PASSWORD)
        self.assertTrue(created.check_password(PASSWORD))
        self.assertEqual(created.rol, 'alumno')

    def test_create_accepts_form_encoded_data(self):
        self.authenticate()
        payload = {'email': 'padre@example.com', 'username': 'padre', 'password': PASSWORD}

        response = self.client.post('/api/usuarios/', payload, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Usuario.objects.get(email='padre@example.com').check_password(PASSWORD))

    def test_create_rejects_a_duplicate_email(self):
        self.authenticate()
        payload = {'email': 'root@example.com', 'username': 'otro', 'password': PASSWORD}

        response = self.client.post('/api/usuarios/', payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
