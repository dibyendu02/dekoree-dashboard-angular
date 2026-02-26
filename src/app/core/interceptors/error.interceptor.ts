import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        return throwError(() => error);
      }

      if (error.status === 0) {
        toast.error('Network error. Please check your connection.');
      } else if (error.status >= 500) {
        toast.error('Something went wrong. Please try again later.');
      }
      // 4xx errors are handled by the calling component for context-specific messages

      return throwError(() => error);
    })
  );
};
