import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { AuthGuard, GuestGuard } from './auth.guard';

describe('route guards', () => {
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('AuthGuard', () => {
    it('redirects to the login without a token', () => {
      const result = TestBed.inject(AuthGuard).canActivate();

      expect(result instanceof UrlTree).toBeTrue();
      expect(router.serializeUrl(result as UrlTree)).toBe('/login');
    });

    it('allows access with a token in either storage', () => {
      sessionStorage.setItem('authToken', 'token-de-prueba');
      expect(TestBed.inject(AuthGuard).canActivate()).toBeTrue();

      sessionStorage.clear();
      localStorage.setItem('authToken', 'token-de-prueba');
      expect(TestBed.inject(AuthGuard).canActivate()).toBeTrue();
    });
  });

  describe('GuestGuard', () => {
    it('allows access without a token', () => {
      expect(TestBed.inject(GuestGuard).canActivate()).toBeTrue();
    });

    it('redirects to the dashboard with a token', () => {
      localStorage.setItem('authToken', 'token-de-prueba');

      const result = TestBed.inject(GuestGuard).canActivate();

      expect(result instanceof UrlTree).toBeTrue();
      expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
    });
  });
});
