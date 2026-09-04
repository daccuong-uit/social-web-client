import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService, CacheService, LoadingService, AppError } from '@fe/core';
import { Observable, tap, finalize, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { urlConfig } from '@fe/core';

export interface AuthFacadeState {
  isLoading: boolean;
  isSubmitting: boolean;
  user: any | null;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * Facade/Data-Access layer for authentication
 * - Decouples components from service details
 * - Centralizes loading/error handling
 * - Manages cache invalidation
 *
 * Usage in components:
 * authFacade.login(credentials).subscribe({
 *   next: () => router.navigate(['/dashboard']),
 *   error: (err) => handleError(err)
 * })
 */
@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private authService = inject(AuthService);
  private cacheService = inject(CacheService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  // State signals
  private _isLoading = signal(false);
  private _isSubmitting = signal(false);
  private _error = signal<string | null>(null);

  // Expose as readonly
  isLoading$ = this._isLoading.asReadonly();
  isSubmitting$ = this._isSubmitting.asReadonly();
  error$ = this._error.asReadonly();
  user$ = this.authService.user;
  isAuthenticated$ = this.authService.isAuthenticated;

  // Computed
  isBusy = computed(() => this._isLoading() || this._isSubmitting());

  /**
   * Login user
   * - Show loading state
   * - Handle errors
   * - Invalidate profile cache
   */
  login(credentials: Record<string, unknown>): Observable<any> {
    this._isSubmitting.set(true);
    this._error.set(null);
    this.loadingService.startButtonLoading('login-btn');

    return this.authService.login(credentials).pipe(
      tap(() => {
        // Invalidate user-related caches
        this.cacheService.invalidate(urlConfig.profile.me);
        this._error.set(null);
      }),
      catchError((err) => {
        // Error already handled (toast shown) by the global error interceptor.
        // Just capture the message into local state.
        const message = err instanceof AppError ? err.message : 'Đăng nhập thất bại.';
        this._error.set(message);
        throw err;
      }),
      finalize(() => {
        this._isSubmitting.set(false);
        this.loadingService.stopButtonLoading('login-btn');
      })
    );
  }

  /**
   * Register user
   */
  register(data: Record<string, unknown>): Observable<any> {
    this._isSubmitting.set(true);
    this._error.set(null);
    this.loadingService.startButtonLoading('register-btn');

    return this.authService.register(data).pipe(
      tap(() => {
        this.cacheService.invalidate(urlConfig.profile.me);
        this._error.set(null);
      }),
      catchError((err) => {
        // Error already handled (toast shown) by the global error interceptor.
        const message = err instanceof AppError ? err.message : 'Đăng ký thất bại.';
        this._error.set(message);
        throw err;
      }),
      finalize(() => {
        this._isSubmitting.set(false);
        this.loadingService.stopButtonLoading('register-btn');
      })
    );
  }

  /**
   * Send OTP
   */
  sendOtp(phoneNumber: string): Observable<any> {
    this._error.set(null);
    this.loadingService.startButtonLoading('send-otp-btn');

    return this.authService.sendOtp(phoneNumber).pipe(
      tap(() => {
        this._error.set(null);
      }),
      catchError((err) => {
        // Error already handled (toast shown) by the global error interceptor.
        const message = err instanceof AppError ? err.message : 'Gửi OTP thất bại.';
        this._error.set(message);
        throw err;
      }),
      finalize(() => {
        this.loadingService.stopButtonLoading('send-otp-btn');
      })
    );
  }

  /**
   * Change Password
   */
  changePassword(data: Record<string, unknown>): Observable<any> {
    this._isSubmitting.set(true);
    this._error.set(null);
    this.loadingService.startButtonLoading('change-pwd-btn');

    return this.authService.changePassword(data).pipe(
      tap(() => {
        this._error.set(null);
      }),
      catchError((err) => {
        const message = err instanceof AppError ? err.message : 'Đổi mật khẩu thất bại.';
        this._error.set(message);
        throw err;
      }),
      finalize(() => {
        this._isSubmitting.set(false);
        this.loadingService.stopButtonLoading('change-pwd-btn');
      })
    );
  }

  /**
   * Logout user
   * - Clear cache
   * - Clear state
   * - Navigate to login
   */
  logout(): void {
    this.authService.logout();
    this.cacheService.invalidateByPattern('.*'); // Clear all cache
    this._error.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<any> {
    return this.authService.refresh().pipe(
      catchError(() => {
        // Token refresh errors are handled by the interceptor.
        return of(undefined);
      })
    );
  }

  /**
   * Check authentication status
   */
  checkAuth(): void {
    this._isLoading.set(true);
    this.authService.checkAuth();
    // checkAuth loads async, so we track separately
    setTimeout(() => this._isLoading.set(false), 100);
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this._error.set(null);
  }
}
