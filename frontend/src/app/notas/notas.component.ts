import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notas',
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './notas.component.html',
  styleUrl: './notas.component.scss',
  standalone: true
})
export class NotasComponent {

}
