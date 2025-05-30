import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken');
    const apiUrl = environment.apiUrl; // Usar environment
    if (token && req.url.startsWith(apiUrl)) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Token ${token}`
        }
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}