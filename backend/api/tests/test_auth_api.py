from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Usuario
from api.tests.support import fast_hashers

PASSWORD = 'clave-de-prueba-1'


@fast_hashers
class LoginTests(APITestCase):
    def setUp(self):
        self.user = Usuario.objects.create_user(email='profe@example.com', password=PASSWORD, rol='profesor')

    def test_login_returns_token_and_user_data(self):
        response = self.client.post('/api/login/', {'email': 'profe@example.com', 'password': PASSWORD})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['token'])
        self.assertEqual(response.data['email'], 'profe@example.com')
        self.assertEqual(response.data['rol'], 'profesor')
        self.assertEqual(response.data['user_id'], self.user.pk)

    def test_login_rejects_a_wrong_password(self):
        response = self.client.post('/api/login/', {'email': 'profe@example.com', 'password': 'otra'})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('token', response.data)

    def test_login_requires_email_and_password(self):
        for payload in ({}, {'email': 'profe@example.com'}, {'password': PASSWORD}):
            with self.subTest(payload=payload):
                response = self.client.post('/api/login/', payload)

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_reuses_the_same_token(self):
        first = self.client.post('/api/login/', {'email': 'profe@example.com', 'password': PASSWORD})
        second = self.client.post('/api/login/', {'email': 'profe@example.com', 'password': PASSWORD})

        self.assertEqual(first.data['token'], second.data['token'])

    def test_token_endpoint_accepts_the_email_as_username(self):
        response = self.client.post(
            '/api/api-token-auth/', {'username': 'profe@example.com', 'password': PASSWORD}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['token'])


@fast_hashers
class TokenAuthenticationTests(APITestCase):
    def setUp(self):
        Usuario.objects.create_user(email='profe@example.com', password=PASSWORD, rol='profesor')

    def login(self):
        response = self.client.post('/api/login/', {'email': 'profe@example.com', 'password': PASSWORD})
        return response.data['token']

    def test_test_auth_rejects_anonymous_requests(self):
        response = self.client.get('/api/test-auth/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_test_auth_accepts_a_valid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.login()}')

        response = self.client.get('/api/test-auth/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user'], 'profe@example.com')
        self.assertEqual(response.data['rol'], 'profesor')

    def test_test_auth_rejects_an_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token no-es-un-token')

        response = self.client.get('/api/test-auth/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
