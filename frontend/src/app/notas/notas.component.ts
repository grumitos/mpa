import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSortModule, Sort } from '@angular/material/sort';
import { SupabaseService, Nota } from '../services/supabase.service'; // Import SupabaseService and Nota interface
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

// Interface for view-specific properties, like the editing flag
interface NotaView extends Nota {
  editando?: boolean;
  esNueva?: boolean; // Flag to identify a new row
}

@Component({
  selector: 'app-notas',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatSortModule
  ],
  templateUrl: './notas.component.html',
  styleUrl: './notas.component.scss',
  standalone: true
})
export class NotasComponent implements OnInit {
  notas: NotaView[] = [];
  displayedColumns: string[] = ['estudianteNombre', 'evaluacion1', 'evaluacion2', 'evaluacionFinalExamen', 'notaFinalCalculada', 'calificacion', 'acciones'];
  cargando = false;
  mensajeError: string = '';
  estudiantesFiltrados: Observable<string[]> = of([]);
  todosLosEstudiantes: string[] = [];
  
  // Propiedades faltantes que se usan en la plantilla
  filtrosColapsados = false;
  columnas = ['estudianteNombre', 'evaluacion1', 'evaluacion2', 'evaluacionFinalExamen', 'notaFinalCalculada', 'calificacion', 'acciones'];
  
  // Método para alternar la visibilidad de los filtros
  toggleFiltros(): void {
    this.filtrosColapsados = !this.filtrosColapsados;
  }

  filtroForm: FormGroup;
  cursos: string[] = [];
  asignaturas: string[] = [];
  periodos: string[] = ['Primer trimestre', 'Segundo trimestre', 'Tercer trimestre', 'Nota final'];
  private notas_originales: NotaView[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    this.filtroForm = this.fb.group({
      curso: [''],
      asignatura: [''],
      periodo: ['Primer trimestre']
    });
  }

