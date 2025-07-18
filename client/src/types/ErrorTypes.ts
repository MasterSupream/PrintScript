export type ErrorType = 'network' | 'validation' | 'server' | 'configuration' | 'file' | 'unknown';

export interface EnhancedError {
  message: string;
  type: ErrorType;
  retryable: boolean;
  details?: string;
  timestamp: number;
  component?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

// Configuration-related error messages
export const CONFIG_ERRORS = {
  WEBPACK_DEV_SERVER: 'Development server configuration issue detected',
  PROXY_CONNECTION: 'Unable to connect to backend server',
  CORS_ISSUE: 'Cross-origin request blocked',
  PORT_CONFLICT: 'Port already in use',
  MISSING_ENV: 'Required environment variables missing'
} as const;

// Network error messages
export const NETWORK_ERRORS = {
  CONNECTION_FAILED: 'Network connection failed',
  TIMEOUT: 'Request timed out',
  SERVER_UNAVAILABLE: 'Server is currently unavailable',
  API_ERROR: 'API request failed'
} as const;

// Validation error messages
export const VALIDATION_ERRORS = {
  EMPTY_CONTENT: 'Content cannot be empty',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FORMAT: 'Invalid format detected'
} as const;