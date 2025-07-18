import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock axios to avoid network calls during testing
jest.mock('axios', () => ({
  post: jest.fn()
}));

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

// Mock react-markdown to avoid Jest configuration issues
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="rendered-markdown">{children}</div>;
  };
});

describe('Complete Application Workflow', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('full user journey from markdown input to PDF generation', async () => {
    render(<App />);

    // 1. Verify initial application state
    expect(screen.getByText(/Mark2PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/Markdown Input/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Preview/i)).toBeInTheDocument();
    expect(screen.getByText(/Download as PDF/i)).toBeInTheDocument();

    // 2. Test markdown input
    const textarea = screen.getByPlaceholderText(/Enter your Markdown here/i);
    const testMarkdown = `# Test Document

This is a **test** document with:

- List item 1
- List item 2

\`\`\`javascript
console.log('Hello World');
\`\`\`

## Conclusion
This is the end of the test.`;

    fireEvent.change(textarea, { target: { value: testMarkdown } });

    // 3. Verify live preview updates
    const preview = screen.getByTestId('rendered-markdown');
    expect(preview).toHaveTextContent(testMarkdown);

    // 4. Test PDF generation
    const pdfButton = screen.getByText(/Download as PDF/i);
    fireEvent.click(pdfButton);

    // 5. Verify loading state
    await waitFor(() => {
      expect(screen.getByText(/Generating PDF.../i)).toBeInTheDocument();
    });
  });

  test('dark mode toggle functionality works correctly', async () => {
    render(<App />);

    // 1. Verify initial light mode
    const darkModeButton = screen.getByText(/🌙 Dark Mode/i);
    expect(darkModeButton).toBeInTheDocument();

    // 2. Toggle to dark mode
    fireEvent.click(darkModeButton);

    // 3. Verify dark mode is active
    await waitFor(() => {
      expect(screen.getByText(/☀️ Light Mode/i)).toBeInTheDocument();
    });

    // 4. Toggle back to light mode
    const lightModeButton = screen.getByText(/☀️ Light Mode/i);
    fireEvent.click(lightModeButton);

    // 5. Verify light mode is restored
    await waitFor(() => {
      expect(screen.getByText(/🌙 Dark Mode/i)).toBeInTheDocument();
    });
  });

  test('file upload with various markdown file types', async () => {
    render(<App />);

    const fileInput = screen.getByRole('textbox').parentElement?.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    // Test .md file
    const mdFile = new File(['# Uploaded Content'], 'test.md', { type: 'text/markdown' });
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: jest.fn(),
      onload: null as any,
      onerror: null as any,
      result: '# Uploaded Content'
    };
    
    global.FileReader = jest.fn(() => mockFileReader) as any;

    if (fileInput) {
      Object.defineProperty(fileInput, 'files', {
        value: [mdFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      // Simulate successful file read
      mockFileReader.onload({ target: { result: '# Uploaded Content' } });
      
      // Verify content is loaded
      const textarea = screen.getByDisplayValue('# Uploaded Content');
      expect(textarea).toBeInTheDocument();
    }
  });

  test('responsive design works across different screen sizes', () => {
    // Test desktop view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { container } = render(<App />);
    
    // Verify main layout uses flexbox for responsive design
    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('flex');
    expect(mainElement).toHaveClass('md:flex-row');

    // Test mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    // The layout should adapt to mobile (flex-col by default)
    expect(mainElement).toHaveClass('flex-col');
  });

  test('error handling throughout the workflow', async () => {
    render(<App />);

    // 1. Test empty markdown error
    const pdfButton = screen.getByText(/Download as PDF/i);
    fireEvent.click(pdfButton);

    await waitFor(() => {
      expect(screen.getByText(/Markdown content is empty/i)).toBeInTheDocument();
    });

    // 2. Test error dismissal
    const dismissButton = screen.getByLabelText(/Dismiss error/i);
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText(/Markdown content is empty/i)).not.toBeInTheDocument();
    });

    // 3. Test error clearing when content changes
    const textarea = screen.getByPlaceholderText(/Enter your Markdown here/i);
    
    // Trigger error again
    fireEvent.click(pdfButton);
    await waitFor(() => {
      expect(screen.getByText(/Markdown content is empty/i)).toBeInTheDocument();
    });

    // Add content to clear error
    fireEvent.change(textarea, { target: { value: '# Test' } });
    
    // Error should be cleared
    expect(screen.queryByText(/Markdown content is empty/i)).not.toBeInTheDocument();
  });

  test('application accessibility features', () => {
    render(<App />);

    // Check for proper ARIA labels
    const dismissButton = screen.getByLabelText(/Dismiss error/i);
    expect(dismissButton).toHaveAttribute('aria-label');

    // Check for semantic HTML structure
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();

    // Check for proper heading structure
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent(/Mark2PDF/i);

    const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(sectionHeadings).toHaveLength(2); // Markdown Input and Live Preview
  });

  test('keyboard navigation and focus management', async () => {
    render(<App />);

    // Test tab navigation
    const textarea = screen.getByPlaceholderText(/Enter your Markdown here/i);
    const pdfButton = screen.getByText(/Download as PDF/i);
    const darkModeButton = screen.getByText(/🌙 Dark Mode/i);

    // Focus should move through interactive elements
    textarea.focus();
    expect(document.activeElement).toBe(textarea);

    // Test keyboard interaction with buttons
    darkModeButton.focus();
    fireEvent.keyDown(darkModeButton, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText(/☀️ Light Mode/i)).toBeInTheDocument();
    });
  });

  test('performance and loading states', async () => {
    render(<App />);

    // Test initial loading animation
    const appContainer = screen.getByText(/Mark2PDF/i).closest('div');
    expect(appContainer).toBeInTheDocument();

    // Test PDF generation loading state
    const textarea = screen.getByPlaceholderText(/Enter your Markdown here/i);
    fireEvent.change(textarea, { target: { value: '# Test Content' } });

    const pdfButton = screen.getByText(/Download as PDF/i);
    fireEvent.click(pdfButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Generating PDF.../i)).toBeInTheDocument();
    });

    // Button should be disabled during loading
    expect(pdfButton).toBeDisabled();
  });
});