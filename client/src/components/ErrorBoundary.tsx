import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryState, EnhancedError } from '../types/ErrorTypes';
import ErrorDisplay from './ErrorDisplay';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: EnhancedError) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Create enhanced error object
    const enhancedError: EnhancedError = {
      message: error.message,
      type: 'configuration',
      retryable: true,
      details: `${error.stack}\n\nComponent Stack:\n${errorInfo.componentStack}`,
      timestamp: Date.now(),
      component: this.getComponentName(errorInfo.componentStack || '')
    };

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(enhancedError);
    }

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Enhanced Error:', enhancedError);
      console.groupEnd();
    }
  }

  private getComponentName(componentStack: string): string {
    const match = componentStack.match(/in (\w+)/);
    return match ? match[1] : 'Unknown Component';
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private getErrorMessage(): string {
    const { error } = this.state;
    if (!error) return 'An unexpected error occurred';

    // Check for common development errors
    if (error.message.includes('allowedHosts')) {
      return 'Webpack dev server configuration issue detected. Please check your environment variables.';
    }
    
    if (error.message.includes('CORS')) {
      return 'Cross-origin request blocked. Please check your proxy configuration.';
    }
    
    if (error.message.includes('Network Error')) {
      return 'Unable to connect to the backend server. Please ensure the server is running on port 4000.';
    }
    
    if (error.message.includes('Cannot resolve module')) {
      return 'Missing dependency detected. Please run npm install to resolve missing packages.';
    }

    return `Component Error: ${error.message}`;
  }

  private getErrorType(): 'configuration' | 'network' | 'unknown' {
    const { error } = this.state;
    if (!error) return 'unknown';

    if (error.message.includes('allowedHosts') || 
        error.message.includes('webpack') ||
        error.message.includes('Cannot resolve module')) {
      return 'configuration';
    }
    
    if (error.message.includes('Network') || 
        error.message.includes('CORS') ||
        error.message.includes('fetch')) {
      return 'network';
    }

    return 'unknown';
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      const enhancedError: EnhancedError = {
        message: this.getErrorMessage(),
        type: this.getErrorType(),
        retryable: true,
        details: this.state.error?.stack || 'No stack trace available',
        timestamp: Date.now(),
        component: this.getComponentName(this.state.errorInfo?.componentStack || '')
      };

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-red-600 mb-2">Application Error</h1>
              <p className="text-gray-600">Something went wrong while loading the application.</p>
            </div>
            
            <ErrorDisplay
              message={this.getErrorMessage()}
              type={this.getErrorType()}
              error={enhancedError}
              onRetry={this.handleRetry}
              showDetails={process.env.NODE_ENV === 'development'}
            />

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Development Information:</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <div><strong>Error:</strong> {this.state.error?.message}</div>
                  <div><strong>Component:</strong> {this.getComponentName(this.state.errorInfo?.componentStack || '')}</div>
                  <div><strong>Time:</strong> {new Date().toLocaleString()}</div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all font-medium"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;