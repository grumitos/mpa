// Configuración de desarrollo (ng serve). No guardes claves reales en este archivo si vas a subirlo a Git.
export const environment = {
  production: false,
  // API de Django. Debe estar en CORS_ALLOWED_ORIGINS si el frontend se sirve desde otro origen.
  apiUrl: 'http://localhost:8000/api',
  // Proyecto de Supabase de incidencias, horario y notas (Project Settings > API en supabase.com):
  // la URL del proyecto y la clave "anon public". Vacíos, esos módulos muestran un error de configuración.
  supabaseUrl: '',
  supabaseAnonKey: ''
};
