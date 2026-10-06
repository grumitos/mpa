from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import serializers
from .models import Usuario
from .serializers import UsuarioSerializer

class CustomAuthTokenSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        username = attrs.get('username')
        password = attrs.get('password')

        if email:
            username = email
        elif not username:
            msg = 'Debe proporcionar "email" o "username".'
            raise serializers.ValidationError(msg, code='authorization')

        if username and password:
            user = authenticate(request=self.context.get('request'),
                              username=username, password=password)

            if not user:
                msg = 'No se puede autenticar con las credenciales proporcionadas.'
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = 'Debe incluir "password".'
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

class CustomAuthToken(ObtainAuthToken):
    """
    Vista personalizada para autenticación por token que acepta email como username
    """
    serializer_class = CustomAuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'rol': user.rol
        })

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def test_auth(request):
    """
    Vista de prueba para verificar que la autenticación funciona
    """
    return Response({
        'message': 'Autenticación exitosa',
        'user': request.user.email,
        'rol': request.user.rol
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Vista de login completamente personalizada
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            'error': 'Email y password son requeridos'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Autenticar usando email como username
    user = authenticate(request, username=email, password=password)
    
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'rol': user.rol
        })
    else:
        return Response({
            'error': 'Credenciales inválidas'
        }, status=status.HTTP_401_UNAUTHORIZED)