  ngOnInit(): void {
    this.cargarNotas();
    this.filtroForm.valueChanges.subscribe(() => this.aplicarFiltros());
    this.cursos = ['1° Primaria', '2° Primaria', '3° Primaria', '1° ESO', '2° ESO', 'Otros'];
    this.asignaturas = ['Matemáticas', 'Lengua', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés', 'Música', 'Educación Física', 'Otra'];
    
    // Cargando la lista de nombres de estudiantes para el autocompletado
    this.cargarNombresEstudiantes();
  }
  
  cargarNombresEstudiantes(): void {
    // En un sistema real, esto podría venir de una API
    // Por ahora lo simulamos con un array estático
    this.todosLosEstudiantes = [
      'Estudiante Ejemplo 1', 'Estudiante Ejemplo 2', 'Estudiante Ejemplo 3', 
      'Estudiante Ejemplo 4', 'Estudiante Ejemplo 5', 'Estudiante Ejemplo 6',
      'Estudiante Ejemplo 7', 'Estudiante Ejemplo 8', 'Estudiante Ejemplo 9'
    ];
    
    // Inicializar el observable para autocompletado
    this.estudiantesFiltrados = of(this.todosLosEstudiantes);
  }
  
  filtrarEstudiantes(valor: string): string[] {
    if (!valor) return this.todosLosEstudiantes;
    
    const filterValue = valor.toLowerCase();
    return this.todosLosEstudiantes.filter(estudiante => 
      estudiante.toLowerCase().includes(filterValue)
    );
  }

  async cargarNotas(aplicandoFiltros = false): Promise<void> {
    if (!aplicandoFiltros) {
      this.cargando = true;
    }
    this.mensajeError = '';
    try {
      console.log('Cargando notas desde Supabase...');
      const notasCargadas = await this.supabaseService.getAllNotas();
      console.log('Notas cargadas:', notasCargadas);
      
      this.notas_originales = notasCargadas.map(n => ({ ...n, editando: false, esNueva: false }));
      
      // Si no hay filtros activos, mostrar todas las notas directamente
      if (!this.filtroForm.value.curso && !this.filtroForm.value.asignatura) {
        this.notas = [...this.notas_originales];
        console.log('Mostrando todas las notas sin filtrar:', this.notas);
      } else {
        this.aplicarFiltros(); // Apply filters to the newly loaded original notes
      }
    } catch (error) {
      console.error('Error al cargar notas:', error);
      this.mensajeError = 'No se pudieron cargar las notas. Inténtelo más tarde.';
      this.snackBar.open(this.mensajeError, 'Cerrar', { duration: 5000 });
    } finally {
      if (!aplicandoFiltros) {
        this.cargando = false;
      }
      this.cdRef.detectChanges();
    }
  }

  aplicarFiltros(): void {
    const { curso, asignatura, periodo } = this.filtroForm.value;
    let notasFiltradas = [...this.notas_originales];

    if (curso) {
      notasFiltradas = notasFiltradas.filter(n => n.curso === curso);
    }
    if (asignatura) {
      notasFiltradas = notasFiltradas.filter(n => n.asignatura === asignatura);
    }
    if (periodo) {
      notasFiltradas = notasFiltradas.filter(n => n.periodo === periodo);
    }
    // Preserve editing state for rows that are still visible after filtering
    const notasEditandoMap = new Map(this.notas.filter(n => n.editando).map(n => [n.id, n]));

    this.notas = notasFiltradas.map(n => {
        const notaEditando = notasEditandoMap.get(n.id);
        if (notaEditando) {
            return notaEditando; // Keep the instance that is being edited
        }
        return {...n, editando: false}; // Ensure editando is false for others
    });
    this.cdRef.detectChanges();
  }

  agregarFilaParaNuevaNota(): void {
    if (this.notas.some(n => n.esNueva && n.editando)) {
      this.snackBar.open('Ya hay una nueva nota en proceso de creación.', 'Cerrar', { duration: 3000 });
      return;
    }

    const nuevaNota: NotaView = {
      estudianteId: '',
      estudianteNombre: '',
      curso: this.filtroForm.value.curso || '',
      asignatura: this.filtroForm.value.asignatura || '',
      periodo: this.filtroForm.value.periodo || 'Primer trimestre',
      evaluacion1: null,
      evaluacion2: null,
      evaluacionFinalExamen: null,
      notaFinalCalculada: null,
      editando: true,
      esNueva: true
    };
    this.notas = [nuevaNota, ...this.notas];
    this.cdRef.detectChanges();
    this.snackBar.open('Nueva fila agregada. Complete los datos y guarde.', 'Cerrar', { duration: 3500 });
  }

  activarEdicion(nota: NotaView): void {
    if (this.notas.some(n => n.esNueva && n.editando && n !== nota)) {
      this.snackBar.open('Guarde o cancele la nueva nota antes de editar otra.', 'Cerrar', { duration: 3000 });
      return;
    }
    const notaEnEdicion = this.notas.find(n => n.id === nota.id);
    if (notaEnEdicion) {
        notaEnEdicion.editando = true;
    } else if (nota.esNueva) { // Handle new row that might not have an ID yet
        nota.editando = true;
    }
    this.cdRef.detectChanges();
  }

  cancelarEdicion(nota: NotaView): void {
    if (nota.esNueva) {
      this.notas = this.notas.filter(n => n !== nota);
      this.snackBar.open('Creación de nueva nota cancelada.', 'Cerrar', { duration: 3000 });
    } else {
      // Revert changes by reloading the original state for that note
      const originalNota = this.notas_originales.find(n => n.id === nota.id);
      if (originalNota) {
        const index = this.notas.findIndex(n => n.id === nota.id);
        if (index !== -1) {
          this.notas[index] = { ...originalNota, editando: false };
        }
      } else {
        // Fallback if original not found, just stop editing
         nota.editando = false;
      }
       this.snackBar.open('Edición cancelada.', 'Cerrar', { duration: 3000 });
    }
    this.cdRef.detectChanges();
  }

  async guardarNota(nota: NotaView): Promise<void> {
    if (!nota.estudianteNombre) { // Simplified validation: student name is key for new/edited entries
      this.snackBar.open('El nombre del estudiante es requerido.', 'Cerrar', { duration: 3000 });
      return;
    }
    if (!nota.curso || !nota.asignatura || !nota.periodo) {
      this.snackBar.open('Curso, asignatura y periodo son requeridos.', 'Cerrar', { duration: 3000 });
      return;
    }

    nota.notaFinalCalculada = this.calcularNotaFinal(nota);
    this.cargando = true;

    try {
      let resultado: Nota | null = null;
      // Ensure estudianteId is set, using estudianteNombre as a fallback if necessary for new notes
      // This logic might need adjustment based on how estudianteId is truly managed (e.g., selection from a list)
      const finalEstudianteId = nota.estudianteId || nota.estudianteNombre || 'ID_TEMPORAL_' + Date.now();

      const notaPayload: Omit<Nota, 'id' | 'fechaCreacion' | 'fechaModificacion'> | Nota = {
        ...nota, // Spread the current state of nota (camelCase)
        estudianteId: finalEstudianteId,
      };

      if (nota.esNueva && !nota.id) {
        resultado = await this.supabaseService.createNota(notaPayload as Omit<Nota, 'id' | 'fechaCreacion' | 'fechaModificacion'>);
      } else if (nota.id) {
        resultado = await this.supabaseService.updateNota({ ...notaPayload, id: nota.id } as Nota);
      }

      if (resultado) {
        this.snackBar.open('Nota guardada correctamente.', 'Cerrar', { duration: 3000 });
        // Reload all notes to reflect changes and ensure `notas_originales` is up-to-date
        await this.cargarNotas(true); // Pass true to indicate it's a refresh due to an action
      } else {
        this.snackBar.open('Error al guardar la nota. El servicio no devolvió un resultado.', 'Cerrar', { duration: 3000 });
      }
    } catch (error) {
      console.error('Error al guardar nota:', error);
      this.snackBar.open('Error crítico al guardar la nota. Verifique los datos o inténtelo más tarde.', 'Cerrar', { duration: 5000 });
    } finally {
      this.cargando = false;
      // No need to call detectChanges here if cargarNotas does it or if view updates reactively
    }
  }

  async confirmarEliminarNota(notaId: number | undefined): Promise<void> {
    if (notaId === undefined) {
      this.snackBar.open('No se puede eliminar una nota sin ID.', 'Cerrar', { duration: 3000 });
      return;
    }
    if (confirm('¿Está seguro de que desea eliminar esta nota?')) {
      this.cargando = true;
      try {
        const exito = await this.supabaseService.deleteNota(notaId);
        if (exito) {
          this.snackBar.open('Nota eliminada correctamente.', 'Cerrar', { duration: 3000 });
          // Reload notes to reflect deletion
          await this.cargarNotas(true);
        } else {
          this.snackBar.open('Error al eliminar la nota.', 'Cerrar', { duration: 3000 });
        }
      } catch (error) {
        console.error('Error al eliminar nota:', error);
        this.snackBar.open('Error crítico al eliminar la nota.', 'Cerrar', { duration: 5000 });
      } finally {
        this.cargando = false;
      }
    }
  }

  calcularNotaFinal(nota: NotaView): number | null {
    const e1 = nota.evaluacion1 ?? 0;
    const e2 = nota.evaluacion2 ?? 0;
    const ef = nota.evaluacionFinalExamen ?? 0;

    if (nota.evaluacion1 === null && nota.evaluacion2 === null && nota.evaluacionFinalExamen === null) {
      return null; // Si todas las notas son null, la final también es null
    }
    // Considerar 0 si alguna nota es null para el cálculo, pero solo si otras tienen valor.
    return (e1 * 0.3) + (e2 * 0.3) + (ef * 0.4);
  }

  getCalificacionClase(notaFinal: number | null): string {
    if (notaFinal === null) return '';
    if (notaFinal >= 18) return 'sobresaliente';
    if (notaFinal >= 14) return 'notable';
    if (notaFinal >= 10) return 'aprobado';
    return 'suspenso'; // For grades below 10, including Muy deficiente for simplicity in CSS class
  }

  getCalificacionTexto(notaFinal: number | null): string {
    if (notaFinal === null) return 'N/A';
    if (notaFinal >= 18) return 'Sobresaliente';
    if (notaFinal >= 14) return 'Notable';
    if (notaFinal >= 10) return 'Aprobado';
    if (notaFinal >= 6) return 'Suspenso';
    return 'Muy deficiente';
  }

  guardarCambios(nota: NotaView): void {
    this.guardarNota(nota);
  }

  iniciarEdicion(nota: NotaView): void {
    this.activarEdicion(nota);
  }
  
  // Alias para iniciarEdicion para mantener compatibilidad con la plantilla
  editarNota(nota: NotaView): void {
    this.iniciarEdicion(nota);
  }
  
  // Alias para confirmarEliminarNota para mantener compatibilidad con la plantilla
  eliminarNota(id: number): void {
    this.confirmarEliminarNota(id);
  }

  obtenerCalificacion(notaFinal: number | null | undefined): string {
    if (notaFinal === null || notaFinal === undefined) return '-';
    if (notaFinal >= 18) return 'Sobresaliente';
    if (notaFinal >= 14) return 'Notable';
    if (notaFinal >= 10) return 'Aprobado';
    if (notaFinal >= 6) return 'Suspenso';
    return 'Muy deficiente';
  }

  getCalificacion(notaFinal: number | null | undefined): string {
    return this.obtenerCalificacion(notaFinal);
  }

  exportarNotas(): void {
    if (!this.notas || this.notas.length === 0) {
      this.snackBar.open('No hay notas para exportar.', 'Cerrar', { duration: 3000 });
      return;
    }

    const dataAExportar = this.notas.map(nota => ({
      Estudiante: nota.estudianteNombre || nota.estudianteId,
      Curso: nota.curso,
      Asignatura: nota.asignatura,
      Periodo: nota.periodo,
      'Eval. 1 (20%)': nota.evaluacion1,
      'Eval. 2 (30%)': nota.evaluacion2,
      'Examen Final (50%)': nota.evaluacionFinalExamen,
      'Nota Final': this.calcularNotaFinal(nota),
      Calificacion: this.obtenerCalificacion(this.calcularNotaFinal(nota))
    }));

    const csvHeader = Object.keys(dataAExportar[0]).join(',');
    const csvRows = dataAExportar.map(row => 
      Object.values(row).map(value => {
        const stringValue = value === null || value === undefined ? '' : String(value);
        // Escape commas and quotes in cell values
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');
    const csvContent = `${csvHeader}\n${csvRows}`;

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // Added BOM for Excel
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'notas_exportadas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.snackBar.open('Notas exportadas a CSV.', 'Cerrar', { duration: 3000 });
  }

  mostrarMensaje(mensaje: string, esError: boolean = false): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: esError ? 5000 : 3000,
      verticalPosition: 'top', // Consider top or bottom position
      horizontalPosition: 'center', // Or 'start', 'end'
      panelClass: esError ? ['snackbar-error'] : ['snackbar-success']
    });
  }

  sortData(sort: Sort): void {
    const data = [...this.notas];
    if (!sort.active || sort.direction === '') {
      this.notas = data;
      return;
    }

    this.notas = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'estudianteNombre': return this.compare(a.estudianteNombre || '', b.estudianteNombre || '', isAsc);
        case 'evaluacion1': return this.compare(a.evaluacion1 || 0, b.evaluacion1 || 0, isAsc);
        case 'evaluacion2': return this.compare(a.evaluacion2 || 0, b.evaluacion2 || 0, isAsc);
        case 'evaluacionFinalExamen': return this.compare(a.evaluacionFinalExamen || 0, b.evaluacionFinalExamen || 0, isAsc);
        case 'notaFinalCalculada': return this.compare(this.calcularNotaFinal(a) || 0, this.calcularNotaFinal(b) || 0, isAsc);
        default: return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  
  esNotaValida(nota: number | null | undefined): boolean {
    if (nota === null || nota === undefined) return true; // Permitimos notas vacías
    return nota >= 0 && nota <= 20;
  }
  
  validarNota(nota: NotaView, campo: 'evaluacion1' | 'evaluacion2' | 'evaluacionFinalExamen'): void {
    const valorNota = nota[campo];
    if (valorNota !== null && valorNota !== undefined) {
      // Si la nota está fuera del rango válido (0-20), ajustarla
      if (valorNota < 0) nota[campo] = 0;
      if (valorNota > 20) nota[campo] = 20;
    }
  }
  
  getNoteColorClass(nota: number | null | undefined): string {
    if (nota === null || nota === undefined) return ''; // No specific class if note is not set
    if (nota < 10) return 'nota-suspenso'; // Red for failing grades
    if (nota < 14) return 'nota-aprobado'; // Orange for sufficient
    if (nota < 18) return 'nota-notable'; // Blue for notable
    return 'nota-sobresaliente'; // Green for excellent
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      curso: '',
      asignatura: '',
      periodo: 'Primer trimestre'
    });
    this.cargarNotas(); // Recargar las notas con los filtros reseteados
  }

