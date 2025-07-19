import React, { useState, MouseEvent } from 'react';
import axios from 'axios';
import { GeneratePDFRequest, GeneratePDFResponse } from './types/APIModels';
import { getApiUrl, API_ENDPOINTS } from './config/api';

interface PDFGeneratorProps {
  markdown: string;
  options?: object;
  onError: (error: string | Error, component?: string) => void;
  onLoadingChange: (loading: boolean, operation?: 'pdf-generation' | 'file-processing') => void;
  isLoading: boolean;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ markdown, options, onError, onLoadingChange, isLoading }) => {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const handleGeneratePDF = async () => {
    if (!markdown.trim()) {
      onError('Markdown content is empty.', 'PDFGenerator');
      return;
    }

    // Start loading state for PDF generation
    onLoadingChange(true, 'pdf-generation');

    try {
      const requestData: GeneratePDFRequest = { markdown, options };
      const response = await axios.post<GeneratePDFResponse>(getApiUrl(API_ENDPOINTS.generatePDF), requestData, {
        timeout: 30000, // 30 second timeout for PDF generation
      });

      // Check if response contains HTML content
      if (response.data && response.data.success && response.data.htmlContent) {
        // Create a new window/tab with the formatted HTML
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(response.data.htmlContent);
          newWindow.document.close();
          // Focus the new window
          newWindow.focus();
        } else {
          // Fallback if popup is blocked - create a blob and open it
          const blob = new Blob([response.data.htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          // Clean up the URL after a delay
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (err: any) {
      // Enhanced error handling during loading state
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to generate PDF.';

      // Handle specific error scenarios during PDF generation
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        onError('PDF generation timed out. Please try again with shorter content.', 'PDFGenerator');
      } else if (err?.response?.status >= 500) {
        onError('Server error during PDF generation. Please try again later.', 'PDFGenerator');
      } else if (err?.response?.status === 413) {
        onError('Content too large for PDF generation. Please reduce the markdown size.', 'PDFGenerator');
      } else {
        onError(errorMessage, 'PDFGenerator');
      }
    } finally {
      // Always ensure loading state is cleared, even in error scenarios
      onLoadingChange(false);
    }
  };

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setTimeout(() => setRipple(null), 500);
    handleGeneratePDF();
  };

  return (
    <div className="pdf-generator mt-4 sm:mt-6 flex flex-col items-center w-full">
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full max-w-md">
        <button
          onClick={handleButtonClick}
          disabled={isLoading || !markdown.trim()}
          className={`
            w-full sm:flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-full font-bold text-base sm:text-lg shadow-xl transition-all duration-200
            bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white
            hover:from-indigo-500 hover:to-pink-500 hover:scale-105 hover:shadow-2xl
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            flex items-center justify-center gap-3 relative overflow-hidden
            focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800
          `}
          aria-label={isLoading ? 'Generating PDF' : 'Generate and download PDF'}
        >
          {ripple && (
            <span
              className="absolute bg-white/40 rounded-full pointer-events-none animate-ripple"
              style={{
                left: ripple.x - 50,
                top: ripple.y - 50,
                width: 100,
                height: 100,
              }}
            />
          )}
          
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Download as PDF</span>
              <span className="sm:hidden">Generate PDF</span>
            </>
          )}
        </button>
      </div>
      
      {!markdown.trim() && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center px-4">
          Add some markdown content above to generate a PDF
        </p>
      )}
      
      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
          Your PDF will open in a new tab for download
        </p>
      </div>
    </div>
  );
};

export default PDFGenerator; 
