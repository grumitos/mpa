# Autenticación

El backend de Django emite un token de Django REST Framework y el frontend de Angular lo guarda y
lo envía en cada petición a la API.

## Flujo

1. `LoginComponent` llama a `AuthService.login(email, contraseña, recordarme)`, que hace
   `POST {apiUrl}/login/`.
2. La respuesta trae `token`, `user_id`, `email` y `rol`. `AuthService` guarda el token y los datos
   del usuario en `localStorage` si se marcó "Recordarme" y en `sessionStorage` si no.
3. `AuthInterceptor` añade `Authorization: Token <token>` a las peticiones cuya URL empieza por
   `environment.apiUrl`.
4. `AuthGuard` protege las rutas internas (sin token redirige al login) y `GuestGuard` envía al
   dashboard a quien ya inició sesión.
5. Cerrar sesión borra el token de ambos almacenes y vuelve al login.

El modelo de usuario (`api.Usuario`) se identifica por el correo (`USERNAME_FIELD = 'email'`).

## Endpoints

| Método y ruta | Autenticación | Descripción |
| --- | --- | --- |
| `POST /api/login/` | ninguna | recibe `email` y `password`; devuelve `token`, `user_id`, `email` y `rol` (401 si las credenciales no son válidas, 400 si falta alguna) |
| `POST /api/api-token-auth/` | ninguna | vista estándar de DRF: recibe `username` (el correo) y `password`; devuelve solo el `token` |
| `GET /api/test-auth/` | token | comprueba que el token es válido; devuelve el correo y el rol |
| `/api/usuarios/` | token | CRUD de usuarios (`UsuarioViewSet`); la contraseña solo se escribe y se guarda cifrada |
| `/admin/` | sesión | panel de administración de Django |

## Superusuario

El comando `python manage.py create_superuser_auto` crea el administrador con las variables
`DJANGO_SUPERUSER_EMAIL`, `DJANGO_SUPERUSER_PASSWORD` y, opcionalmente, `DJANGO_SUPERUSER_USERNAME`
(por defecto, el correo). No hace nada si faltan, si la contraseña sigue siendo el valor de ejemplo
`tu_clave_aqui` o si ya existe un usuario con ese correo. `scripts/render-start.sh` lo ejecuta en
Render.

## Probar la API

```bat
curl -X POST http://localhost:8000/api/login/ -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"<tu contraseña>\"}"
curl http://localhost:8000/api/test-auth/ -H "Authorization: Token <token de la respuesta anterior>"
```

## Roles

`Usuario.rol` admite `admin` (valor por defecto), `profesor`, `padre` y `alumno`, y el superusuario
creado por el comando es `admin`. El rol viaja en la respuesta del login y `AuthService` lo expone,
pero la interfaz todavía no lo usa para ocultar vistas ni restringir acciones.
