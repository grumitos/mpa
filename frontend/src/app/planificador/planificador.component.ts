import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-planificador',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './planificador.component.html',
  styleUrls: ['./planificador.component.scss']
})
export class PlanificadorComponent {
  displayedCount = 3;
  busqueda = '';
  selectedPlan: any = null;
  planeaciones = [
    { id: 1, dni: '00000001', nombre: 'Profesor', apellido: 'Ejemplo 1', idProfesor: 'AE0001', fechaEnviado: '01/04/25', fechaRecibido: '22/04/25', status: 'Aceptado', titulo: 'Planificación Trimestral', descripcion: 'Planificación para el primer trimestre del año escolar', fecha: new Date('2025-04-01') },
    { id: 2, dni: '00000002', nombre: 'Profesor', apellido: 'Ejemplo 2', idProfesor: 'AE0002', fechaEnviado: '15/04/25', fechaRecibido: '20/04/25', status: 'Rechazado', titulo: 'Planificación Mensual', descripcion: 'Planificación para el mes de abril', fecha: new Date('2025-04-15') },
    { id: 3, dni: '00000003', nombre: 'Profesor', apellido: 'Ejemplo 3', idProfesor: 'AE0003', fechaEnviado: '20/04/25', fechaRecibido: '-', status: 'Pendiente', titulo: 'Planificación Semanal', descripcion: 'Planificación para la tercera semana de abril', fecha: new Date('2025-04-20') }
  ];
  filteredPlaneaciones = [...this.planeaciones];
  resumen = { totalProfesores: 16, miembros: 55 };

  onSearch() {
    this.filteredPlaneaciones = this.planeaciones
      .filter(p => !this.busqueda || p.fechaEnviado.includes(this.busqueda) || p.fechaRecibido.includes(this.busqueda));
  }

  onNew() {
    console.log('Nueva planeación');
  }
  
  onEdit(plan: any) {
    console.log('Editar planificación', plan);
    // Aquí iría la lógica para editar una planificación
  }
  
  onDelete(id: number) {
    console.log('Eliminar planificación con ID:', id);
    // Aquí iría la lógica para eliminar una planificación
    this.filteredPlaneaciones = this.filteredPlaneaciones.filter(p => p.id !== id);
    this.planeaciones = this.planeaciones.filter(p => p.id !== id);
  }
  
  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'aceptado':
        return 'estado-aceptado';
      case 'rechazado':
        return 'estado-rechazado';
      case 'pendiente':
        return 'estado-pendiente';
      case 'en revisión':
        return 'estado-en-revision';
      default:
        return '';
    }
  }
}
