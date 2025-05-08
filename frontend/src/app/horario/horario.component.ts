import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { MatCardModule }       from '@angular/material/card';
import { MatTableModule }      from '@angular/material/table';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { SupabaseService }     from '../services/supabase.service';

export interface Horario {
  id?: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
  materia: string;
  aula: string;
}

@Component({
  selector: 'app-horario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './horario.component.html',
  styleUrls: ['./horario.component.scss']
})
export class HorarioComponent implements OnInit {
  horarios: Horario[] = [];
  formulario: FormGroup;
  columnas = ['dia','horaInicio','horaFin','materia','aula','acciones'];
  mostrForm = false;
  editando: Horario | null = null;

  // Para la grilla tipo calendario
  dias = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  horas = Array.from({ length: 9 }, (_, i) => `${15 + i}:00`);

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService
  ) {
    this.formulario = this.fb.group({
      dia:        ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin:    ['', Validators.required],
      materia:    ['', Validators.required],
      aula:       ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarHorarios();
  }

  private cargarHorarios() {
    this.supabaseService.getAllHorarios()
      .then(data => this.horarios = data)
      .catch(err => console.error('Error cargando horario:', err));
  }

  nuevo() {
    this.editando = null;
    this.formulario.reset();
    this.mostrForm = true;
  }

  editar(h: Horario) {
    this.editando = h;
    this.formulario.patchValue(h);
    this.mostrForm = true;
  }

  async guardar() {
    if (this.formulario.invalid) return;
    const val = this.formulario.value as Horario;
    try {
      if (this.editando?.id != null) {
        await this.supabaseService.updateHorario({ ...this.editando, ...val });
      } else {
        await this.supabaseService.createHorario(val);
      }
      this.mostrForm = false;
      this.cargarHorarios();
    } catch (err) {
      console.error('Error guardando horario:', err);
    }
  }

  async eliminar(id?: number) {
    if (!id) return;
    try {
      await this.supabaseService.deleteHorario(id);
      this.cargarHorarios();
    } catch (err) {
      console.error('Error eliminando horario:', err);
    }
  }

  cancelar() {
    this.mostrForm = false;
  }

  // Calcula posición CSS para cada evento en la grilla
  getEventStyle(ev: Horario) {
    const diaIdx = this.dias.indexOf(
      ev.dia.charAt(0).toUpperCase() + ev.dia.slice(1,3).toLowerCase()
    );
    const startH = +ev.horaInicio.split(':')[0];
    const endH   = +ev.horaFin.split(':')[0];
    const rowStart = startH - 15 + 2; // +2 porque fila 1 es cabecera, fila 2 corresponde a 15:00
    const rowEnd   = endH   - 15 + 2;
    const col = diaIdx + 2;           // columna 1 es la de horas, columnas 2–8 los días
    return {
      'grid-column':      `${col}`,
      'grid-row':         `${rowStart} / ${rowEnd}`
    };
  }
}
