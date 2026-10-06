// Configuración de producción (ng build). No guardes claves reales en este archivo si vas a subirlo a Git.
export const environment = {
  production: true,
  // Misma URL relativa: Django sirve el frontend compilado junto a la API. Si despliegas el frontend
  // aparte (p. ej. en Vercel), pon aquí la URL absoluta del backend.
  apiUrl: '/api',
  // Proyecto de Supabase de incidencias, horario y notas (Project Settings > API en supabase.com):
  // la URL del proyecto y la clave "anon public". Vacíos, esos módulos muestran un error de configuración.
  supabaseUrl: '',
  supabaseAnonKey: ''
};
