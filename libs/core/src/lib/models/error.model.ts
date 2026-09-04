/**
 * Standardized error model for the application
 * Classifies errors by type for proper handling and user feedback
 */

export enum ErrorType {
  // Network errors
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  NO_INTERNET = 'NO_INTERNET',

  // Server errors
  SERVER = 'SERVER',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  BAD_GATEWAY = 'BAD_GATEWAY',

  // Client errors
  VALIDATION = 'VALIDATION',
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',

  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Business logic errors
  CONFLICT = 'CONFLICT',
  BUSINESS_RULE = 'BUSINESS_RULE',

  // Unknown
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorDetails {
  code?: string;
  path?: string;
  timestamp?: number;
  traceId?: string;
  [key: string]: unknown;
}

export class AppError extends Error {
  readonly type: ErrorType;
  readonly status?: number;
  readonly severity: ErrorSeverity;
  override readonly message: string;
  readonly details?: ErrorDetails;
  readonly originalError?: unknown;
  readonly userFacingMessage: string;

  constructor(options: {
    type: ErrorType;
    message: string;
    userFacingMessage?: string;
    status?: number;
    severity?: ErrorSeverity;
    details?: ErrorDetails;
    originalError?: unknown;
  }) {
    const {
      type,
      message,
      userFacingMessage,
      status,
      severity = ErrorSeverity.MEDIUM,
      details,
      originalError,
    } = options;

    super(message);
    this.name = 'AppError';
    this.type = type;
    this.status = status;
    this.severity = severity;
    this.message = message;
    this.details = details;
    this.originalError = originalError;
    this.userFacingMessage = userFacingMessage || this.getDefaultUserMessage(type);

    // Maintain prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  private getDefaultUserMessage(type: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: 'Network error. Please check your connection.',
      [ErrorType.TIMEOUT]: 'Request timeout. Please try again.',
      [ErrorType.NO_INTERNET]: 'No internet connection.',
      [ErrorType.SERVER]: 'Server error. Please try again later.',
      [ErrorType.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable.',
      [ErrorType.BAD_GATEWAY]: 'Service temporarily unavailable.',
      [ErrorType.VALIDATION]: 'Invalid input. Please check your data.',
      [ErrorType.BAD_REQUEST]: 'Invalid request.',
      [ErrorType.NOT_FOUND]: 'Resource not found.',
      [ErrorType.UNAUTHORIZED]: 'Please log in to continue.',
      [ErrorType.FORBIDDEN]: 'You don\'t have permission to perform this action.',
      [ErrorType.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
      [ErrorType.CONFLICT]: 'This action conflicts with existing data.',
      [ErrorType.BUSINESS_RULE]: 'This action violates a business rule.',
      [ErrorType.UNKNOWN]: 'Something went wrong. Please try again.',
    };

    return messages[type] || messages[ErrorType.UNKNOWN];
  }

  /**
   * Convert HTTP error to AppError
   */
  static fromHttpError(
    status: number,
    errorBody?: unknown,
    traceId?: string
  ): AppError {
    let type: ErrorType;
    let severity: ErrorSeverity;
    let details: ErrorDetails | undefined;

    // Determine error type based on status code
    switch (status) {
      case 400:
        type = ErrorType.BAD_REQUEST;
        severity = ErrorSeverity.LOW;
        break;
      case 401:
        type = ErrorType.UNAUTHORIZED;
        severity = ErrorSeverity.HIGH;
        break;
      case 403:
        type = ErrorType.FORBIDDEN;
        severity = ErrorSeverity.MEDIUM;
        break;
      case 404:
        type = ErrorType.NOT_FOUND;
        severity = ErrorSeverity.LOW;
        break;
      case 409:
        type = ErrorType.CONFLICT;
        severity = ErrorSeverity.MEDIUM;
        break;
      case 422:
        type = ErrorType.VALIDATION;
        severity = ErrorSeverity.LOW;
        break;
      case 503:
        type = ErrorType.SERVICE_UNAVAILABLE;
        severity = ErrorSeverity.CRITICAL;
        break;
      case 502:
        type = ErrorType.BAD_GATEWAY;
        severity = ErrorSeverity.CRITICAL;
        break;
      case 500:
      case 501:
        type = ErrorType.SERVER;
        severity = ErrorSeverity.HIGH;
        break;
      default:
        if (status >= 500) {
          type = ErrorType.SERVER;
          severity = ErrorSeverity.HIGH;
        } else {
          type = ErrorType.UNKNOWN;
          severity = ErrorSeverity.MEDIUM;
        }
    }

    // Extract message from error body if available
    let message = `HTTP Error ${status}`;
    if (errorBody && typeof errorBody === 'object') {
      const errorObj = errorBody as Record<string, unknown>;
      if (errorObj['message']) {
        message = String(errorObj['message']);
      } else if (errorObj['error']) {
        message = String(errorObj['error']);
      }
    }

    // Build details object
    if (errorBody && typeof errorBody === 'object') {
      const errorObj = errorBody as Record<string, unknown>;
      details = {
        code: typeof errorObj['code'] === 'string' ? errorObj['code'] : undefined,
        ...errorObj,
      };
    }

    if (traceId) {
      details = { ...details, traceId };
    }

    return new AppError({
      type,
      status,
      message,
      severity,
      details,
      originalError: errorBody,
    });
  }

  /**
   * Convert client/network error to AppError
   */
  static fromClientError(error: unknown, traceId?: string): AppError {
    let type = ErrorType.UNKNOWN;
    let message = 'Unknown error occurred';

    if (error instanceof TypeError) {
      if (
        error.message.includes('fetch') ||
        error.message.includes('network')
      ) {
        type = ErrorType.NETWORK;
        message = 'Network request failed';
      } else {
        message = error.message;
      }
    } else if (error instanceof Error) {
      message = error.message;

      if (message.includes('timeout')) {
        type = ErrorType.TIMEOUT;
      } else if (message.includes('offline') || message.includes('internet')) {
        type = ErrorType.NO_INTERNET;
      }
    } else if (typeof error === 'string') {
      message = error;
    }

    const details: ErrorDetails = {};
    if (traceId) {
      details.traceId = traceId;
    }

    return new AppError({
      type,
      message,
      severity: ErrorSeverity.HIGH,
      details: Object.keys(details).length > 0 ? details : undefined,
      originalError: error,
    });
  }

  /**
   * Check if error is a network/connectivity issue
   */
  isNetworkError(): boolean {
    return [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.NO_INTERNET,
      ErrorType.SERVICE_UNAVAILABLE,
      ErrorType.BAD_GATEWAY,
    ].includes(this.type);
  }

  /**
   * Check if error is auth-related
   */
  isAuthError(): boolean {
    return [
      ErrorType.UNAUTHORIZED,
      ErrorType.FORBIDDEN,
      ErrorType.SESSION_EXPIRED,
    ].includes(this.type);
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    // Network, timeout, and 503 are retryable
    return this.isNetworkError() || this.type === ErrorType.CONFLICT;
  }
}
