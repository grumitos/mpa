import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { SupabaseService, Nota } from '../services/supabase.service'; // Import SupabaseService and Nota interface

// Interface for view-specific properties, like the editing flag
interface NotaView extends Nota {
  editando?: boolean;
}

@Component({
  selector: 'app-notas',
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
    MatSnackBarModule
  ],
  templateUrl: './notas.component.html',
  styleUrl: './notas.component.scss',
  standalone: true
})
export class NotasComponent implements OnInit {
  notas: NotaView[] = [];
  displayedColumns: string[] = ['estudiante_nombre', 'evaluacion1', 'evaluacion2', 'evaluacion_final_examen', 'nota_final_calculada', 'calificacion', 'acciones'];
  cargando = false;
  mensajeError: string = '';

  // Filtros
  filtroForm: FormGroup;
  cursos: string[] = []; // Populate from data or define statically
  asignaturas: string[] = []; // Populate from data or define statically
  periodos: string[] = ['Primer trimestre', 'Segundo trimestre', 'Tercer trimestre', 'Nota final'];

  // Formulario para nueva/editar nota (opcional, si se edita en línea o en un modal)
  // notaForm: FormGroup; // Not using a separate form for now, inline editing directly modifies `NotaView` object properties
  // editandoNota: Nota | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    this.filtroForm = this.fb.group({
      curso: [''],
      asignatura: [''],
      periodo: ['Primer trimestre'] // Default periodo
    });

    // this.notaForm = this.fb.group({ // Removed as we are doing inline editing
    //   id: [null],
    //   estudiante_id: ['', Validators.required],
    //   estudiante_nombre: [{value: '', disabled: true}],
    //   curso: ['', Validators.required],
    //   asignatura: ['', Validators.required],
    //   periodo: ['', Validators.required],
    //   evaluacion1: [null, [Validators.min(0), Validators.max(10)]],
    //   evaluacion2: [null, [Validators.min(0), Validators.max(10)]],
    //   evaluacion_final_examen: [null, [Validators.min(0), Validators.max(10)]],
    // });
  }

  ngOnInit(): void {
    this.cargarNotas();
    this.filtroForm.valueChanges.subscribe(() => this.aplicarFiltros());
    this.cursos = ['1° Primaria', '2° Primaria', '3° Primaria', '1° ESO', '2° ESO', 'Otros'];
    this.asignaturas = ['Matemáticas', 'Lengua', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés', 'Música', 'Educación Física', 'Otra'];
  }

  async cargarNotas(aplicandoFiltros = false): Promise<void> {
    if (!aplicandoFiltros) { // Avoid showing main spinner if filters are just being applied over existing data view
        this.cargando = true;
    }
    this.mensajeError = '';
    try {
      const notasCargadas = await this.supabaseService.getAllNotas();
      // Preserve edit state if a specific row was being edited and is still in the filtered list
      const notasEditandoIds = this.notas.filter(n => n.editando).map(n => n.id);

      this.notas = notasCargadas.map(n => ({
        ...n,
        editando: notasEditandoIds.includes(n.id)
      }));
      this.cdRef.detectChanges();
    } catch (error) {
      this.mensajeError = 'Error al cargar las notas. Inténtelo más tarde.';
      console.error('Error cargando notas:', error);
      this.mostrarMensaje(this.mensajeError, true);
    } finally {
      if (!aplicandoFiltros) {
        this.cargando = false;
      }
    }
  }

  aplicarFiltros(): void {
    // Set a small loading indicator for filter application if desired, or rely on table update
    // this.cargando = true; // This might be too disruptive for quick filter changes
    const { curso, asignatura, periodo } = this.filtroForm.value;

    this.supabaseService.getAllNotas().then(todasLasNotas => {
      let notasFiltradas = todasLasNotas;
      if (curso) {
        notasFiltradas = notasFiltradas.filter(n => n.curso === curso);
      }
      if (asignatura) {
        notasFiltradas = notasFiltradas.filter(n => n.asignatura === asignatura);
      }
      if (periodo) {
        notasFiltradas = notasFiltradas.filter(n => n.periodo === periodo);
      }

      const notasEditandoIds = this.notas.filter(n => n.editando).map(n => n.id);
      this.notas = notasFiltradas.map(n => ({
        ...n,
        editando: notasEditandoIds.includes(n.id)
      }));
      // this.cargando = false;
      this.cdRef.detectChanges();
    }).catch(error => {
      this.mensajeError = 'Error al aplicar filtros.';
      this.mostrarMensaje(this.mensajeError, true);
      // this.cargando = false;
      console.error('Error aplicando filtros:', error);
    });
  }

  iniciarEdicion(nota: NotaView): void {
    // Ensure only one row is editable at a time if that's the desired behavior
    // this.notas.forEach(n => { if (n.id !== nota.id) n.editando = false; });
    const notaEditable = this.notas.find(n => n.id === nota.id);
    if (notaEditable) {
      notaEditable.editando = true;
      this.cdRef.detectChanges(); // Ensure the view updates to show input fields
    }
  }

  async guardarCambios(nota: NotaView): Promise<void> {
    if (!nota.id) {
      this.mostrarMensaje('Error: ID de nota no encontrado.', true);
      return;
    }

    const scores = [nota.evaluacion1, nota.evaluacion2, nota.evaluacion_final_examen];
    for (const score of scores) {
      if (score !== null && score !== undefined && (isNaN(Number(score)) || Number(score) < 0 || Number(score) > 10)) {
        this.mostrarMensaje('Las calificaciones deben ser números entre 0 y 10.', true);
        nota.editando = true; // Keep editing mode
        this.cdRef.detectChanges();
        return;
      }
    }
    // Convert to numbers before saving if they are strings from input fields
    nota.evaluacion1 = nota.evaluacion1 !== null && nota.evaluacion1 !== undefined ? Number(nota.evaluacion1) : null;
    nota.evaluacion2 = nota.evaluacion2 !== null && nota.evaluacion2 !== undefined ? Number(nota.evaluacion2) : null;
    nota.evaluacion_final_examen = nota.evaluacion_final_examen !== null && nota.evaluacion_final_examen !== undefined ? Number(nota.evaluacion_final_examen) : null;

    this.cargando = true; // Show a global loader or a row-specific loader
    nota.nota_final_calculada = this.calcularNotaFinal(nota);

    // Create a plain Nota object without the 'editando' property for the service call
    const { editando, ...notaToSave } = nota;

    try {
      const actualizada = await this.supabaseService.updateNota(notaToSave as Nota); // Cast to Nota
      if (actualizada) {
        const index = this.notas.findIndex(n => n.id === actualizada.id);
        if (index > -1) {
          this.notas[index] = { ...actualizada, editando: false };
          this.cdRef.detectChanges();
        }
        this.mostrarMensaje('Nota actualizada correctamente.');
      } else {
        this.mostrarMensaje('Error al actualizar la nota. No se recibieron datos actualizados.', true);
        nota.editando = true; // Keep editing if update failed
      }
    } catch (error) {
      console.error('Error guardando nota:', error);
      this.mostrarMensaje('Error crítico al actualizar la nota. Verifique la consola.', true);
      nota.editando = true; // Keep editing on critical error
    } finally {
      this.cargando = false;
      this.cdRef.detectChanges();
    }
  }

  cancelarEdicion(nota: NotaView): void {
    // To revert changes, we reload the notes or fetch the original state of the specific note.
    // For simplicity, reloading all notes if a change was made and cancelled.
    // A more sophisticated approach would be to store the original state of the row before editing.
    this.cargarNotas(true); // Pass true to indicate it's part of an ongoing operation, not initial load
    const notaEnLista = this.notas.find(n => n.id === nota.id);
    if (notaEnLista) {
        notaEnLista.editando = false;
    }
    this.cdRef.detectChanges();
  }

  calcularNotaFinal(nota: NotaView): number | null {
    const ev1 = nota.evaluacion1 ?? null;
    const ev2 = nota.evaluacion2 ?? null;
    const evFinal = nota.evaluacion_final_examen ?? null;

    // If any contributing score is null, the final grade cannot be calculated yet.
    if (ev1 === null || ev2 === null || evFinal === null) {
        return null;
    }
    // Weights: Eval1 (20%), Eval2 (30%), FinalExam (50%)
    const finalScore = (Number(ev1) * 0.2) + (Number(ev2) * 0.3) + (Number(evFinal) * 0.5);
    return parseFloat(finalScore.toFixed(2));
  }

  getCalificacionTexto(notaFinal: number | null | undefined): string {
    if (notaFinal === null || notaFinal === undefined) return 'N/A';
    if (notaFinal >= 9) return 'Sobresaliente';
    if (notaFinal >= 7) return 'Notable';
    if (notaFinal >= 5) return 'Suficiente';
    return 'Insuficiente';
  }

  getCalificacionClase(notaFinal: number | null | undefined): string {
    if (notaFinal === null || notaFinal === undefined) return 'calificacion-na'; // Added a class for N/A
    if (notaFinal >= 9) return 'calificacion-sobresaliente';
    if (notaFinal >= 7) return 'calificacion-notable';
    if (notaFinal >= 5) return 'calificacion-suficiente';
    return 'calificacion-insuficiente';
  }

  exportarNotas(): void {
    if (this.notas.length === 0) {
      this.mostrarMensaje('No hay notas para exportar.', true);
      return;
    }
    this.cargando = true;
    // Simple CSV export
    const headers = ['Estudiante', 'Curso', 'Asignatura', 'Periodo', 'Eval1', 'Eval2', 'ExamenFinal', 'NotaFinal', 'Calificación'];
    const rows = this.notas.map(nota => [
      nota.estudiante_nombre,
      nota.curso,
      nota.asignatura,
      nota.periodo,
      nota.evaluacion1 ?? '',
      nota.evaluacion2 ?? '',
      nota.evaluacion_final_examen ?? '',
      nota.nota_final_calculada ?? '',
      this.getCalificacionTexto(nota.nota_final_calculada)
    ].join(','));

    const csvContent = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'notas_exportadas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.cargando = false;
    this.mostrarMensaje('Notas exportadas correctamente.');
  }

  // Placeholder for adding a new note - would typically involve a dialog or a separate form
  // agregarNuevaNota(): void {
  //   // Open a dialog or navigate to a form to create a new Nota
  //   // For example, using MatDialog:
  //   // const dialogRef = this.dialog.open(NotaFormDialogComponent, { width: '400px' });
  //   // dialogRef.afterClosed().subscribe(result => {
  //   //   if (result) { // result would be the new Nota object
  //   //     this.supabaseService.createNota(result).then(nuevaNota => {
  //   //       if (nuevaNota) {
  //   //         this.notas.push({...nuevaNota, editando: false });
  //   //         this.cdRef.detectChanges();
  //   //         this.mostrarMensaje('Nota agregada correctamente.');
  //   //       } else {
  //   //         this.mostrarMensaje('Error al agregar la nota.', true);
  //   //       }
  //   //     });
  //   //   }
  //   // });
  //   this.mostrarMensaje('Funcionalidad de agregar nueva nota no implementada en este ejemplo.');
  // }

  // Placeholder for deleting a note
  // async eliminarNota(id: number): Promise<void> {
  //   if (!confirm('¿Está seguro de que desea eliminar esta nota?')) return;
  //   this.cargando = true;
  //   try {
  //     const success = await this.supabaseService.deleteNota(id);
  //     if (success) {
  //       this.notas = this.notas.filter(n => n.id !== id);
  //       this.cdRef.detectChanges();
  //       this.mostrarMensaje('Nota eliminada correctamente.');
  //     } else {
  //       this.mostrarMensaje('Error al eliminar la nota.', true);
  //     }
  //   } catch (error) {
  //     this.mostrarMensaje('Error crítico al eliminar la nota.', true);
  //     console.error('Error eliminando nota:', error);
  //   } finally {
  //     this.cargando = false;
  //   }
  // }

  mostrarMensaje(mensaje: string, esError: boolean = false): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: esError ? 5000 : 3000,
      verticalPosition: 'top', // Consider top or bottom position
      horizontalPosition: 'center', // Or 'start', 'end'
      panelClass: esError ? ['snackbar-error'] : ['snackbar-success']
    });
  }
}
