import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  rememberMe = false;
  loginError: string | null = null;
  showPassword = false;
  isLoading = false;

  constructor(private router: Router, private authService: AuthService) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.credentials.email || !this.credentials.password) {
      this.loginError = 'Email y contraseña son requeridos';
      return;
    }

    this.isLoading = true;
    this.loginError = null;

    this.authService.login(this.credentials.email, this.credentials.password, this.rememberMe)
      .subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          this.isLoading = false;
          this.router.navigateByUrl('/dashboard');
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.isLoading = false;
          if (error.error && error.error.error) {
            this.loginError = error.error.error;
          } else {
            this.loginError = 'Error de conexión. Inténtalo de nuevo.';
          }
        }
      });
  }
}
