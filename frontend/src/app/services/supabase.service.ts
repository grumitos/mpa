// src/app/incidencias/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Incidencia } from '../incidencias/incidencias.component';
import { Horario }    from '../horario/horario.component';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly TABLE_INCIDENCIAS = 'incidencias';
  private readonly TABLE_HORARIO     = 'horario';

  constructor() {
    const url = 'REDACTED_SUPABASE_URL';
    const key = 'REDACTED_SUPABASE_ANON_KEY';
    console.log('SupabaseService: Initializing client...');
    try {
      const opts = { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } };
      this.supabase = createClient(url, key, opts as any);
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
}