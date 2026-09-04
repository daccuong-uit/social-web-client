import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { AppError, ErrorType } from '../models/error.model';

/**
 * Global Error Interceptor
 * Standardizes error handling and manages authentication failures (401/403).
 * Delegates to ErrorService for centralized error handling.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const errorService = inject(ErrorService);

  // Extract trace ID from response headers or generate one
  const traceId = req.headers.get('X-Correlation-ID') || undefined;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - Token Expired or Invalid
      if (
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/register') &&
        !req.url.includes('/auth/refresh')
      ) {
        console.warn('[API] 401 Unauthorized, attempting to refresh token...');

        // Attempt token refresh
        return authService.refresh().pipe(
          switchMap((res) => {
            if (res) {
              // Retry original request with new token
              const cloned = req.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` },
              });
              return next(cloned);
            } else {
              // Refresh failed, treat as session expired
              const appError = new AppError({
                type: ErrorType.SESSION_EXPIRED,
                message: 'Token refresh failed',
                status: 401,
              });
              errorService.handle(appError, 'TOKEN_REFRESH_FAILED');
              return throwError(() => appError);
            }
          }),
          catchError((err) => {
            // Token refresh errored (network issue, server error, etc.)
            if (err instanceof AppError) {
              errorService.handle(err, 'TOKEN_REFRESH_ERROR');
            } else {
              const appError = AppError.fromClientError(err, traceId);
              errorService.handle(appError, 'TOKEN_REFRESH_ERROR');
            }
            return throwError(() => err);
          })
        );
      }

      // Convert to AppError for all other HTTP errors
      const appError = AppError.fromHttpError(error.status, error.error, traceId);

      // Handle specific error types
      if (error.status === 403) {
        errorService.handleAuthError('You do not have permission to perform this action.');
      } else if (error.status === 401) {
        // 401 on auth endpoints or others not handled above
        errorService.handleAuthError('Authentication required.');
      } else {
        // All other errors
        errorService.handle(appError, `HTTP_${error.status}`);
      }

      return throwError(() => appError);
    })
  );
};


