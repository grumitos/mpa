import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'frontend';
  showSidebar = false;
  sidebarCollapsed = false;

  @ViewChild(SidebarComponent) sidebarComponent!: SidebarComponent;

  constructor(private router: Router, private cdr: ChangeDetectorRef, private authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      if (event instanceof NavigationEnd) {
        const isAuthenticated = this.authService.isLoggedIn();
        const path = event.urlAfterRedirects;
        const isLoginRoute = path === '/' || path === '/login';
        this.showSidebar = isAuthenticated && !isLoginRoute;
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    const isAuthenticated = this.authService.isLoggedIn();
    const currentUrl = this.router.url;
    const isLoginRoute = currentUrl === '/' || currentUrl === '/login';
    this.showSidebar = isAuthenticated && !isLoginRoute;
    this.cdr.detectChanges();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  onRouterOutletActivate(event: any) {
    const componentName = event.constructor.name;
    const isAuthenticated = this.authService.isLoggedIn();

    if (componentName === 'LoginComponent') {
      this.showSidebar = false;
    } else {
      this.showSidebar = isAuthenticated;
    }
    this.cdr.detectChanges();
  }

  onSidebarCollapseChange(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  isSidebarCurrentlyCollapsed(): boolean {
    return this.sidebarComponent && this.sidebarComponent.isCollapsed;
  }
}
