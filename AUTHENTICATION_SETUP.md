# MPA Project - Configuración de Autenticación

## Problema Resuelto

El error original se debía a que en `api/urls.py` se estaba referenciando `views.CustomAuthToken` que no existía en el archivo `views.py`.

## Solución Implementada

### 1. Backend (Django)

#### Vistas de Autenticación Creadas:
- `CustomAuthToken`: Vista que hereda de `ObtainAuthToken` con serializer personalizado
- `login_view`: Vista completamente personalizada que acepta email/password
- `test_auth`: Vista de prueba para verificar autenticación

#### Endpoints Disponibles:
- `POST /api/login/` - Login con email y password (recomendado)
- `POST /api/api-token-auth/` - Login con serializer personalizado
- `GET /api/test-auth/` - Prueba de autenticación (requiere token)

#### Comando de Creación de Superusuario:
Se creó el comando `create_superuser_auto.py` que utiliza las variables de entorno:
- `DJANGO_SUPERUSER_EMAIL`
- `DJANGO_SUPERUSER_PASSWORD`
- `DJANGO_SUPERUSER_USERNAME` (opcional, usa email por defecto)

### 2. Frontend (Angular)

#### Actualizaciones en AuthService:
- Método `login()` que se conecta con `/api/login/`
- Manejo de tokens en localStorage y sessionStorage
- Subject para estado del usuario actual
- Métodos para obtener usuario y rol actual

#### Actualizaciones en Login Component:
- Cambio de `username` a `email` en el formulario
- Indicador de carga durante login
- Mejor manejo de errores

### 3. Configuración de Despliegue

#### Variables de Entorno para Render:
```
DJANGO_SUPERUSER_EMAIL=tu_email@ejemplo.com
DJANGO_SUPERUSER_PASSWORD=tu_password_seguro
DJANGO_SUPERUSER_USERNAME=admin
```

#### Build Script Actualizado:
```bash
#!/bin/bash
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py create_superuser_auto
gunicorn mpa_project.wsgi:application --bind 0.0.0.0:$PORT
```

## Cómo Usar

### Desarrollo Local:
1. Ejecutar `python manage.py runserver` en el backend
2. Ejecutar `npm start` en el frontend
3. Usar credenciales: email: `admin@test.com`, password: `REDACTED_PASSWORD`

### Producción en Render:
1. Configurar las variables de entorno en Render
2. El build script automáticamente creará el superusuario
3. Usar las credenciales configuradas en las variables de entorno

## Pruebas de API

### Login exitoso:
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"REDACTED_PASSWORD"}'
```

### Respuesta esperada:
```json
{
  "token": "REDACTED_API_TOKEN",
  "user_id": 2,
  "email": "admin@test.com",
  "rol": "admin"
}
```

### Prueba de autenticación:
```bash
curl -X GET http://localhost:8000/api/test-auth/ \
  -H "Authorization: Token REDACTED_API_TOKEN"
```
