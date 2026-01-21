/**
 * Custom Error Classes
 * Provides structured error handling with specific error types
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'API rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}

export class QuotaExceededError extends ApiError {
  constructor(message = 'API quota exceeded') {
    super(message, 429, 'QUOTA_EXCEEDED');
    this.name = 'QuotaExceededError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, public originalError?: Error) {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

export class ExternalApiError extends ApiError {
  constructor(
    message: string,
    public provider: string,
    public originalError?: Error
  ) {
    super(message, 502, 'EXTERNAL_API_ERROR');
    this.name = 'ExternalApiError';
  }
}

/**
 * Helper to check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof RateLimitError || error instanceof QuotaExceededError) {
    return false; // Don't retry rate limits
  }

  if (error instanceof ApiError) {
    // Retry on 5xx errors, not on 4xx
    return error.statusCode >= 500;
  }

  return false; // Unknown errors - don't retry
}

/**
 * Helper to extract error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Helper to log errors with context
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const message = getErrorMessage(error);
  const errorData = {
    message,
    name: error instanceof Error ? error.name : 'UnknownError',
    stack: error instanceof Error ? error.stack : undefined,
    code: error instanceof ApiError ? error.code : undefined,
    statusCode: error instanceof ApiError ? error.statusCode : undefined,
    ...context,
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(errorData));
}
