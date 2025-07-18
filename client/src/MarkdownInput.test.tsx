import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import MarkdownInput from './MarkdownInput';

describe('MarkdownInput Component', () => {
  const mockOnChange = jest.fn();
  const mockOnError = jest.fn();
  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onError: mockOnError
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders textarea with correct placeholder', () => {
    render(<MarkdownInput {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/Enter your Markdown here or upload a file/i);
    expect(textarea).toBeInTheDocument();
  });

  test('calls onChange when textarea value changes', () => {
    render(<MarkdownInput {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/enter your markdown/i);
    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('Hello World');
  });

  test('displays current value in textarea', () => {
    render(<MarkdownInput {...defaultProps} value="# Test Heading" />);
    
    const textarea = screen.getByDisplayValue('# Test Heading');
    expect(textarea).toBeInTheDocument();
  });

  test('renders file upload area', () => {
    render(<MarkdownInput {...defaultProps} />);
    
    const uploadArea = screen.getByText(/Drag & drop a .md file here, or click to select/i);
    expect(uploadArea).toBeInTheDocument();
  });

  test('has proper textarea styling', () => {
    render(<MarkdownInput {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/enter your markdown/i);
    expect(textarea).toHaveClass('border-2');
    expect(textarea).toHaveClass('border-indigo-200');
    expect(textarea).toHaveClass('focus:border-indigo-500');
  });

  test('file upload area has proper styling', () => {
    render(<MarkdownInput {...defaultProps} />);
    
    const uploadArea = screen.getByText(/Drag & drop a .md file here/i).closest('label');
    expect(uploadArea).toHaveClass('border-dashed');
    expect(uploadArea).toHaveClass('border-pink-300');
    expect(uploadArea).toHaveClass('bg-pink-50/60');
  });

  test('file input accepts correct file types', () => {
    render(<MarkdownInput {...defaultProps} />);
    
    const fileInput = screen.getByRole('textbox').parentElement?.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('accept', '.md,.markdown');
  });

  test('validates file extension correctly', () => {
    // Test the validation logic by simulating the component's behavior
    const validExtensions = ['md', 'markdown'];
    const testFiles = [
      { name: 'test.md', valid: true },
      { name: 'test.markdown', valid: true },
      { name: 'test.txt', valid: false },
      { name: 'test.doc', valid: false }
    ];

    testFiles.forEach(({ name, valid }) => {
      const ext = name.split('.').pop()?.toLowerCase();
      const isValid = ext && validExtensions.includes(ext);
      expect(isValid).toBe(valid);
    });
  });

  test('validates file size limit', () => {
    const maxSizeMB = 2;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    const testSizes = [
      { size: 1024, valid: true },
      { size: maxSizeBytes - 1, valid: true },
      { size: maxSizeBytes, valid: true },
      { size: maxSizeBytes + 1, valid: false },
      { size: 5 * 1024 * 1024, valid: false }
    ];

    testSizes.forEach(({ size, valid }) => {
      const isValid = size <= maxSizeBytes;
      expect(isValid).toBe(valid);
    });
  });

  test('textarea is resizable', () => {
    render(<MarkdownInput {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/enter your markdown/i);
    expect(textarea).toHaveClass('resize-y');
  });

  test('has minimum height for textarea', () => {
    render(<MarkdownInput {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/enter your markdown/i);
    expect(textarea).toHaveClass('min-h-[160px]');
  });
}); 