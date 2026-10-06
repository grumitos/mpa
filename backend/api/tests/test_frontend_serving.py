import tempfile
from pathlib import Path

from django.test import SimpleTestCase, override_settings


class CompiledFrontendTests(SimpleTestCase):
    """Con frontend/dist compilado, Django devuelve index.html para las rutas de Angular."""

    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        (Path(tmp.name) / 'index.html').write_text('<app-root>frontend de prueba</app-root>', encoding='utf-8')
        override = override_settings(FRONTEND_DIST=Path(tmp.name))
        override.enable()
        self.addCleanup(override.disable)

    def read(self, response):
        return b''.join(response.streaming_content).decode('utf-8')

    def test_root_and_angular_routes_return_index_html(self):
        for path in ('/', '/dashboard', '/incidencias', '/gestion-academica'):
            with self.subTest(path=path):
                response = self.client.get(path)

                self.assertEqual(response.status_code, 200)
                self.assertIn('frontend de prueba', self.read(response))
                self.assertEqual(response['Cache-Control'], 'no-cache')

    def test_api_and_admin_keep_their_own_routes(self):
        self.assertEqual(self.client.get('/api/login/').status_code, 405)
        self.assertEqual(self.client.get('/admin/login/').status_code, 200)

    def test_unknown_files_are_not_replaced_by_index_html(self):
        self.assertEqual(self.client.get('/no-existe.js').status_code, 404)


class MissingFrontendTests(SimpleTestCase):
    """Sin compilar, la raíz sigue yendo al admin y el resto de rutas da 404."""

    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        override = override_settings(FRONTEND_DIST=Path(tmp.name) / 'no-compilado')
        override.enable()
        self.addCleanup(override.disable)

    def test_root_redirects_to_the_admin(self):
        response = self.client.get('/')

        self.assertRedirects(response, '/admin/', fetch_redirect_response=False)

    def test_angular_routes_return_404(self):
        self.assertEqual(self.client.get('/dashboard').status_code, 404)
