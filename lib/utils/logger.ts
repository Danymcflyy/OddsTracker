/**
 * Structured Logger
 * Provides JSON-formatted logging for better observability
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const env = process.env.NODE_ENV;
    
    // In production, skip debug logs
    if (env === 'production' && level === 'debug') {
      return false;
    }
    
    return true;
  }

  private formatLog(level: LogLevel, message: string, meta?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      ...meta,
    };
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (!this.shouldLog('debug')) return;
    console.log(JSON.stringify(this.formatLog('debug', message, meta)));
  }

  info(message: string, meta?: Record<string, any>): void {
    if (!this.shouldLog('info')) return;
    console.log(JSON.stringify(this.formatLog('info', message, meta)));
  }

  warn(message: string, meta?: Record<string, any>): void {
    if (!this.shouldLog('warn')) return;
    console.warn(JSON.stringify(this.formatLog('warn', message, meta)));
  }

  error(message: string, error?: Error, meta?: Record<string, any>): void {
    if (!this.shouldLog('error')) return;
    
    const logEntry = this.formatLog('error', message, {
      error: error?.message,
      stack: error?.stack,
      name: error?.name,
      ...meta,
    });
    
    console.error(JSON.stringify(logEntry));
  }

  /**
   * Log API request/response
   */
  apiCall(params: {
    method: string;
    url: string;
    statusCode?: number;
    duration?: number;
    error?: Error;
  }): void {
    const { method, url, statusCode, duration, error } = params;
    
    if (error) {
      this.error('API call failed', error, { method, url, statusCode, duration });
    } else {
      this.info('API call', { method, url, statusCode, duration });
    }
  }

  /**
   * Log database query
   */
  dbQuery(params: {
    operation: string;
    table: string;
    duration?: number;
    rowCount?: number;
    error?: Error;
  }): void {
    const { operation, table, duration, rowCount, error } = params;
    
    if (error) {
      this.error('Database query failed', error, { operation, table, duration });
    } else {
      this.debug('Database query', { operation, table, duration, rowCount });
    }
  }

  /**
   * Log job execution
   */
  job(params: {
    name: string;
    status: 'started' | 'completed' | 'failed';
    duration?: number;
    result?: any;
    error?: Error;
  }): void {
    const { name, status, duration, result, error } = params;
    
    if (status === 'failed' && error) {
      this.error(`Job ${name} failed`, error, { duration, result });
    } else if (status === 'completed') {
      this.info(`Job ${name} completed`, { duration, result });
    } else {
      this.info(`Job ${name} started`);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
