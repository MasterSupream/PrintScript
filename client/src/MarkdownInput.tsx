import React, { useRef } from 'react';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from './constants/fileTypes';

interface MarkdownInputProps {
  value: string;
  onChange: (value: string) => void;
  onError: (error: string | Error, component?: string) => void;
  onLoadingChange: (loading: boolean, operation?: 'pdf-generation' | 'file-processing') => void;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({ value, onChange, onError, onLoadingChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleMarkdown = `# Welcome to PrintScript! 📄

**PrintScript** is a simple web app that converts Markdown into clean, professional PDFs right from your browser.

## Features ✨

- **Live Preview** - See your content rendered instantly
- **Beautiful PDFs** - Clean formatting with syntax highlighting  
- **Drag & Drop** - Easy file uploads
- **Dark Mode** - Easy on the eyes
- **Mobile Friendly** - Works on all devices

## Code Example

\`\`\`javascript
function generatePDF(markdown) {
  return fetch('/api/generate-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markdown })
  });
}
\`\`\`

## Quick List

1. Write your markdown
2. Preview it live
3. Generate PDF
4. Download instantly

> **Tip:** Try editing this sample content and watch the preview update in real-time!

---

*Ready to create your PDF? Click the "Generate PDF" button below!*`;

  const handleLoadSample = () => {
    onChange(sampleMarkdown);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_FILE_TYPES.includes(ext)) {
      onError('Invalid file type. Please upload a .md or .markdown file.', 'MarkdownInput');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      onError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`, 'MarkdownInput');
      return;
    }
    
    onLoadingChange(true, 'file-processing');
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onChange(text);
      onLoadingChange(false);
    };
    reader.onerror = () => {
      onError('Failed to read file.', 'MarkdownInput');
      onLoadingChange(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="markdown-input flex flex-col gap-3 sm:gap-4 h-full">
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={handleTextChange}
          placeholder="Enter your Markdown here or upload a file..."
          className="w-full h-full border-2 border-indigo-200 dark:border-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md transition-all duration-200 outline-none resize-none font-mono bg-white/80 dark:bg-gray-800/80 placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-200 text-sm sm:text-base min-h-[200px] sm:min-h-[250px]"
        />
        {!value.trim() && (
          <button
            onClick={handleLoadSample}
            className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            Try Sample
          </button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-pink-300 dark:border-pink-500 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-pink-50/60 dark:bg-pink-900/20 hover:bg-pink-100/80 dark:hover:bg-pink-900/40 cursor-pointer transition-all duration-200 relative group min-h-[60px] sm:min-h-[70px]">
          <div className="flex items-center gap-2 sm:gap-3">
            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-pink-400 dark:text-pink-300 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-center">
              <span className="text-pink-700 dark:text-pink-300 font-medium text-sm sm:text-base block">
                <span className="hidden sm:inline">Drag & drop a .md file here, or </span>
                <span className="sm:hidden">Upload </span>
                <span className="underline">click to select</span>
              </span>
              <span className="text-pink-600/70 dark:text-pink-400/70 text-xs mt-1 block">
                Supports .md and .markdown files (max 2MB)
              </span>
            </div>
          </div>
          <input
            type="file"
            accept={ALLOWED_FILE_TYPES.map(ext => `.${ext}`).join(',')}
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload markdown file"
          />
        </label>
        
        {value.trim() && (
          <button
            onClick={() => onChange('')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 text-sm font-medium whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default MarkdownInput; 
