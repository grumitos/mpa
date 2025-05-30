from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views

router = DefaultRouter()
router.register(r'usuarios', views.UsuarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('api-token-auth/', views.CustomAuthToken.as_view(), name='api_token_auth'),
    path('login/', views.login_view, name='login'),
    path('test-auth/', views.test_auth, name='test_auth'),
]
