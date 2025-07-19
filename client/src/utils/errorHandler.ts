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

    // Enhanced error categorization using predefined error constants
    // Configuration errors - check against CONFIG_ERRORS constants first
    const configErrorPatterns = [
      { pattern: ['webpack', 'dev server'], constant: CONFIG_ERRORS.WEBPACK_DEV_SERVER },
      { pattern: ['proxy', 'backend'], constant: CONFIG_ERRORS.PROXY_CONNECTION },
      { pattern: ['cors'], constant: CONFIG_ERRORS.CORS_ISSUE },
      { pattern: ['port'], constant: CONFIG_ERRORS.PORT_CONFLICT },
      { pattern: ['environment', 'env'], constant: CONFIG_ERRORS.MISSING_ENV }
    ];

    for (const { pattern } of configErrorPatterns) {
      if (pattern.some(keyword => lowerMessage.includes(keyword))) {
        return 'configuration';
      }
    }

    // Additional configuration error keywords
    if (lowerMessage.includes('allowedhosts') || 
        lowerMessage.includes('cannot resolve module') || 
        lowerMessage.includes('module not found')) {
      return 'configuration';
    }

    // Network errors - check against NETWORK_ERRORS constants first
    const networkErrorPatterns = [
      { pattern: ['connection', 'econnrefused'], constant: NETWORK_ERRORS.CONNECTION_FAILED },
      { pattern: ['timeout'], constant: NETWORK_ERRORS.TIMEOUT },
      { pattern: ['unavailable'], constant: NETWORK_ERRORS.SERVER_UNAVAILABLE },
      { pattern: ['api', 'fetch'], constant: NETWORK_ERRORS.API_ERROR }
    ];

    for (const { pattern } of networkErrorPatterns) {
      if (pattern.some(keyword => lowerMessage.includes(keyword))) {
        return 'network';
      }
    }

    // Additional network error keywords
    if (lowerMessage.includes('network error') || lowerMessage.includes('cors')) {
      return 'network';
    }

    // Server errors - enhanced with better pattern matching
    if (lowerMessage.includes('500') ||
        lowerMessage.includes('502') ||
        lowerMessage.includes('503') ||
        lowerMessage.includes('504') ||
        lowerMessage.includes('server error') ||
        lowerMessage.includes('internal server')) {
      return 'server';
    }

    // Validation errors - check against VALIDATION_ERRORS constants first
    const validationErrorPatterns = [
      { pattern: ['empty', 'required'], constant: VALIDATION_ERRORS.EMPTY_CONTENT },
      { pattern: ['invalid file type', 'file type'], constant: VALIDATION_ERRORS.INVALID_FILE_TYPE },
      { pattern: ['file size', 'too large', 'size limit'], constant: VALIDATION_ERRORS.FILE_TOO_LARGE },
      { pattern: ['invalid format', 'format'], constant: VALIDATION_ERRORS.INVALID_FORMAT }
    ];

    for (const { pattern } of validationErrorPatterns) {
      if (pattern.some(keyword => lowerMessage.includes(keyword))) {
        return 'validation';
      }
    }

    // Additional validation error keywords
    if (lowerMessage.includes('invalid') || lowerMessage.includes('validation')) {
      return 'validation';
    }

    // File errors - enhanced categorization
    if (lowerMessage.includes('file') ||
        lowerMessage.includes('upload') ||
        lowerMessage.includes('size') ||
        lowerMessage.includes('type')) {
      return 'file';
    }

    return 'unknown';
  }

  static formatErrorMessage(message: string, type: ErrorType): string {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced error message formatting using predefined constants with comprehensive message utilization
    switch (type) {
      case 'configuration':
        // Direct mapping to CONFIG_ERRORS constants with enhanced context
        if (lowerMessage.includes('webpack') || lowerMessage.includes('dev server')) {
          return `${CONFIG_ERRORS.WEBPACK_DEV_SERVER}: ${message}`;
        }
        if (lowerMessage.includes('proxy') || lowerMessage.includes('backend')) {
          return `${CONFIG_ERRORS.PROXY_CONNECTION}: ${message}`;
        }
        if (lowerMessage.includes('cors')) {
          return `${CONFIG_ERRORS.CORS_ISSUE}: ${message}`;
        }
        if (lowerMessage.includes('port')) {
          return `${CONFIG_ERRORS.PORT_CONFLICT}: ${message}`;
        }
        if (lowerMessage.includes('environment') || lowerMessage.includes('env')) {
          return `${CONFIG_ERRORS.MISSING_ENV}: ${message}`;
        }
        // Enhanced fallback patterns utilizing constants with original message context
        if (lowerMessage.includes('allowedhosts')) {
          return `${CONFIG_ERRORS.WEBPACK_DEV_SERVER}: ${message}`;
        }
        if (lowerMessage.includes('cannot resolve module') || lowerMessage.includes('module not found')) {
          return `Missing dependency detected: ${message}. Please run npm install.`;
        }
        // Return enhanced message with original context preserved
        return `Configuration error: ${message}`;

      case 'network':
        // Direct mapping to NETWORK_ERRORS constants with enhanced context
        if (lowerMessage.includes('connection') || lowerMessage.includes('econnrefused')) {
          return `${NETWORK_ERRORS.CONNECTION_FAILED}: ${message}`;
        }
        if (lowerMessage.includes('timeout')) {
          return `${NETWORK_ERRORS.TIMEOUT}: ${message}`;
        }
        if (lowerMessage.includes('unavailable')) {
          return `${NETWORK_ERRORS.SERVER_UNAVAILABLE}: ${message}`;
        }
        if (lowerMessage.includes('api') || lowerMessage.includes('fetch')) {
          return `${NETWORK_ERRORS.API_ERROR}: ${message}`;
        }
        if (lowerMessage.includes('cors')) {
          return `${CONFIG_ERRORS.CORS_ISSUE}: ${message}`;
        }
        // Enhanced fallback utilizing network error constants
        if (lowerMessage.includes('network error')) {
          return `${NETWORK_ERRORS.CONNECTION_FAILED}: ${message}`;
        }
        // Default network error with context
        return `${NETWORK_ERRORS.CONNECTION_FAILED}: ${message}`;

      case 'server':
        // Enhanced server error handling with better constant utilization
        if (lowerMessage.includes('500')) {
          return `Server internal error (500): ${message}`;
        }
        if (lowerMessage.includes('503') || lowerMessage.includes('unavailable')) {
          return `${NETWORK_ERRORS.SERVER_UNAVAILABLE}: ${message}`;
        }
        if (lowerMessage.includes('502') || lowerMessage.includes('504')) {
          return `${NETWORK_ERRORS.SERVER_UNAVAILABLE}: ${message}`;
        }
        // Enhanced server error with original message context
        return `Server error: ${message}`;

      case 'validation':
        // Direct mapping to VALIDATION_ERRORS constants with enhanced context
        if (lowerMessage.includes('empty') || lowerMessage.includes('required')) {
          return `${VALIDATION_ERRORS.EMPTY_CONTENT}: ${message}`;
        }
        if (lowerMessage.includes('file type') || lowerMessage.includes('invalid type')) {
          return `${VALIDATION_ERRORS.INVALID_FILE_TYPE}: ${message}`;
        }
        if (lowerMessage.includes('size') || lowerMessage.includes('large')) {
          return `${VALIDATION_ERRORS.FILE_TOO_LARGE}: ${message}`;
        }
        if (lowerMessage.includes('format') || lowerMessage.includes('invalid format')) {
          return `${VALIDATION_ERRORS.INVALID_FORMAT}: ${message}`;
        }
        // Enhanced fallback with validation constants
        if (lowerMessage.includes('invalid')) {
          return `${VALIDATION_ERRORS.INVALID_FORMAT}: ${message}`;
        }
        // Return original message for other validation errors with proper utilization
        return message;

      case 'file':
        // Enhanced file error handling using validation constants with better integration
        if (lowerMessage.includes('type') || lowerMessage.includes('invalid type')) {
          return `${VALIDATION_ERRORS.INVALID_FILE_TYPE}: ${message}`;
        }
        if (lowerMessage.includes('size') || lowerMessage.includes('large') || lowerMessage.includes('limit')) {
          return `${VALIDATION_ERRORS.FILE_TOO_LARGE}: ${message}`;
        }
        if (lowerMessage.includes('upload')) {
          return `File upload error: ${message}`;
        }
        // Enhanced file error with original message context
        return `File error: ${message}`;

      default:
        // Enhanced default case with proper message utilization
        return message; // Return original message for unknown errors
    }
  }

  static isRetryable(error: Error | string, type: ErrorType): boolean {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();
    
    // Configuration errors are usually not retryable without fixing the config
    if (type === 'configuration') {
      // Some configuration errors might be temporary (like port conflicts)
      if (lowerMessage.includes('port') && lowerMessage.includes('use')) {
        return true; // Port conflicts might resolve if other process stops
      }
      return false;
    }

    // Network and server errors are usually retryable, but check specific cases
    if (type === 'network' || type === 'server') {
      // Authentication errors are not retryable without credential changes
      if (lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden')) {
        return false;
      }
      // Rate limiting might be retryable after some time
      if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
        return true;
      }
      return true;
    }

    // Validation errors are not retryable without changing input
    if (type === 'validation' || type === 'file') {
      return false;
    }

    // For unknown errors, check message content for hints
    if (lowerMessage.includes('temporary') || lowerMessage.includes('retry')) {
      return true;
    }
    if (lowerMessage.includes('permanent') || lowerMessage.includes('invalid')) {
      return false;
    }

    // Default to retryable for unknown errors
    return true;
  }

  static getErrorSuggestion(error: EnhancedError): string | null {
    const lowerMessage = error.message.toLowerCase();
    
    switch (error.type) {
      case 'configuration':
        // Enhanced suggestions based on CONFIG_ERRORS constants
        if (lowerMessage.includes(CONFIG_ERRORS.WEBPACK_DEV_SERVER.toLowerCase()) || 
            lowerMessage.includes('allowedhosts')) {
          return 'Try adding DANGEROUSLY_DISABLE_HOST_CHECK=true to your .env file or check webpack dev server configuration';
        }
        if (lowerMessage.includes(CONFIG_ERRORS.PROXY_CONNECTION.toLowerCase()) || 
            lowerMessage.includes('proxy') || lowerMessage.includes('backend')) {
          return 'Start the backend server with "npm start" in the server directory or check proxy configuration';
        }
        if (lowerMessage.includes(CONFIG_ERRORS.CORS_ISSUE.toLowerCase()) || 
            lowerMessage.includes('cors')) {
          return 'Check CORS configuration on your server or add appropriate headers';
        }
        if (lowerMessage.includes(CONFIG_ERRORS.PORT_CONFLICT.toLowerCase()) || 
            lowerMessage.includes('port')) {
          return 'Try using a different port or stop the process using the current port';
        }
        if (lowerMessage.includes(CONFIG_ERRORS.MISSING_ENV.toLowerCase()) || 
            lowerMessage.includes('environment') || lowerMessage.includes('env')) {
          return 'Check your .env file and ensure all required environment variables are set';
        }
        if (lowerMessage.includes('dependency') || lowerMessage.includes('module not found')) {
          return 'Run "npm install" to install missing dependencies';
        }
        return 'Check your development environment configuration';

      case 'network':
        // Enhanced suggestions based on NETWORK_ERRORS constants
        if (lowerMessage.includes(NETWORK_ERRORS.CONNECTION_FAILED.toLowerCase()) || 
            lowerMessage.includes('connection')) {
          return 'Check your network connection and ensure the server is running';
        }
        if (lowerMessage.includes(NETWORK_ERRORS.TIMEOUT.toLowerCase()) || 
            lowerMessage.includes('timeout')) {
          return 'The request timed out. Try again or check if the server is responding slowly';
        }
        if (lowerMessage.includes(NETWORK_ERRORS.SERVER_UNAVAILABLE.toLowerCase()) || 
            lowerMessage.includes('unavailable')) {
          return 'The server is currently unavailable. Please try again later';
        }
        if (lowerMessage.includes(NETWORK_ERRORS.API_ERROR.toLowerCase()) || 
            lowerMessage.includes('api')) {
          return 'Check the API endpoint and ensure the server is running correctly';
        }
        if (lowerMessage.includes('port 4000')) {
          return 'Start the backend server with "npm start" in the server directory';
        }
        return 'Check your network connection and server status';

      case 'server':
        // Enhanced server error suggestions
        if (lowerMessage.includes('500')) {
          return 'Internal server error. Check server logs for detailed error information';
        }
        if (lowerMessage.includes('502') || lowerMessage.includes('504')) {
          return 'Gateway error. Check if the backend server is running and accessible';
        }
        if (lowerMessage.includes('503')) {
          return 'Service unavailable. The server may be temporarily overloaded or under maintenance';
        }
        return 'Check server logs for more details';

      case 'validation':
        // Enhanced suggestions based on VALIDATION_ERRORS constants
        if (lowerMessage.includes(VALIDATION_ERRORS.EMPTY_CONTENT.toLowerCase()) || 
            lowerMessage.includes('empty') || lowerMessage.includes('required')) {
          return 'Please provide the required content before proceeding';
        }
        if (lowerMessage.includes(VALIDATION_ERRORS.INVALID_FILE_TYPE.toLowerCase()) || 
            lowerMessage.includes('file type')) {
          return 'Please select a valid file type (supported formats may include PDF, DOC, TXT)';
        }
        if (lowerMessage.includes(VALIDATION_ERRORS.FILE_TOO_LARGE.toLowerCase()) || 
            lowerMessage.includes('size') || lowerMessage.includes('large')) {
          return 'Please select a smaller file or compress the current file';
        }
        if (lowerMessage.includes(VALIDATION_ERRORS.INVALID_FORMAT.toLowerCase()) || 
            lowerMessage.includes('format')) {
          return 'Please check the format and ensure it meets the required specifications';
        }
        return 'Please correct the input and try again';

      case 'file':
        // Enhanced file error suggestions using validation constants
        if (lowerMessage.includes('type') || lowerMessage.includes('invalid type')) {
          return 'Please select a valid file type (supported formats may include PDF, DOC, TXT)';
        }
        if (lowerMessage.includes('size') || lowerMessage.includes('large') || lowerMessage.includes('limit')) {
          return 'Please select a smaller file or compress the current file';
        }
        if (lowerMessage.includes('upload')) {
          return 'File upload failed. Please try again or check your network connection';
        }
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