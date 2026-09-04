import { HttpInterceptorFn, HttpErrorResponse, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError, timeout } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const showGlobalLoading = new HttpContextToken<boolean>(() => false);
const REQUEST_TIMEOUT_MS = 10000;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const shouldShowLoading = req.context.get(showGlobalLoading);
  let activeGlobalLoading = false;

  if (shouldShowLoading) {
    activeGlobalLoading = true;
    loadingService.startGlobalLoading();
  }

  return next(req).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    catchError(error => {
      if (error && error.name === 'TimeoutError') {
        const timeoutError = new HttpErrorResponse({
          url: req.url,
          status: 408,
          statusText: 'Request Timeout',
          error: 'Yêu cầu quá thời gian cho phép. Vui lòng thử lại.',
        });
        return throwError(() => timeoutError);
      }
      return throwError(() => error);
    }),
    finalize(() => {
      if (activeGlobalLoading) {
        loadingService.stopGlobalLoading();
      }
    })
  );
};
