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
    <div className="markdown-input flex flex-col gap-4">
      <textarea
        value={value}
        onChange={handleTextChange}
        placeholder="Enter your Markdown here or upload a file..."
        rows={10}
        className="w-full border-2 border-indigo-200 focus:border-indigo-500 rounded-xl p-4 shadow-md transition-all duration-200 outline-none resize-y font-mono bg-white/80 placeholder-gray-400 text-base min-h-[160px]"
      />
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-pink-300 rounded-xl p-6 bg-pink-50/60 hover:bg-pink-100/80 cursor-pointer transition-all duration-200 relative group">
        <svg className="h-8 w-8 text-pink-400 mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        <span className="text-pink-700 font-medium mb-1">Drag & drop a .md file here, or click to select</span>
        <input
          type="file"
          accept={ALLOWED_FILE_TYPES.map(ext => `.${ext}`).join(',')}
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default MarkdownInput; 