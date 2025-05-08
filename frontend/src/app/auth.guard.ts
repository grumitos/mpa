import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
      const isAuthenticated = !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
    return isAuthenticated ? true : this.router.parseUrl('/login');
  }
}

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const isAuthenticated = !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
    return !isAuthenticated ? true : this.router.parseUrl('/dashboard');
  }
}