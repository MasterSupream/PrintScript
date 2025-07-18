import React, { useState, useEffect } from 'react';
import { EnhancedError, ErrorType } from '../types/ErrorTypes';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  error?: EnhancedError;
  type?: ErrorType;
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  message, 
  onRetry, 
  error, 
  type = 'unknown',
  showDetails = false 
}) => {
  const [visible, setVisible] = useState(true);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Auto-dismiss non-critical errors after 10 seconds
  useEffect(() => {
    if (type === 'validation' || type === 'file') {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [type]);

  if (!visible) return null;

  const getErrorIcon = (errorType: ErrorType) => {
    switch (errorType) {
      case 'network':
        return (
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
          </svg>
        );
      case 'configuration':
        return (
          <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'server':
        return (
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'validation':
      case 'file':
        return (
          <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
          </svg>
        );
    }
  };

  const getErrorSeverityClasses = (errorType: ErrorType) => {
    switch (errorType) {
      case 'configuration':
        return 'bg-orange-50/80 border-orange-300 text-orange-700';
      case 'validation':
      case 'file':
        return 'bg-yellow-50/80 border-yellow-300 text-yellow-700';
      case 'network':
      case 'server':
        return 'bg-red-50/80 border-red-300 text-red-700';
      default:
        return 'bg-red-50/80 border-red-300 text-red-700';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const shouldShowRetry = () => {
    return onRetry && (error?.retryable !== false || type === 'network' || type === 'server');
  };

  return (
    <div className={`${getErrorSeverityClasses(type)} border px-6 py-4 rounded-xl shadow-lg mt-4 animate-fade-in`}>
      <div className="flex items-start gap-3">
        {getErrorIcon(type)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium">{message}</span>
            <div className="flex items-center gap-2 ml-4">
              {error?.details && (
                <button
                  onClick={() => setDetailsExpanded(!detailsExpanded)}
                  className="text-sm underline hover:no-underline focus:outline-none"
                  aria-label={detailsExpanded ? "Hide details" : "Show details"}
                >
                  {detailsExpanded ? 'Hide Details' : 'Details'}
                </button>
              )}
              <button
                onClick={() => setVisible(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold focus:outline-none"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
          
          {detailsExpanded && error?.details && (
            <div className="mt-3 p-3 bg-white/50 rounded-lg text-sm">
              <div className="font-medium mb-1">Error Details:</div>
              <div className="text-gray-600 whitespace-pre-wrap">{error.details}</div>
              {error.component && (
                <div className="mt-2 text-xs text-gray-500">
                  Component: {error.component}
                </div>
              )}
              {error.timestamp && (
                <div className="mt-1 text-xs text-gray-500">
                  Time: {formatTimestamp(error.timestamp)}
                </div>
              )}
            </div>
          )}
          
          {shouldShowRetry() && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-indigo-500 hover:to-pink-500 transition-all text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 