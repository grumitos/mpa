// Configuración de producción (ng build). No guardes claves reales en este archivo si vas a subirlo a Git.
export const environment = {
  production: true,
  apiUrl: 'https://mpa-5lha.onrender.com/api', // URL real de tu backend en Render
  // Proyecto de Supabase de incidencias, horario y notas (Project Settings > API en supabase.com):
  // la URL del proyecto y la clave "anon public". Vacíos, esos módulos muestran un error de configuración.
  supabaseUrl: '',
  supabaseAnonKey: ''
};
