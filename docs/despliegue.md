# Despliegue

El proyecto se desplegó con el backend en Render y el frontend en Vercel. Los scripts y la
configuración que se usaron siguen en el repositorio; esta guía resume cómo conectarlos. La
configuración se pasa por variables de entorno, así que no hay que editar código para cambiar de
servidor (salvo `apiUrl` en el frontend).

## Backend en Render

Servicio web de Python con estos comandos, ejecutados desde la raíz del repositorio:

| Fase | Comando |
| --- | --- |
| Build | `bash scripts/render-build.sh` |
| Start | `bash scripts/render-start.sh` |

Variables de entorno:

| Variable | Valor |
| --- | --- |
| `SECRET_KEY` | clave secreta de Django, larga y aleatoria (obligatoria con `DEBUG=False`) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | el dominio del servicio, p. ej. `mi-servicio.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | el origen del frontend, p. ej. `https://mi-frontend.vercel.app` |
| `DJANGO_SUPERUSER_EMAIL` y `DJANGO_SUPERUSER_PASSWORD` | credenciales del administrador que se crea al arrancar |

La base de datos es SQLite (`backend/db.sqlite3`); en un servicio con disco efímero se vacía en cada
despliegue.

## Frontend en Vercel

`frontend/vercel.json` define el comando de build (`ng build mpa`), la carpeta de salida
(`dist/mpa/browser`) y la reescritura de todas las rutas a `index.html`, necesaria porque Angular
resuelve las rutas en el navegador. Configura `frontend` como directorio raíz del proyecto.

Antes de compilar, en `frontend/src/environments/environment.prod.ts`:

- `apiUrl`: la URL absoluta del backend, con el sufijo `/api`.
- `supabaseUrl` y `supabaseAnonKey`: los valores de tu proyecto de Supabase.

Las claves quedan dentro del código compilado: usa solo la clave pública `anon` y protege las tablas
con políticas de seguridad por filas (RLS) en Supabase.
