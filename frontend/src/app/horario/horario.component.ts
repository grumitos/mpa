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
import { MatSelectModule }     from '@angular/material/select';
import { SupabaseService }     from '../services/supabase.service';

export interface Horario {
  id?: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
  materia: string;
  aula: string;
  colorClass?: string;
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
    MatIconModule,
    MatSelectModule
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
  modoEdicion = false;

  // Para la grilla tipo calendario
  dias = ['L','M','X','J','V','S']; // Iniciales estándar en español: L M X J V S D
  diasCompletos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  horas = Array.from({ length: 15 }, (_, i) => `${8 + i}:00`);
  
  // Paleta de colores para eventos
  colorClasses = [
    'color-primary',   // Terracota - Principal
    'color-indigo',    // Azul indigo
    'color-teal',      // Verde azulado
    'color-amber',     // Ámbar
    'color-purple',    // Púrpura
    'color-green',     // Verde
    'color-brown'      // Marrón
  ];

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
    this.modoEdicion = false;
  }

  editar(h: Horario) {
    this.editando = h;
    this.formulario.patchValue(h);
    this.mostrForm = true;
    this.modoEdicion = true;
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
    this.modoEdicion = false;
  }

  getDayClass(dia: string): string {
    // Normaliza el día para usarlo en clases CSS
    const dayMap: {[key: string]: string} = {
      'lunes': 'lun',
      'martes': 'mar',
      'miércoles': 'mie',
      'miercoles': 'mie',
      'jueves': 'jue',
      'viernes': 'vie',
      'sábado': 'sab',
      'sabado': 'sab',
      'domingo': 'dom'
    };
    
    return dayMap[dia.toLowerCase()] || 'unknown';
  }
  
  getEventStyle(ev: Horario) {
    let diaIdx;
    
    // Primero intentamos encontrar el día por su nombre completo
    diaIdx = this.diasCompletos.indexOf(ev.dia);
    
    // Si no se encuentra, intentamos con la normalización de abreviaturas
    if (diaIdx === -1) {
      const diaNormalizado = ev.dia.charAt(0).toUpperCase() + ev.dia.slice(1,3).toLowerCase();
      diaIdx = this.dias.indexOf(diaNormalizado);
    }
    
    // Si todavía no se encuentra, registramos un warning y ocultamos el evento
    if (diaIdx === -1) {
      console.warn(`Día no encontrado: ${ev.dia}. Formatos esperados: ${this.diasCompletos.join(', ')} o ${this.dias.join(', ')}`);
      return { 'display': 'none' };
    }
    
    const startH = +ev.horaInicio.split(':')[0];
    const endH   = +ev.horaFin.split(':')[0];
    
    // Calculamos la posición absoluta del evento
    // Posición inicial: fila 1 (40px de encabezado) + (n-8) filas de 65px
    const top = 40 + (startH - 8) * 65 + 2; // +2px para evitar solapamiento con líneas de cuadrícula
    
    // La altura es el número de horas * 65px - 4px para el espacio de los bordes
    const height = (endH - startH) * 65 - 4;
    
    // Asignamos un color basado en la materia para que sea consistente
    // Usamos una técnica de hashing simple para mapear materias a colores
    let colorIndex = 0;
    if (ev.materia) {
      // Sumamos los códigos ASCII de los primeros caracteres de la materia
      for (let i = 0; i < Math.min(ev.materia.length, 5); i++) {
        colorIndex += ev.materia.charCodeAt(i);
      }
      colorIndex = colorIndex % this.colorClasses.length;
    }
    
    return {
      'position': 'absolute',
      'top': `${top}px`,
      'left': `calc(60px + ${diaIdx} * ((100% - 60px) / 6) + 2px)`, // +2px margen izquierdo
      'height': `${height}px`,
      'width': `calc(((100% - 60px) / 6) - 4px)`, // -4px para margen en ambos lados
      'z-index': '10',
      'box-sizing': 'border-box',
      'class': this.colorClasses[colorIndex] // No funcionará directamente, necesitamos usar ngClass
    };
  }
}
