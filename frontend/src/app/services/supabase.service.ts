import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Incidencia } from '../incidencias/incidencias.component';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly TABLE = 'incidencias';

  constructor() {
    const url = 'REDACTED_SUPABASE_URL';
    const key = 'REDACTED_SUPABASE_ANON_KEY';
    console.log('SupabaseService: Initializing client...');
    try {
      const supabaseOptions = {
        auth: {
          autoRefreshToken: false,  // Desactivar auto refresh de JWT
          persistSession: false,    // No persistir sesión en localStorage
          detectSessionInUrl: false // No buscar tokens en la URL
        }
      };
      this.supabase = createClient(url, key, supabaseOptions as any); // Usar 'as any' si persisten problemas de tipo con opciones complejas
      console.log('SupabaseService: Client initialized:', this.supabase ? 'OK' : 'Failed or undefined');
      if (!this.supabase) {
        console.error('SupabaseService: CRITICAL - Supabase client object is null or undefined after createClient.');
      }
    } catch (e) {
      console.error('SupabaseService: Error during client initialization:', e);
      throw e; 
    }
  }

  private mapRowToIncidencia(row: any): Incidencia {
    return {
      id: row.id,
      titulo: row.titulo,
      tipoIncidencia: row.tipo_incidencia,
      alumnosImplicados: row.alumnos_implicados,
      profesorReporta: row.profesor_reporta,
      nivelUrgencia: row.nivel_urgencia,
      lugarSuceso: row.lugar_suceso,
      descripcion: row.descripcion,
      fechaHora: new Date(row.fecha_hora),
      estado: row.estado,
      adjuntos: row.adjuntos || [],
      fechaCreacion: new Date(row.fecha_reporte),
      fechaModificacion: row.fecha_modificacion ? new Date(row.fecha_modificacion) : undefined
    };
  }

  private mapIncidenciaToRow(inc: Incidencia): any {
    return {
      titulo: inc.titulo,
      tipo_incidencia: inc.tipoIncidencia,
      alumnos_implicados: inc.alumnosImplicados,
      profesor_reporta: inc.profesorReporta,
      nivel_urgencia: inc.nivelUrgencia,
      lugar_suceso: inc.lugarSuceso,
      descripcion: inc.descripcion,
      fecha_hora: inc.fechaHora.toISOString(),
      estado: inc.estado,
      adjuntos: JSON.stringify(inc.adjuntos || []),
    };
  }

  async getAll(): Promise<Incidencia[]> {
    console.log('SupabaseService: getAll method called.');
    if (!this.supabase) {
      console.error('SupabaseService: Supabase client is not initialized in getAll.');
      throw new Error('Supabase client not initialized');
    }

    let response;
    try {
      console.log(`SupabaseService: Attempting to fetch from table: ${this.TABLE}. Client auth:`, this.supabase.auth);
      response = await this.supabase
        .from(this.TABLE)
        .select('*');
        // .order('fecha_reporte', { ascending: false }); // Comentado para simplificar la prueba
      
      console.log('SupabaseService: Raw response from Supabase query:', response);

    } catch (e) {
      console.error('SupabaseService: Error during Supabase query execution (await part):', e);
      // Esto podría capturar errores si el await mismo falla por una promesa rechazada de forma extraña
      throw e;
    }

    if (response === undefined) {
      console.error('SupabaseService: CRITICAL - Received UNDEFINED response from Supabase query. This is unexpected.');
      // Esto es lo que el error original sugiere que está pasando.
      // Podría indicar un problema con el endpoint (404) que el cliente maneja devolviendo undefined.
      throw new Error('Supabase query resolved to undefined. Check network logs for 404s or other API errors.');
    }

    if (response.error) {
      console.error('SupabaseService: Supabase query returned an error object:', response.error);
      throw response.error; // Lanza el error específico de Supabase
    }

    // Si response.data es null (pero response.error es null), usualmente significa "sin resultados" o RLS.
    // Si response.data es undefined (y no hubo error antes), sería también muy extraño.
    console.log('SupabaseService: Query successful, data received:', response.data);
    return (response.data || []).map(r => this.mapRowToIncidencia(r));
  }

  async getById(id: number): Promise<Incidencia | null> {
    const { data, error } = await this.supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data ? this.mapRowToIncidencia(data) : null;
  }

  async create(inc: Incidencia): Promise<Incidencia> {
    const row = this.mapIncidenciaToRow(inc);
    const { data, error } = await this.supabase
      .from(this.TABLE)
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return this.mapRowToIncidencia(data);
  }

  async update(inc: Incidencia): Promise<Incidencia> {
    const row = this.mapIncidenciaToRow(inc);
    const { data, error } = await this.supabase
      .from(this.TABLE)
      .update(row)
      .eq('id', inc.id)
      .select()
      .single();
    if (error) throw error;
    return this.mapRowToIncidencia(data);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.TABLE)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
