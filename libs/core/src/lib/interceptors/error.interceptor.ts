import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AppError } from '../models/error.model';
import { ErrorService } from '../services/error.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const errorService = inject(ErrorService);
  const traceId = request.headers.get('X-Correlation-ID') ?? undefined;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) return throwError(() => error);
      const appError = AppError.fromHttpError(error.status, error.error, traceId);
      if (error.status === 403) {
        errorService.handleAuthError('You do not have permission to perform this action.');
      } else {
        errorService.handle(appError, `HTTP_${error.status}`);
      }
      return throwError(() => appError);
    }),
  );
};
