import { EnhancedError, ErrorType, CONFIG_ERRORS, NETWORK_ERRORS, VALIDATION_ERRORS } from '../types/ErrorTypes';

export class ErrorHandler {
  static createEnhancedError(
    error: Error | string,
    type: ErrorType = 'unknown',
    component?: string,
    retryable: boolean = true
  ): EnhancedError {
    const message = typeof error === 'string' ? error : error.message;
    const details = typeof error === 'string' ? undefined : error.stack;

    return {
      message: this.formatErrorMessage(message, type),
      type,
      retryable,
      details,
      timestamp: Date.now(),
      component
    };
  }

  static categorizeError(error: Error | string): ErrorType {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();

    // Configuration errors
    if (lowerMessage.includes('allowedhosts') || 
        lowerMessage.includes('webpack') ||
        lowerMessage.includes('dev server') ||
        lowerMessage.includes('cannot resolve module') ||
        lowerMessage.includes('module not found')) {
      return 'configuration';
    }

    // Network errors
    if (lowerMessage.includes('network error') ||
        lowerMessage.includes('fetch') ||
        lowerMessage.includes('cors') ||
        lowerMessage.includes('connection') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('econnrefused')) {
      return 'network';
    }

    // Server errors
    if (lowerMessage.includes('500') ||
        lowerMessage.includes('502') ||
        lowerMessage.includes('503') ||
        lowerMessage.includes('504') ||
        lowerMessage.includes('server error') ||
        lowerMessage.includes('internal server')) {
      return 'server';
    }

    // Validation errors
    if (lowerMessage.includes('invalid') ||
        lowerMessage.includes('required') ||
        lowerMessage.includes('empty') ||
        lowerMessage.includes('format') ||
        lowerMessage.includes('validation')) {
      return 'validation';
    }

    // File errors
    if (lowerMessage.includes('file') ||
        lowerMessage.includes('upload') ||
        lowerMessage.includes('size') ||
        lowerMessage.includes('type')) {
      return 'file';
    }

    return 'unknown';
  }

  static formatErrorMessage(message: string, type: ErrorType): string {
    // Return user-friendly messages for common errors
    switch (type) {
      case 'configuration':
        if (message.includes('allowedHosts')) {
          return 'Development server configuration issue. Please check your environment setup.';
        }
        if (message.includes('Cannot resolve module')) {
          return 'Missing dependency detected. Please run npm install.';
        }
        return 'Configuration error detected. Please check your setup.';

      case 'network':
        if (message.includes('ECONNREFUSED')) {
          return 'Cannot connect to server. Please ensure the backend is running on port 4000.';
        }
        if (message.includes('timeout')) {
          return 'Request timed out. Please check your connection and try again.';
        }
        if (message.includes('CORS')) {
          return 'Cross-origin request blocked. Please check proxy configuration.';
        }
        return 'Network connection failed. Please check your connection.';

      case 'server':
        if (message.includes('500')) {
          return 'Server encountered an internal error. Please try again later.';
        }
        if (message.includes('503')) {
          return 'Server is temporarily unavailable. Please try again later.';
        }
        return 'Server error occurred. Please try again.';

      case 'validation':
        return message; // Validation messages are usually user-friendly

      case 'file':
        return message; // File error messages are usually user-friendly

      default:
        return message;
    }
  }

  static isRetryable(error: Error | string, type: ErrorType): boolean {
    const message = typeof error === 'string' ? error : error.message;
    
    // Configuration errors are usually not retryable without fixing the config
    if (type === 'configuration') {
      return false;
    }

    // Network and server errors are usually retryable
    if (type === 'network' || type === 'server') {
      return true;
    }

    // Validation errors are not retryable without changing input
    if (type === 'validation' || type === 'file') {
      return false;
    }

    // Default to retryable for unknown errors
    return true;
  }

  static getErrorSuggestion(error: EnhancedError): string | null {
    switch (error.type) {
      case 'configuration':
        if (error.message.includes('allowedHosts')) {
          return 'Try adding DANGEROUSLY_DISABLE_HOST_CHECK=true to your .env file';
        }
        if (error.message.includes('dependency')) {
          return 'Run "npm install" to install missing dependencies';
        }
        return 'Check your development environment configuration';

      case 'network':
        if (error.message.includes('port 4000')) {
          return 'Start the backend server with "npm start" in the server directory';
        }
        return 'Check your network connection and server status';

      case 'server':
        return 'Check server logs for more details';

      case 'validation':
        return 'Please correct the input and try again';

      case 'file':
        return 'Please check the file format and size requirements';

      default:
        return null;
    }
  }

  static logError(error: EnhancedError): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${error.type.toUpperCase()} ERROR`);
      console.error('Message:', error.message);
      console.error('Type:', error.type);
      console.error('Component:', error.component || 'Unknown');
      console.error('Timestamp:', new Date(error.timestamp).toLocaleString());
      console.error('Retryable:', error.retryable);
      if (error.details) {
        console.error('Details:', error.details);
      }
      const suggestion = this.getErrorSuggestion(error);
      if (suggestion) {
        console.info('💡 Suggestion:', suggestion);
      }
      console.groupEnd();
    }
  }
}