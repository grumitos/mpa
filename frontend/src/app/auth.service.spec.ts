import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

const LOGIN_RESPONSE = { token: 'token-de-prueba', user_id: 7, email: 'profe@example.com', rol: 'profesor' };

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  function login(rememberMe: boolean): void {
    service.login('profe@example.com', 'clave', rememberMe).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/login/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'profe@example.com', password: 'clave' });
    req.flush(LOGIN_RESPONSE);
  }

  it('starts logged out', () => {
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getCurrentUser()).toBeNull();
    expect(service.getUserRole()).toBeNull();
  });

  it('keeps the token in sessionStorage by default', () => {
    login(false);

    expect(sessionStorage.getItem('authToken')).toBe('token-de-prueba');
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.getUserRole()).toBe('profesor');
  });

  it('keeps the token in localStorage when "remember me" is checked', () => {
    login(true);

    expect(localStorage.getItem('authToken')).toBe('token-de-prueba');
    expect(sessionStorage.getItem('authToken')).toBeNull();
  });

  it('clears the session and goes back to the login on logout', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate');
    login(true);

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('userInfo')).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
