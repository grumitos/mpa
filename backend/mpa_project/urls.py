"""
URL configuration for mpa_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.http import FileResponse, Http404
from django.shortcuts import redirect
from django.urls import include, path, re_path
from rest_framework.authtoken.views import obtain_auth_token # Importar la vista de token


def frontend_index(request, *args, **kwargs):
    """Sirve index.html del frontend compilado para que el router de Angular resuelva la ruta.

    Sin compilar (no existe frontend/dist), la raíz sigue yendo al admin y el resto da 404.
    """
    index = settings.FRONTEND_DIST / 'index.html'
    if index.is_file():
        response = FileResponse(open(index, 'rb'), content_type='text/html; charset=utf-8')
        response['Cache-Control'] = 'no-cache'
        return response
    if request.path == '/':
        return redirect('/admin/')
    raise Http404('El frontend no está compilado: ejecuta "npx ng build" en frontend/.')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/api-token-auth/', obtain_auth_token), # Ruta para obtener el token
    path('api/', include('api.urls')), # URLs de la app api
    # Rutas del frontend (/, /dashboard, /incidencias...). Los archivos con extensión (js, css, ico)
    # los sirve WhiteNoise desde la carpeta compilada y no llegan aquí.
    re_path(r'^(?!api/|admin/|static/)[^.]*$', frontend_index),
]
