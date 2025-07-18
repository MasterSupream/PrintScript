import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock the components to avoid dependency issues during testing
jest.mock('./MarkdownPreview', () => {
  return function MockMarkdownPreview({ content }: { content: string }) {
    return <div data-testid="markdown-preview">{content}</div>;
  };
});

jest.mock('./PDFGenerator', () => {
  return function MockPDFGenerator({ markdown, onError }: { markdown: string; onError: (error: string) => void }) {
    return (
      <button 
        data-testid="pdf-generator"
        onClick={() => onError('Test error')}
      >
        Download as PDF
      </button>
    );
  };
});

describe('App Component', () => {
  test('renders main application title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Mark2PDF/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders markdown input section', () => {
    render(<App />);
    const inputSection = screen.getByText(/Markdown Input/i);
    expect(inputSection).toBeInTheDocument();
  });

  test('renders live preview section', () => {
    render(<App />);
    const previewSection = screen.getByText(/Live Preview/i);
    expect(previewSection).toBeInTheDocument();
  });

  test('renders dark mode toggle button', () => {
    render(<App />);
    const darkModeButton = screen.getByText(/Dark Mode/i);
    expect(darkModeButton).toBeInTheDocument();
  });

  test('toggles dark mode when button is clicked', () => {
    render(<App />);
    const darkModeButton = screen.getByText(/🌙 Dark Mode/i);
    
    fireEvent.click(darkModeButton);
    
    // After clicking, it should show Light Mode
    expect(screen.getByText(/☀️ Light Mode/i)).toBeInTheDocument();
  });

  test('updates markdown content when input changes', () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText(/Enter your Markdown here/i);
    
    fireEvent.change(textarea, { target: { value: '# Test Markdown' } });
    
    // Check if the preview is updated
    const preview = screen.getByTestId('markdown-preview');
    expect(preview).toHaveTextContent('# Test Markdown');
  });

  test('displays error when PDF generation fails', async () => {
    render(<App />);
    const pdfButton = screen.getByTestId('pdf-generator');
    
    fireEvent.click(pdfButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    });
  });

  test('clears error when markdown content changes', () => {
    render(<App />);
    const pdfButton = screen.getByTestId('pdf-generator');
    const textarea = screen.getByPlaceholderText(/Enter your Markdown here/i);
    
    // Trigger an error first
    fireEvent.click(pdfButton);
    
    // Change markdown content to clear error
    fireEvent.change(textarea, { target: { value: 'New content' } });
    
    // Error should be cleared (not visible)
    expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument();
  });
});
