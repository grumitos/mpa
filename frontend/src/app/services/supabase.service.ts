// src/app/incidencias/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Incidencia } from '../incidencias/incidencias.component';
import { Horario }    from '../horario/horario.component';

// Define Nota interface for use within the service and by components
export interface Nota {
  id?: number;
  estudianteId: string; // Changed from estudiante_id
  estudianteNombre?: string; // Was already camelCase
  curso: string;
  asignatura: string;
  periodo: string;
  evaluacion1?: number | null;
  evaluacion2?: number | null;
  evaluacionFinalExamen?: number | null; // Changed from evaluacion_final_examen
  notaFinalCalculada?: number | null; // Changed from nota_final_calculada
  fechaCreacion?: Date; // Corresponds to created_at
  fechaModificacion?: Date; // Corresponds to updated_at
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly TABLE_INCIDENCIAS = 'incidencias';
  private readonly TABLE_HORARIO     = 'horario';
  private readonly TABLE_NOTAS       = 'notas'; // New table name for notas

  constructor() {
    const url = 'REDACTED_SUPABASE_URL';
    const key = 'REDACTED_SUPABASE_ANON_KEY';
    console.log('SupabaseService: Initializing client...');
    try {
      // Cambiar a true para que Supabase guarde la sesión y envíe el JWT en cada llamada
      this.supabase = createClient(url, key, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      });
      console.log('SupabaseService: Client initialized:', this.supabase ? 'OK' : 'FAILED');
    } catch (e) {
      console.error('SupabaseService: Error during client initialization:', e);
      throw e;
    }
  }

  // --- Incidencias ---
  private mapRowToIncidencia(row: any): Incidencia {
    return {
      id:               row.id,
      titulo:           row.titulo,
      tipoIncidencia:   row.tipo_incidencia,
      alumnosImplicados: row.alumnos_implicados,
      profesorReporta:  row.profesor_reporta,
      nivelUrgencia:    row.nivel_urgencia,
      lugarSuceso:      row.lugar_suceso,
      descripcion:      row.descripcion,
      fechaHora:        new Date(row.fecha_hora),
      estado:           row.estado,
      adjuntos:         row.adjuntos || [],
      fechaCreacion:    new Date(row.fecha_reporte),
      fechaModificacion: row.fecha_modificacion ? new Date(row.fecha_modificacion) : undefined
    };
  }

  private mapIncidenciaToRow(inc: Incidencia): any {
    return {
      titulo:            inc.titulo,
      tipo_incidencia:   inc.tipoIncidencia,
      alumnos_implicados:inc.alumnosImplicados,
      profesor_reporta:  inc.profesorReporta,
      nivel_urgencia:    inc.nivelUrgencia,
      lugar_suceso:      inc.lugarSuceso,
      descripcion:       inc.descripcion,
      fecha_hora:        inc.fechaHora.toISOString(),
      estado:            inc.estado,
      adjuntos:          JSON.stringify(inc.adjuntos || [])
    };
  }

  async getAll(): Promise<Incidencia[]> {
    console.log('SupabaseService: getAll()');
    const { data, error } = await this.supabase
      .from(this.TABLE_INCIDENCIAS)
      .select('*');
    if (error) throw error;
    return (data || []).map(r => this.mapRowToIncidencia(r));
  }

  async getById(id: number): Promise<Incidencia | null> {
    const { data, error } = await this.supabase
      .from(this.TABLE_INCIDENCIAS)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data ? this.mapRowToIncidencia(data) : null;
  }

  async create(inc: Incidencia): Promise<Incidencia> {
    const row = this.mapIncidenciaToRow(inc);
    const { data, error } = await this.supabase
      .from(this.TABLE_INCIDENCIAS)
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return this.mapRowToIncidencia(data);
  }

  async update(inc: Incidencia): Promise<Incidencia> {
    const row = this.mapIncidenciaToRow(inc);
    const { data, error } = await this.supabase
      .from(this.TABLE_INCIDENCIAS)
      .update(row)
      .eq('id', inc.id)
      .select()
      .single();
    if (error) throw error;
    return this.mapRowToIncidencia(data);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.TABLE_INCIDENCIAS)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // --- Horario ---
  private mapRowToHorario(row: any): Horario {
    return {
      id:         row.id,
      dia:        row.dia,
      horaInicio: row.hora_inicio,
      horaFin:    row.hora_fin,
      materia:    row.materia,
      aula:       row.aula
    };
  }

  private mapHorarioToRow(h: Horario): any {
    return {
      dia:         h.dia,
      hora_inicio: h.horaInicio,
      hora_fin:    h.horaFin,
      materia:     h.materia,
      aula:        h.aula
    };
  }

  async getAllHorarios(): Promise<Horario[]> {
    const { data, error } = await this.supabase
      .from(this.TABLE_HORARIO)
      .select('*');
    if (error) throw error;
    return (data || []).map(r => this.mapRowToHorario(r));
  }

  async getHorarioById(id: number): Promise<Horario | null> {
    const { data, error } = await this.supabase
      .from(this.TABLE_HORARIO)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data ? this.mapRowToHorario(data) : null;
  }

  async createHorario(h: Horario): Promise<Horario> {
    const row = this.mapHorarioToRow(h);
    const { data, error } = await this.supabase
      .from(this.TABLE_HORARIO)
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return this.mapRowToHorario(data);
  }

  async updateHorario(h: Horario): Promise<Horario> {
    const row = this.mapHorarioToRow(h);
    const { data, error } = await this.supabase
      .from(this.TABLE_HORARIO)
      .update(row)
      .eq('id', h.id)
      .select()
      .single();
    if (error) throw error;
    return this.mapRowToHorario(data);
  }

  async deleteHorario(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.TABLE_HORARIO)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // --- Notas ---
  // Maps a row from Supabase (snake_case) to a Nota object for the app (camelCase)
  private mapRowToNota(row: any): Nota {
    return {
      id: row.id,
      estudianteId: row.estudiante_id, // Map from snake_case
      estudianteNombre: row.estudiante_nombre,
      curso: row.curso,
      asignatura: row.asignatura,
      periodo: row.periodo,
      evaluacion1: row.evaluacion1,
      evaluacion2: row.evaluacion2,
      evaluacionFinalExamen: row.evaluacion_final_examen, // Map from snake_case
      notaFinalCalculada: row.nota_final_calculada, // Map from snake_case
      fechaCreacion: row.created_at ? new Date(row.created_at) : undefined,
      fechaModificacion: row.updated_at ? new Date(row.updated_at) : undefined
    };
  }

  // Maps a Nota object from the app (camelCase) to a row for Supabase (snake_case)
  private mapNotaToRow(nota: Nota): any {
    const row: any = {
      estudiante_id: nota.estudianteId, // Map to snake_case
      estudiante_nombre: nota.estudianteNombre,
      curso: nota.curso,
      asignatura: nota.asignatura,
      periodo: nota.periodo,
      evaluacion1: nota.evaluacion1,
      evaluacion2: nota.evaluacion2,
      evaluacion_final_examen: nota.evaluacionFinalExamen, // Map to snake_case
      nota_final_calculada: nota.notaFinalCalculada, // Map to snake_case
      // id is not included for insert, handled by .eq for update
      // created_at and updated_at are managed by Supabase
    };
    // if (nota.id) { // id is not part of the row data for insert/update payload
    //   row.id = nota.id;
    // }
    return row;
  }

  async getAllNotas(): Promise<Nota[]> {
    console.log('SupabaseService: getAllNotas()');
    const { data, error } = await this.supabase
      .from(this.TABLE_NOTAS)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching notas:', error);
      return [];
    }
    return (data || []).map(r => this.mapRowToNota(r));
  }

  async getNotaById(id: number): Promise<Nota | null> {
    console.log(`SupabaseService: getNotaById(${id})`);
    const { data, error } = await this.supabase
      .from(this.TABLE_NOTAS)
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error(`Error fetching nota with id ${id}:`, error);
      return null;
    }
    return data ? this.mapRowToNota(data) : null;
  }

  async createNota(nota: Omit<Nota, 'id' | 'fechaCreacion' | 'fechaModificacion'>): Promise<Nota | null> {
    console.log('SupabaseService: createNota()', nota);
    const row = this.mapNotaToRow(nota as Nota); // Cast because mapNotaToRow expects Nota with all fields
    delete row.id; // Ensure id is not sent for creation

    const { data, error } = await this.supabase
      .from(this.TABLE_NOTAS)
      .insert(row)
      .select()
      .single();
    if (error) {
      console.error('Error creating nota:', error, 'Row:', row);
      return null;
    }
    return data ? this.mapRowToNota(data) : null;
  }

  async updateNota(nota: Nota): Promise<Nota | null> {
    if (!nota.id) {
      console.error('Update error: Nota ID is missing');
      return null; // Or throw error
    }
    console.log('SupabaseService: updateNota()', nota);
    const row = this.mapNotaToRow(nota);
    // Do not send id in the update payload itself, it's used in .eq()
    const { id, ...updateData } = row;

    const { data, error } = await this.supabase
      .from(this.TABLE_NOTAS)
      .update(updateData)
      .eq('id', nota.id)
      .select()
      .single();
    if (error) {
      console.error('Error updating nota:', error, 'Row:', updateData);
      return null;
    }
    return data ? this.mapRowToNota(data) : null;
  }

  async deleteNota(id: number): Promise<boolean> {
    console.log(`SupabaseService: deleteNota(${id})`);
    const { error } = await this.supabase
      .from(this.TABLE_NOTAS)
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting nota:', error);
      return false;
    }
    return true;
  }
}