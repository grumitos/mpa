import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-planificador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planificador.component.html',
  styleUrls: ['./planificador.component.scss']
})
export class PlanificadorComponent {
  displayedCount = 3;
  busqueda = '';
  planeaciones = [
    { dni: '00000001', nombre: 'Profesor', apellido: 'Ejemplo 1', idProfesor: 'AE0001', fechaEnviado: '01/04/25', fechaRecibido: '22/04/25', status: 'Aceptado' },
    { dni: '00000002', nombre: 'Profesor', apellido: 'Ejemplo 2', idProfesor: 'AE0002', fechaEnviado: '15/04/25', fechaRecibido: '20/04/25', status: 'Rechazado' },
    { dni: '00000003', nombre: 'Profesor', apellido: 'Ejemplo 3', idProfesor: 'AE0003', fechaEnviado: '20/04/25', fechaRecibido: '-', status: 'Pendiente' }
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
}
