# Supabase

Incidencias, horario y notas no pasan por el backend de Django: el navegador las lee y escribe
directamente en un proyecto de [Supabase](https://supabase.com) mediante `@supabase/supabase-js`
(`frontend/src/app/services/supabase.service.ts`). El repositorio no incluye ninguna clave: sin
configurar, incidencias y horario salen vacíos, notas muestra un aviso (el motivo queda en la
consola del navegador) y el resto de la app funciona igual.

## Configurar el frontend

1. Crea un proyecto en Supabase y copia, desde *Project Settings > API*, la **URL del proyecto** y
   la clave **anon public**.
2. Pégalas en `frontend/src/environments/environment.prod.ts` (la que usa `run.bat`) y, si vas a
   usar `npm start`, también en `environment.ts`:

   ```ts
   supabaseUrl: 'https://<tu-proyecto>.supabase.co',
   supabaseAnonKey: '<clave anon public>',
   ```

3. Vuelve a compilar con `run.bat --rebuild` (los valores quedan dentro del código compilado).

Usa únicamente la clave `anon`; la clave `service_role` da acceso total y nunca debe ir en el
frontend. No subas a Git los archivos de entorno con tus valores reales.

## Tablas

El esquema se dedujo del código del servicio (cada tabla usa las columnas que lee y escribe). Ejecuta
este SQL en el editor de Supabase:

```sql
create table incidencias (
  id bigint generated always as identity primary key,
  titulo text not null,
  tipo_incidencia text not null,
  alumnos_implicados text not null,
  profesor_reporta text not null,
  nivel_urgencia text not null,
  lugar_suceso text not null,
  descripcion text not null,
  fecha_hora timestamptz not null,
  estado text not null default 'Pendiente',
  adjuntos text default '[]',
  fecha_reporte timestamptz not null default now(),
  fecha_modificacion timestamptz
);

create table horario (
  id bigint generated always as identity primary key,
  dia text not null,
  hora_inicio text not null,
  hora_fin text not null,
  materia text not null,
  aula text not null
);

create table notas (
  id bigint generated always as identity primary key,
  estudiante_id text not null,
  estudiante_nombre text,
  curso text not null,
  asignatura text not null,
  periodo text not null,
  evaluacion1 numeric,
  evaluacion2 numeric,
  evaluacion_final_examen numeric,
  nota_final_calculada numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

`hora_inicio` y `hora_fin` guardan texto `HH:MM`, como lo envía el selector de hora. Las notas van de 0
a 20; la nota final se calcula en el navegador como 30 % + 30 % + 40 % de las tres evaluaciones.

## Seguridad

La app no inicia sesión en Supabase: todas las peticiones llegan con el rol `anon`. Para que
funcionen hay que activar la seguridad por filas (RLS) con políticas que permitan a ese rol leer y
escribir esas tablas, y entonces cualquiera que tenga la URL y la clave (están en el código
compilado) puede leer y modificar los datos. Con datos reales de alumnos, añade autenticación de
Supabase y políticas por usuario antes de exponer el proyecto.
