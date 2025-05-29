import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SupabaseService } from '../services/supabase.service';
import * as XLSX from 'xlsx';

export interface Incidencia {
  id?: number;
  titulo: string;
  tipoIncidencia: string;
  alumnosImplicados: string;
  profesorReporta: string;
  nivelUrgencia: string;
  lugarSuceso: string;
  descripcion: string;
  fechaHora: Date;
  estado: string;
  adjuntos?: string[];
  fechaCreacion: Date;
  fechaModificacion?: Date;
  lugar?: string;
  profesorResponsable?: string;
  medidasAdoptadas?: string;
}

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.component.html',
  styleUrls: ['./incidencias.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule
  ]
})
export class IncidenciasComponent implements OnInit {
  allIncidencias: Incidencia[] = [];

  incidencias: Incidencia[] = [];
  
  incidenciaSeleccionada: Incidencia | null = null;
  
  formularioVisible = false;
  mostrarFormularioIntegrado = false;
  
  modoFormulario: 'nueva' | 'ver' | 'editar' = 'nueva';
  
  cargando = false;
  
  mensajeError: string = '';
  
  formularioIncidencia: FormGroup;
  
  filtrosColapsados = false;
  detallesVisibles = false;
  
  filtros = {
    estado: '',
    tipoIncidencia: '',
    alumno: '',
    nivelUrgencia: '',
    fechaInicio: null as Date | null,
    fechaFin: null as Date | null,
    terminoBusqueda: ''
  };
  
  tiposIncidencia = [
    'Académica',
    'Conducta disruptiva',
    'Agresión física',
    'Agresión verbal',
    'Acoso escolar (Bullying)',
    'Ciberacoso',
    'Absentismo',
    'Médica/Salud',
    'Accidente escolar',
    'Daños materiales',
    'Material escolar dañado',
    'Uso indebido de dispositivos',
    'Rendimiento académico',
    'Necesidades educativas especiales',
    'Conflictos entre alumnos',
    'Conflicto alumno-profesor',
    'Situación familiar',
    'Retraso escolar continuado',
    'Uso de sustancias prohibidas',
    'Alimentos/Alergias',
    'Robo/Hurto',
    'Problemas de socialización',
    'Otra'
  ];
  
  nivelesUrgencia = [
    'Baja', 
    'Media-baja', 
    'Media', 
    'Media-alta', 
    'Alta', 
    'Urgente', 
    'Crítica'
  ];
  
  estadosIncidencia = [
    'Pendiente', 
    'En proceso',
    'En investigación', 
    'Esperando información',
    'Derivado a dirección',
    'Derivado a orientación',
    'Citada familia',
    'Medidas aplicadas',
    'Resuelta', 
    'Desestimada',
    'Archivada'
  ];
  
