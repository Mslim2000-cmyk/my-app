import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - logout user
        authService.logout();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        // Forbidden - redirect to dashboard
        router.navigate(['/dashboard']);
      }
      
      // You can show toast notification here
      console.error('HTTP Error:', error);
      return throwError(() => error);
    })
  );
};