  calcularPromedioClase(): number | null {
    if (!this.notas || this.notas.length === 0) {
      return null;
    }
    const notasValidas = this.notas.map(n => this.calcularNotaFinal(n)).filter(nf => nf !== null) as number[];
    if (notasValidas.length === 0) {
      return null;
    }
    const suma = notasValidas.reduce((acc, curr) => acc + curr, 0);
    return parseFloat((suma / notasValidas.length).toFixed(2));
  }
  
  // Alias para calcularPromedioClase para mantener compatibilidad con la plantilla
  calcularPromedioGeneral(): number {
    return this.calcularPromedioClase() || 0;
  }

  calcularNotaMaxima(): number | null {
    if (!this.notas || this.notas.length === 0) {
      return null;
    }
    const notasFinales = this.notas.map(n => this.calcularNotaFinal(n)).filter(nf => nf !== null) as number[];
    if (notasFinales.length === 0) {
      return null;
    }
    return Math.max(...notasFinales);
  }
  
  calcularNotaMinima(): number {
    if (!this.notas || this.notas.length === 0) {
      return 0;
    }
    const notasFinales = this.notas.map(n => this.calcularNotaFinal(n)).filter(nf => nf !== null) as number[];
    if (notasFinales.length === 0) {
      return 0;
    }
    return Math.min(...notasFinales);
  }

  calcularPorcentajeAprobados(): number | null {
    if (!this.notas || this.notas.length === 0) {
      return null;
    }
    const notasFinales = this.notas.map(n => this.calcularNotaFinal(n)).filter(nf => nf !== null) as number[];
    if (notasFinales.length === 0) {
      return null;
    }
    const aprobados = notasFinales.filter(nf => nf >= 10).length;
    return parseFloat(((aprobados / notasFinales.length) * 100).toFixed(2));
  }
}