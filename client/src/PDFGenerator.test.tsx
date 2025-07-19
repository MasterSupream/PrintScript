import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock axios to avoid import issues
jest.mock('axios', () => ({
  post: jest.fn()
}));

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

import PDFGenerator from './PDFGenerator';

describe('PDFGenerator Component', () => {
  const mockOnError = jest.fn();
  const mockOnLoadingChange = jest.fn();
  const defaultProps = {
    markdown: '# Test Markdown',
    onError: mockOnError,
    onLoadingChange: mockOnLoadingChange,
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders PDF generation button', () => {
    render(<PDFGenerator {...defaultProps} />);
    
    const button = screen.getByText(/Download as PDF/i);
    expect(button).toBeInTheDocument();
  });

  test('shows error when markdown is empty', () => {
    render(<PDFGenerator markdown="" onError={mockOnError} onLoadingChange={mockOnLoadingChange} isLoading={false} />);
    
    const button = screen.getByText(/Download as PDF/i);
    fireEvent.click(button);
    
    expect(mockOnError).toHaveBeenCalledWith('Markdown content is empty.', 'PDFGenerator');
  });

  test('shows loading state during PDF generation', async () => {
    render(<PDFGenerator {...defaultProps} />);
    
    const button = screen.getByText(/Download as PDF/i);
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Generating PDF.../i)).toBeInTheDocument();
    });
  });

  test('handles error when markdown contains error keyword', async () => {
    render(<PDFGenerator markdown="# Test error content" onError={mockOnError} onLoadingChange={mockOnLoadingChange} isLoading={false} />);
    
    const button = screen.getByText(/Download as PDF/i);
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error), 'PDFGenerator');
    });
  });

  test('button is disabled during loading', async () => {
    render(<PDFGenerator {...defaultProps} />);
    
    const button = screen.getByText(/Download as PDF/i);
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  test('button has proper styling classes', () => {
    render(<PDFGenerator {...defaultProps} />);
    
    const button = screen.getByText(/Download as PDF/i);
    expect(button).toHaveClass('bg-gradient-to-r');
    expect(button).toHaveClass('from-pink-500');
    expect(button).toHaveClass('via-purple-500');
    expect(button).toHaveClass('to-indigo-500');
  });

  test('creates ripple effect on click', () => {
    render(<PDFGenerator {...defaultProps} />);
    
    const button = screen.getByText(/Download as PDF/i);
    
    // Mock getBoundingClientRect
    button.getBoundingClientRect = jest.fn(() => ({
      left: 100,
      top: 100,
      width: 200,
      height: 50,
      right: 300,
      bottom: 150
    } as DOMRect));
    
    fireEvent.click(button, { clientX: 150, clientY: 125 });
    
    // Check if ripple element is created
    const ripple = button.querySelector('.animate-ripple');
    expect(ripple).toBeInTheDocument();
  });
});