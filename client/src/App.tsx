import React, { useState, useEffect } from 'react';
import MarkdownInput from './MarkdownInput';
import MarkdownPreview from './MarkdownPreview';
import PDFGenerator from './PDFGenerator';
import ErrorDisplay from './components/ErrorDisplay';
import ErrorBoundary from './components/ErrorBoundary';
import { EnhancedError } from './types/ErrorTypes';
import { ErrorHandler } from './utils/errorHandler';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  const [markdownContent, setMarkdownContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState<'pdf-generation' | 'file-processing' | null>(null);
  const [error, setError] = useState<EnhancedError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to false
    try {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      // Fallback to light mode if localStorage is not available
      console.warn('localStorage not available, defaulting to light mode');
      return false;
    }
  });
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value);
    setError(null);
  };

  const handleLoadingChange = (loading: boolean, operation?: 'pdf-generation' | 'file-processing') => {
    setIsLoading(loading);

    if (loading && operation) {
      setLoadingOperation(operation);

      // Clear any existing timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }

      // Set a safety timeout to prevent infinite loading states
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setLoadingOperation(null);
        handleError(
          `${operation === 'pdf-generation' ? 'PDF generation' : 'File processing'} timed out. Please try again.`,
          operation === 'pdf-generation' ? 'PDFGenerator' : 'MarkdownInput'
        );
      }, 60000); // 60 second timeout

      setLoadingTimeout(timeout);
    } else if (!loading) {
      setLoadingOperation(null);

      // Clear the timeout when loading completes normally
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
    }
  };

  const handleError = (err: string | Error, component?: string) => {
    // Ensure loading state is cleared when an error occurs
    if (isLoading) {
      setIsLoading(false);
      setLoadingOperation(null);
    }

    const errorType = ErrorHandler.categorizeError(err);
    const enhancedError = ErrorHandler.createEnhancedError(
      err,
      errorType,
      component,
      ErrorHandler.isRetryable(err, errorType)
    );

    ErrorHandler.logError(enhancedError);
    setError(enhancedError);
  };

  const handleRetry = () => {
    // Clear any existing loading states and errors before retry
    setIsLoading(false);
    setLoadingOperation(null);
    setError(null);
    setRetryCount(c => c + 1);
  };

  const handleErrorBoundaryError = (error: EnhancedError) => {
    setError(error);
  };

  // Save dark mode preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    } catch (error) {
      // Silently fail if localStorage is not available
      console.warn('Could not save dark mode preference to localStorage');
    }
  }, [darkMode]);

  // Cleanup timeout on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadingTimeout]);

  return (
    <ErrorBoundary onError={handleErrorBoundaryError}>
      <div className={`${darkMode ? 'dark' : ''}`}>
        <motion.div
          className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center px-3 sm:px-4 py-4 sm:py-6 font-sans transition-colors duration-500 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          {isLoading && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-2xl flex items-center gap-4">
                <svg className="animate-spin h-8 w-8 text-indigo-600 dark:text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {loadingOperation === 'pdf-generation' && 'Generating PDF...'}
                    {loadingOperation === 'file-processing' && 'Processing file...'}
                    {!loadingOperation && 'Processing...'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {loadingOperation === 'pdf-generation' && 'Converting your markdown to PDF format'}
                    {loadingOperation === 'file-processing' && 'Reading and parsing your file'}
                    {!loadingOperation && 'Please wait while we process your request'}
                  </span>
                </div>
              </div>
            </div>
          )}
            <motion.header
              className="w-full max-w-5xl mb-10 flex flex-col items-center"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="flex items-center justify-between w-full mb-6">
                <div className="flex items-center gap-3">
                  <svg className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-pink-600 dark:from-pink-400 dark:to-indigo-300 drop-shadow-lg">
                    PrintScript
                  </h1>
                </div>
                <button
                  onClick={() => setDarkMode((prev: boolean) => !prev)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold shadow hover:from-pink-500 hover:to-indigo-500 transition-all flex items-center justify-center text-lg sm:text-xl"
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
              </div>
              <p className="text-center text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-3xl px-4">
                A simple web app that lets you convert Markdown and other text formats into clean, professional PDFs — right from your browser. Fast, minimal, and developer-friendly.
              </p>
            </motion.header>
            <motion.main
              className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <motion.section
                className="flex-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl lg:rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col transition-all duration-300 border border-white/40 dark:border-gray-700 min-h-[400px] lg:min-h-[500px]"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <svg className="h-5 w-5 text-indigo-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h2 className="text-lg sm:text-xl font-semibold text-indigo-700 dark:text-pink-400">Markdown Input</h2>
                </div>
                <MarkdownInput
                  value={markdownContent}
                  onChange={handleMarkdownChange}
                  onError={handleError}
                  onLoadingChange={handleLoadingChange}
                />
              </motion.section>
              <motion.section
                className="flex-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl lg:rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col transition-all duration-300 border border-white/40 dark:border-gray-700 min-h-[400px] lg:min-h-[500px]"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <svg className="h-5 w-5 text-pink-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <h2 className="text-lg sm:text-xl font-semibold text-pink-700 dark:text-indigo-300">Live Preview</h2>
                </div>
                <MarkdownPreview content={markdownContent} />
              </motion.section>
            </motion.main>
            <motion.div
              className="w-full max-w-5xl mt-8 flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <PDFGenerator
                markdown={markdownContent}
                onError={handleError}
                onLoadingChange={handleLoadingChange}
                isLoading={isLoading}
                key={retryCount}
              />
              {error && <ErrorDisplay message={error.message} error={error} type={error.type} onRetry={handleRetry} />}
            </motion.div>
        </motion.div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
