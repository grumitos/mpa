import { Component, Output, EventEmitter, ViewEncapsulation, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {
  @Output() collapseToggle = new EventEmitter<boolean>();
  
  isCollapsed = false;
  theme: 'light' | 'dark' = 'dark';
  isUserMenuOpen = false;
  
  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/asistencia', icon: 'how_to_reg', label: 'Asistencia' },
    { path: '/notas', icon: 'note', label: 'Notas' },
    { path: '/economia', icon: 'attach_money', label: 'Economía' },
    { path: '/gestion-academica', icon: 'book', label: 'Gestión Académica' },
    { path: '/psi', icon: 'favorite', label: 'PSI' },
    { path: '/planificador', icon: 'assignment', label: 'Planificador' },
    { path: '/incidencias', icon: 'warning', label: 'Incidencias' },
    { path: '/horario', icon: 'schedule', label: 'Horario' },
    { path: '/usuarios', icon: 'people', label: 'Usuarios' }
  ];

  constructor(private authService: AuthService) {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    this.theme = savedTheme || 'dark';
    document.documentElement.classList.add(`theme-${this.theme}`);
  }
  
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseToggle.emit(this.isCollapsed);
  }
  
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${this.theme}`);
    localStorage.setItem('theme', this.theme);
  }
  
  toggleUserMenu(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isUserMenuOpen) {
      const userMenuElement = document.querySelector('.user-dropdown-menu');
      const userProfileElement = document.querySelector('.user-profile-preview');
      
      if (userMenuElement && userProfileElement) {
        const clickedInsideMenu = userMenuElement.contains(event.target as Node);
        const clickedOnProfile = userProfileElement.contains(event.target as Node);
        
        if (!clickedInsideMenu && !clickedOnProfile) {
          this.isUserMenuOpen = false;
        }
      }
    }
  }
  
  logout() {
    this.authService.logout();
    this.isUserMenuOpen = false;
  }
}
