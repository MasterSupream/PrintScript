import React, { useState } from 'react';
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
  const [error, setError] = useState<EnhancedError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value);
    setError(null);
  };

  const handleError = (err: string | Error, component?: string) => {
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
    setRetryCount(c => c + 1);
    setError(null);
  };

  const handleErrorBoundaryError = (error: EnhancedError) => {
    setError(error);
  };

  return (
    <ErrorBoundary onError={handleErrorBoundaryError}>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-100 flex flex-col items-center p-4 font-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className={
          `${darkMode ? 'dark' : ''}`
        }>
          <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center p-4 font-sans transition-colors duration-500">
            <motion.header
              className="w-full max-w-5xl mb-10 flex flex-col items-center"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="h-10 w-10 text-indigo-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-pink-600 dark:from-pink-400 dark:to-indigo-300 drop-shadow-lg">Mark2PDF</h1>
              </div>
              <button
                onClick={() => setDarkMode(d => !d)}
                className="absolute top-6 right-8 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold shadow hover:from-pink-500 hover:to-indigo-500 transition-all"
              >
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <p className="text-center text-gray-600 dark:text-gray-300 text-lg max-w-2xl">Convert your Markdown to beautiful PDFs instantly. Paste, preview, and download with ease!</p>
            </motion.header>
            <motion.main
              className="w-full max-w-5xl flex flex-col md:flex-row gap-8 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <motion.section
                className="flex-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl p-6 flex flex-col transition-all duration-300 border border-white/40 dark:border-gray-700"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4 text-indigo-700 dark:text-pink-400">Markdown Input</h2>
                <MarkdownInput value={markdownContent} onChange={handleMarkdownChange} onError={handleError} />
              </motion.section>
              <motion.section
                className="flex-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl p-6 flex flex-col transition-all duration-300 border border-white/40 dark:border-gray-700"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold mb-4 text-pink-700 dark:text-indigo-300">Live Preview</h2>
                <MarkdownPreview content={markdownContent} />
              </motion.section>
            </motion.main>
            <motion.div
              className="w-full max-w-5xl mt-8 flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <PDFGenerator markdown={markdownContent} onError={handleError} key={retryCount} />
              {error && <ErrorDisplay message={error.message} error={error} type={error.type} onRetry={handleRetry} />}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default App;
