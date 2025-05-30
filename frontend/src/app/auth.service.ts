import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

interface LoginResponse {
  token: string;
  user_id: number;
  email: string;
  rol: string;
}

interface User {
  id: number;
  email: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    // Verificar si hay un usuario logueado al inicializar el servicio
    this.checkCurrentUser();
  }

  private checkCurrentUser(): void {
    const token = this.getToken();
    if (token) {
      // Aquí podrías hacer una llamada al backend para obtener los datos del usuario
      // Por ahora, guardamos la información básica del localStorage
      const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (userInfo) {
        this.currentUserSubject.next(JSON.parse(userInfo));
      }
    }
  }  login(email: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, {
      email: email,
      password: password
    }).pipe(
      tap(response => {
        // Guardar el token
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('authToken', response.token);
        
        // Guardar información del usuario
        const userInfo = {
          id: response.user_id,
          email: response.email,
          rol: response.rol
        };
        storage.setItem('userInfo', JSON.stringify(userInfo));
        
        // Actualizar el subject
        this.currentUserSubject.next(userInfo);
      })
    );
  }

  logout(): void {
    // Eliminar token tanto de localStorage como de sessionStorage
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    
    // Limpiar el subject
    this.currentUserSubject.next(null);
    
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    // Intentar obtener el token de ambos storages
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.rol : null;
  }
}