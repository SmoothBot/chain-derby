/**
 * Production-safe logging utility
 * Filters out sensitive information in production builds
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogData {
  [key: string]: string | number | boolean | null | undefined | LogData | LogData[];
}

class Logger {
  private isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === 'development';

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  private sanitizeData(data: unknown): unknown {
    if (typeof data === 'string') {
      // Redact potential private keys, signatures, and sensitive hex strings
      if (data.startsWith('0x') && data.length > 20) {
        return `${data.substring(0, 6)}...${data.substring(data.length - 4)}`;
      }
      return data;
    }

    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeData(item));
      }
      
      const sanitized: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(data)) {
        // Skip sensitive fields
        const sensitiveFields = ['privateKey', 'signature', 'signedTransaction', 'nonce', 'gasPrice'];
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          sanitized[key] = '[REDACTED]';
          continue;
        }

        sanitized[key] = this.sanitizeData(value);
      }
      
      return sanitized;
    }

    return data;
  }

  private log(level: LogLevel, message: string, data?: LogData) {
    if (!this.shouldLog(level)) return;

    const sanitizedData = data ? this.sanitizeData(data) : undefined;
    
    switch (level) {
      case 'debug':
        console.debug(`[DEBUG] ${message}`, sanitizedData || '');
        break;
      case 'info':
        console.info(`[INFO] ${message}`, sanitizedData || '');
        break;
      case 'warn':
        console.warn(`[WARN] ${message}`, sanitizedData || '');
        break;
      case 'error':
        console.error(`[ERROR] ${message}`, sanitizedData || '');
        break;
    }
  }

  debug(message: string, data?: LogData) {
    this.log('debug', message, data);
  }

  info(message: string, data?: LogData) {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogData) {
    this.log('warn', message, data);
  }

  error(message: string, data?: LogData) {
    this.log('error', message, data);
  }
}

export const logger = new Logger();