import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthInterceptor } from './auth.interceptor';
import { environment } from '../environments/environment';

describe('AuthInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('adds the token to requests to the API', () => {
    sessionStorage.setItem('authToken', 'token-de-prueba');

    client.get(`${environment.apiUrl}/test-auth/`).subscribe();

    const req = http.expectOne(`${environment.apiUrl}/test-auth/`);
    expect(req.request.headers.get('Authorization')).toBe('Token token-de-prueba');
    req.flush({});
  });

  it('does not send the token to other hosts', () => {
    sessionStorage.setItem('authToken', 'token-de-prueba');

    client.get('https://otro-servidor.example.com/datos').subscribe();

    const req = http.expectOne('https://otro-servidor.example.com/datos');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('leaves requests untouched without a token', () => {
    client.get(`${environment.apiUrl}/login/`).subscribe();

    const req = http.expectOne(`${environment.apiUrl}/login/`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
