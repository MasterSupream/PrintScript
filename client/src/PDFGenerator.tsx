import React, { useState, MouseEvent } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { GeneratePDFRequest } from './types/APIModels';
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
      const response = await axios.post(getApiUrl(API_ENDPOINTS.generatePDF), requestData, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout for PDF generation
      });
      
      // Successful PDF generation
      saveAs(response.data as Blob, 'document.pdf');
      
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
    <div className="pdf-generator mt-6 flex flex-col items-center">
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className={
          `px-8 py-3 rounded-full font-bold text-lg shadow-xl transition-all duration-200
          bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white
          hover:from-indigo-500 hover:to-pink-500 hover:scale-105
          active:scale-95
          disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center gap-3 relative overflow-hidden`
        }
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
        {isLoading && (
          <span className="absolute left-4 flex items-center">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </span>
        )}
        {isLoading ? 'Generating PDF...' : 'Download as PDF'}
      </button>
    </div>
  );
};

export default PDFGenerator; 