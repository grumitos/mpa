import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };
  rememberMe = false;
  loginError: string | null = null;
  showPassword = false;

  constructor(private router: Router, private http: HttpClient) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Login attempt with:', this.credentials, 'Remember me:', this.rememberMe);
    this.http.post<{ token: string }>('http://localhost:8000/api/api-token-auth/', this.credentials)
      .subscribe({
        next: res => {
          this.loginError = null;
          if (this.rememberMe) {
            // guardar en localStorage (persistente)
            localStorage.setItem('authToken', res.token);
            sessionStorage.removeItem('authToken');
          } else {
            sessionStorage.setItem('authToken', res.token);
            localStorage.removeItem('authToken');
          }
          this.router.navigateByUrl('/dashboard');
        },
        error: () => {
          this.loginError = 'Credenciales incorrectas. Inténtalo de nuevo.';
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
        }
      });
  }
}
