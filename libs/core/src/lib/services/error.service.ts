import { Injectable, inject, signal } from '@angular/core';
import { AppError, ErrorType, ErrorSeverity } from '../models/error.model';
import { Subject } from 'rxjs';
import { toast } from 'ngx-sonner';

export interface ErrorEvent {
  error: AppError;
  timestamp: number;
  dismissed?: boolean;
}

/**
 * Centralized error handling service
 * - Classifies and logs errors
 * - Provides reactive error state
 * - Triggers appropriate user feedback
 * - Tracks error history for debugging
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private errorSubject$ = new Subject<ErrorEvent>();
  private errorHistory = signal<ErrorEvent[]>([]);
  private maxHistorySize = 50;

  // Expose public observable
  error$ = this.errorSubject$.asObservable();

  // Current error (for UI display)
  private _currentError = signal<AppError | null>(null);
  currentError = this._currentError.asReadonly();

  /**
   * Handle an error with appropriate classification and user feedback
   */
  handle(error: unknown, context?: string): AppError {
    let appError: AppError;

    // Convert to AppError if needed
    if (error instanceof AppError) {
      appError = error;
    } else {
      appError = AppError.fromClientError(error);
    }

    // Log for debugging
    this.logError(appError, context);

    // Add to history
    this.addToHistory({ error: appError, timestamp: Date.now() });

    // Store as current error (can be used by error boundary/display)
    this._currentError.set(appError);

    // Emit event for subscribers
    this.errorSubject$.next({ error: appError, timestamp: Date.now() });

    // Show user feedback based on severity and type
    this.showUserFeedback(appError);

    return appError;
  }

  /**
   * Handle HTTP error with proper classification
   */
  handleHttpError(
    status: number,
    errorBody?: unknown,
    context?: string
  ): AppError {
    const appError = AppError.fromHttpError(status, errorBody);
    return this.handle(appError, context);
  }

  /**
   * Handle auth errors specifically
   */
  handleAuthError(message: string = 'Authentication failed'): AppError {
    const error = new AppError({
      type: ErrorType.UNAUTHORIZED,
      message,
      severity: ErrorSeverity.HIGH,
    });
    return this.handle(error, 'AUTH_ERROR');
  }

  /**
   * Handle session expiration
   */
  handleSessionExpired(): AppError {
    const error = new AppError({
      type: ErrorType.SESSION_EXPIRED,
      message: 'Your session has expired',
      severity: ErrorSeverity.HIGH,
    });
    return this.handle(error, 'SESSION_EXPIRED');
  }

  /**
   * Clear current error
   */
  clearCurrentError(): void {
    this._currentError.set(null);
  }

  /**
   * Get error history
   */
  getHistory(): ErrorEvent[] {
    return this.errorHistory();
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): ErrorEvent[] {
    return this.errorHistory().filter(e => e.error.type === type);
  }

  /**
   * Get errors since timestamp
   */
  getErrorsSince(timestamp: number): ErrorEvent[] {
    return this.errorHistory().filter(e => e.timestamp >= timestamp);
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory.set([]);
  }

  /**
   * Private helper: Log error for debugging/monitoring
   */
  private logError(error: AppError, context?: string): void {
    const logContext = context ? `[${context}]` : '';
    const logData = {
      type: error.type,
      status: error.status,
      severity: error.severity,
      message: error.message,
      details: error.details,
    };

    if (error.severity === ErrorSeverity.CRITICAL) {
      console.error(`${logContext} CRITICAL ERROR:`, logData, error.originalError);
      // In production, send to error tracking service (Sentry, etc.)
    } else if (error.severity === ErrorSeverity.HIGH) {
      console.warn(`${logContext} HIGH PRIORITY ERROR:`, logData);
    } else {
      console.log(`${logContext} Error:`, logData);
    }
  }

  /**
   * Private helper: Add error to history
   */
  private addToHistory(event: ErrorEvent): void {
    const history = this.errorHistory();
    const updated = [event, ...history];

    // Keep only recent errors (maintain size limit)
    if (updated.length > this.maxHistorySize) {
      this.errorHistory.set(updated.slice(0, this.maxHistorySize));
    } else {
      this.errorHistory.set(updated);
    }
  }

  /**
   * Private helper: Show appropriate user feedback
   */
  private showUserFeedback(error: AppError): void {
    // Some errors should not show toast (e.g., already handled by component)
    if (error.type === ErrorType.VALIDATION) {
      // Validation errors might be shown by form, so use info instead
      toast.info(error.userFacingMessage);
      return;
    }

    // Auth errors might redirect, so just log them
    if (error.type === ErrorType.UNAUTHORIZED || error.type === ErrorType.FORBIDDEN) {
      // These are typically handled by guards/interceptors
      return;
    }

    // Show toast for user feedback
    if (error.severity === ErrorSeverity.CRITICAL) {
      toast.error(error.userFacingMessage);
    } else if (
      error.severity === ErrorSeverity.HIGH ||
      error.severity === ErrorSeverity.MEDIUM
    ) {
      toast.error(error.userFacingMessage);
    } else {
      toast.info(error.userFacingMessage);
    }
  }
}