  lugaresSuceso = [
    'Aula de informática',
    'Laboratorio de ciencias',
    'Taller de tecnología',
    'Aula de música',
    'Aula de plástica',
    'Biblioteca',
    'Gimnasio',
    'Patio (zona principal)',
    'Patio (zona infantil)',
    'Patio (pistas deportivas)',
    'Comedor',
    'Cafetería',
    'Pasillos',
    'Escaleras',
    'Entrada principal',
    'Baños',
    'Fuera del centro',
    'Transporte escolar',
    'Actividad extraescolar',
    'Excursión',
    'Online/Virtual',
    'Otro'
  ];
  
  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private supabaseService: SupabaseService
  ) {
    this.formularioIncidencia = this.formBuilder.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      tipoIncidencia: ['', Validators.required],
      alumnosImplicados: ['', Validators.required],
      profesorReporta: ['', Validators.required],
      nivelUrgencia: ['', Validators.required],
      lugarSuceso: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
      fechaHora: [new Date(), Validators.required],
      estado: ['Pendiente', Validators.required],
      adjuntos: [[]]
    });
  }
  
  ngOnInit(): void {
    this.cargarIncidencias();
  }
  
  cargarIncidencias(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.supabaseService.getAll()
      .then(data => {
        this.allIncidencias = data;
        this.aplicarFiltros();
      })
      .catch(err => {
        console.error('Error al cargar incidencias:', err);
        this.mensajeError = 'Error al cargar las incidencias';
      })
      .finally(() => this.cargando = false);
  }
    aplicarFiltros(): void {
    this.cargando = true;
    // Al aplicar filtros, cerramos el formulario integrado si está abierto
    this.mostrarFormularioIntegrado = false;
    
    let incidenciasFiltradas = [...this.allIncidencias];
    
    if (this.filtros.estado) {
      incidenciasFiltradas = incidenciasFiltradas.filter(
        inc => inc.estado.toLowerCase() === this.filtros.estado.toLowerCase()
      );
    }
    
    if (this.filtros.tipoIncidencia) {
      incidenciasFiltradas = incidenciasFiltradas.filter(
        inc => inc.tipoIncidencia.toLowerCase() === this.filtros.tipoIncidencia.toLowerCase()
      );
    }
    
    if (this.filtros.alumno) {
      incidenciasFiltradas = incidenciasFiltradas.filter(
        inc => inc.alumnosImplicados.toLowerCase().includes(this.filtros.alumno.toLowerCase())
      );
    }
    
    if (this.filtros.nivelUrgencia) {
      incidenciasFiltradas = incidenciasFiltradas.filter(
        inc => inc.nivelUrgencia.toLowerCase() === this.filtros.nivelUrgencia.toLowerCase()
      );
    }
    
    if (this.filtros.fechaInicio && this.filtros.fechaFin) {
      incidenciasFiltradas = incidenciasFiltradas.filter(inc => {
        const fechaIncidencia = new Date(inc.fechaHora);
        return (
          fechaIncidencia >= this.filtros.fechaInicio! &&
          fechaIncidencia <= this.filtros.fechaFin!
        );
      });
    }
    
    if (this.filtros.terminoBusqueda) {
      const termino = this.filtros.terminoBusqueda.toLowerCase();
      incidenciasFiltradas = incidenciasFiltradas.filter(
        inc =>
          inc.titulo.toLowerCase().includes(termino) ||
          inc.descripcion.toLowerCase().includes(termino) ||
          inc.alumnosImplicados.toLowerCase().includes(termino) ||
          inc.profesorReporta.toLowerCase().includes(termino)
      );
    }
    
    this.incidencias = incidenciasFiltradas;
    this.cargando = false;
  }
    limpiarFiltros(): void {
    this.filtros = {
      estado: '',
      tipoIncidencia: '',
      alumno: '',
      nivelUrgencia: '',
      fechaInicio: null,
      fechaFin: null,
      terminoBusqueda: ''
    };
    
    // Ocultamos el formulario integrado al limpiar filtros
    this.mostrarFormularioIntegrado = false;
    this.aplicarFiltros();
  }
    nuevaIncidencia(): void {
    this.modoFormulario = 'nueva';
    this.incidenciaSeleccionada = null;
    
    this.formularioIncidencia.reset({
      titulo: '',
      tipoIncidencia: this.tiposIncidencia[0],
      alumnosImplicados: '',
      profesorReporta: '',
      nivelUrgencia: this.nivelesUrgencia[0],
      lugarSuceso: this.lugaresSuceso[0],
      descripcion: '',
      fechaHora: new Date(),
      estado: 'Pendiente',
      adjuntos: []
    });
    
    // En lugar de mostrar el modal, mostrar el formulario integrado
    this.mostrarFormularioIntegrado = true;
    // Hacer scroll suave hacia el formulario
    setTimeout(() => {
      const elemento = document.querySelector('.formulario-integrado-card');
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
    verIncidencia(incidencia: Incidencia): void {
    this.modoFormulario = 'ver';
    this.incidenciaSeleccionada = { ...incidencia };
    this.formularioIncidencia.patchValue(incidencia);
    this.formularioIncidencia.disable();
    // Para ver detalles seguimos usando el modal
    this.formularioVisible = true;
  }
    verDetalles(incidencia: Incidencia): void {
    this.modoFormulario = 'ver';
    this.incidenciaSeleccionada = { ...incidencia };
    this.formularioIncidencia.patchValue(incidencia);
    this.formularioIncidencia.disable(); // Deshabilitar campos para solo lectura
    // Usar el formulario integrado en lugar del modal
    this.mostrarFormularioIntegrado = true;
    // Hacer scroll suave hacia el formulario
    setTimeout(() => {
      const elemento = document.querySelector('.formulario-integrado-card');
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
  
  // Métodos faltantes que se usan en la plantilla
  toggleFiltros(): void {
    this.filtrosColapsados = !this.filtrosColapsados;
  }
  
  getUrgencyClass(nivelUrgencia: string | undefined): string {
    if (!nivelUrgencia) return 'urgency-medium';
    
    const urgencyMap: {[key: string]: string} = {
      'baja': 'urgency-low',
      'media-baja': 'urgency-medium-low',
      'media': 'urgency-medium',
      'media-alta': 'urgency-medium-high',
      'alta': 'urgency-high',
      'urgente': 'urgency-urgent',
      'crítica': 'urgency-critical'
    };
    
    return urgencyMap[nivelUrgencia.toLowerCase()] || 'urgency-medium';
  }
  
  getShortStudentsList(alumnos: string): string {
    if (!alumnos) return 'No especificado';
    
    const listaAlumnos = alumnos.split(',').map(a => a.trim());
    if (listaAlumnos.length <= 2) return alumnos;
    
    return `${listaAlumnos[0]}, ${listaAlumnos[1]} y ${listaAlumnos.length - 2} más`;
  }
  
  getStatusClass(estado: string | undefined): string {
    if (!estado) return 'status-pending';
    
    const statusMap: {[key: string]: string} = {
      'pendiente': 'status-pending',
      'en proceso': 'status-in-progress',
      'en investigación': 'status-investigating',
      'esperando información': 'status-waiting',
      'derivado a dirección': 'status-forwarded',
      'derivado a orientación': 'status-forwarded-guidance',
      'citada familia': 'status-family-meeting',
      'medidas aplicadas': 'status-measures-applied',
      'resuelta': 'status-resolved',
      'desestimada': 'status-dismissed',
      'archivada': 'status-archived'
    };
    
    return statusMap[estado.toLowerCase()] || 'status-pending';
  }
  
  verDetallesRow(incidencia: Incidencia, event: Event): void {
    event.stopPropagation();
    this.incidenciaSeleccionada = { ...incidencia };
    this.detallesVisibles = true;
  }
  
  cerrarDetalles(): void {
    this.detallesVisibles = false;
    this.incidenciaSeleccionada = null;
  }
  
  editarIncidenciaDesdeDetalles(): void {
    if (this.incidenciaSeleccionada) {
      this.cerrarDetalles();
      this.editarIncidencia(this.incidenciaSeleccionada);
    }
  }
    editarIncidencia(incidencia: Incidencia): void {
    this.modoFormulario = 'editar';
    this.incidenciaSeleccionada = { ...incidencia };
    this.formularioIncidencia.patchValue(incidencia);
    this.formularioIncidencia.enable();
    // Usar el formulario integrado en lugar del modal
    this.mostrarFormularioIntegrado = true;
    // Hacer scroll suave hacia el formulario
    setTimeout(() => {
      const elemento = document.querySelector('.formulario-integrado-card');
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
    guardarIncidencia(): void {
    if (this.formularioIncidencia.invalid) {
      this.formularioIncidencia.markAllAsTouched();
      return;
    }
    
    this.cargando = true;
    
    const datos = this.formularioIncidencia.value as Incidencia;
    
    if (this.modoFormulario === 'editar' && this.incidenciaSeleccionada?.id) {
      datos.id = this.incidenciaSeleccionada.id;
      this.supabaseService.update(datos)
        .then(updated => {
          this.allIncidencias = this.allIncidencias.map(inc => inc.id === updated.id ? updated : inc);
          this.mostrarMensaje('Incidencia actualizada correctamente');
          // Cerrar formulario según dónde estemos
          if (this.formularioVisible) {
            this.cerrarFormulario();
          } else if (this.mostrarFormularioIntegrado) {
            this.cerrarFormularioIntegrado();
          }
          this.aplicarFiltros();
        })
        .catch(err => {
          console.error(err);
          this.mensajeError = 'Error al actualizar la incidencia';
        })
        .finally(() => this.cargando = false);
    } else {
      this.supabaseService.create(datos)
        .then(created => {
          this.allIncidencias.unshift(created);
          this.mostrarMensaje('Incidencia creada correctamente');
          // Cerrar formulario según dónde estemos
          if (this.formularioVisible) {
            this.cerrarFormulario();
          } else if (this.mostrarFormularioIntegrado) {
            this.cerrarFormularioIntegrado();
          }
          this.aplicarFiltros();
        })
        .catch(err => {
          console.error(err);
          this.mensajeError = 'Error al crear la incidencia';
        })
        .finally(() => this.cargando = false);
    }
  }
  
  eliminarIncidencia(incidencia: Incidencia): void {
    if (!incidencia.id || !confirm(`¿Está seguro que desea eliminar la incidencia "${incidencia.titulo}"?`)) return;
    this.cargando = true;
    this.supabaseService.delete(incidencia.id)
      .then(() => {
        this.allIncidencias = this.allIncidencias.filter(inc => inc.id !== incidencia.id);
        this.mostrarMensaje('Incidencia eliminada correctamente');
        this.aplicarFiltros();
      })
      .catch(err => {
        console.error(err);
        this.mensajeError = 'Error al eliminar la incidencia';
      })
      .finally(() => this.cargando = false);
  }
    cerrarFormulario(): void {
    this.formularioVisible = false;
    this.incidenciaSeleccionada = null;
    setTimeout(() => {
      this.formularioIncidencia.enable();
      this.formularioIncidencia.reset({
        estado: 'Pendiente',
        fechaHora: new Date(),
        adjuntos: []
      });
    }, 300);
  }
  
  cerrarFormularioIntegrado(): void {
    this.mostrarFormularioIntegrado = false;
    this.incidenciaSeleccionada = null;
    this.formularioIncidencia.enable();
    this.formularioIncidencia.reset({
      estado: 'Pendiente',
      fechaHora: new Date(),
      adjuntos: []
    });
  }
  
  mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
  
  getClaseEstado(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'estado-pendiente';
      case 'en proceso':
        return 'estado-proceso';
      case 'resuelta':
        return 'estado-resuelta';
      case 'archivada':
        return 'estado-archivada';
      default:
        return '';
    }
  }
  
  getClaseUrgencia(nivel: string): string {
    switch (nivel.toLowerCase()) {
      case 'alta':
        return 'urgencia-alta';
      case 'media':
        return 'urgencia-media';
      case 'baja':
        return 'urgencia-baja';
      default:
        return '';
    }
  }

  getClaseEstadoClaude(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'claude-badge--warning';
      case 'en proceso':
        return 'claude-badge--primary';
      case 'resuelta':
        return 'claude-badge--success';
      case 'archivada':
        return '';
      default:
        return '';
    }
  }
  
  getClaseUrgenciaClaude(nivel: string): string {
    switch (nivel.toLowerCase()) {
      case 'alta':
        return 'claude-badge--error';
      case 'media':
        return 'claude-badge--warning';
      case 'baja':
        return 'claude-badge--success';
      default:
        return '';
    }
  }
  debugSelector(selectorName: string): void {
    console.log(`Click en selector ${selectorName}`);
    console.log(`Valores disponibles:`, this[selectorName as keyof IncidenciasComponent]);
    console.log(`Valor actual:`, this.formularioIncidencia.get(selectorName)?.value);
    console.log(`¿Selector deshabilitado?:`, this.formularioIncidencia.get(selectorName)?.disabled);
    console.log(`Estado del formulario:`, this.formularioIncidencia.status);
  }

  exportarExcel(): void {
    if (!this.incidencias || this.incidencias.length === 0) {
      this.mostrarMensaje('No hay datos para exportar');
      return;
    }

    try {
      // Preparar los datos para exportar
      const datosExport = this.incidencias.map(incidencia => ({
        'ID': incidencia.id || '',
        'Título': incidencia.titulo || '',
        'Tipo de Incidencia': incidencia.tipoIncidencia || '',
        'Nivel de Urgencia': incidencia.nivelUrgencia || '',
        'Estado': incidencia.estado || '',
        'Fecha y Hora': incidencia.fechaHora ? new Date(incidencia.fechaHora).toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : '',
        'Alumnos Implicados': incidencia.alumnosImplicados || '',
        'Profesor Reporta': incidencia.profesorReporta || '',
        'Profesor Responsable': incidencia.profesorResponsable || '',
        'Lugar del Suceso': incidencia.lugarSuceso || '',
        'Lugar': incidencia.lugar || '',
        'Descripción': incidencia.descripcion || '',
        'Medidas Adoptadas': incidencia.medidasAdoptadas || '',
        'Fecha de Creación': incidencia.fechaCreacion ? new Date(incidencia.fechaCreacion).toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : '',
        'Fecha de Modificación': incidencia.fechaModificacion ? new Date(incidencia.fechaModificacion).toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : ''
      }));

      // Crear el workbook y worksheet
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExport);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      
      // Agregar el worksheet al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Incidencias');

      // Configurar el ancho de las columnas
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 30 },  // Título
        { wch: 20 },  // Tipo de Incidencia
        { wch: 15 },  // Nivel de Urgencia
        { wch: 15 },  // Estado
        { wch: 18 },  // Fecha y Hora
        { wch: 25 },  // Alumnos Implicados
        { wch: 20 },  // Profesor Reporta
        { wch: 20 },  // Profesor Responsable
        { wch: 20 },  // Lugar del Suceso
        { wch: 15 },  // Lugar
        { wch: 40 },  // Descripción
        { wch: 30 },  // Medidas Adoptadas
        { wch: 18 },  // Fecha de Creación
        { wch: 18 }   // Fecha de Modificación
      ];
      ws['!cols'] = colWidths;

      // Generar el nombre del archivo con la fecha actual
      const fechaActual = new Date();
      const fechaFormato = fechaActual.toISOString().split('T')[0].replace(/-/g, '');
      const nombreArchivo = `incidencias_${fechaFormato}.xlsx`;

      // Escribir el archivo
      XLSX.writeFile(wb, nombreArchivo);
      
      this.mostrarMensaje(`Archivo exportado exitosamente: ${nombreArchivo}`);
      
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      this.mostrarMensaje('Error al exportar el archivo. Por favor, inténtelo de nuevo.');
    }
  }
}