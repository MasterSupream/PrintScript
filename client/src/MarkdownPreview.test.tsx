import React from 'react';
import { render, screen } from '@testing-library/react';
import MarkdownPreview from './MarkdownPreview';

// Mock react-markdown to avoid Jest configuration issues
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="rendered-markdown">{children}</div>;
  };
});

// Mock syntax highlighter
jest.mock('react-syntax-highlighter', () => ({
  Prism: function MockSyntaxHighlighter({ children }: { children: string }) {
    return <pre data-testid="code-block">{children}</pre>;
  }
}));

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
  oneLight: {}
}));

describe('MarkdownPreview Component', () => {
  test('renders empty content correctly', () => {
    render(<MarkdownPreview content="" />);
    const preview = screen.getByTestId('rendered-markdown');
    expect(preview).toBeInTheDocument();
    expect(preview).toHaveTextContent('');
  });

  test('renders markdown content', () => {
    const testContent = '# Test Heading\n\nThis is a test paragraph.';
    render(<MarkdownPreview content={testContent} />);
    
    const preview = screen.getByTestId('rendered-markdown');
    expect(preview).toHaveTextContent('# Test Heading This is a test paragraph.');
  });

  test('renders with proper styling classes', () => {
    render(<MarkdownPreview content="Test content" />);
    
    const container = screen.getByTestId('rendered-markdown').parentElement;
    expect(container).toHaveClass('markdown-preview');
    expect(container).toHaveClass('prose');
    expect(container).toHaveClass('prose-indigo');
  });

  test('handles complex markdown content', () => {
    const complexContent = `# Heading 1
## Heading 2

**Bold text** and *italic text*

- List item 1
- List item 2

\`inline code\`

\`\`\`javascript
console.log('Hello World');
\`\`\``;

    render(<MarkdownPreview content={complexContent} />);
    
    const preview = screen.getByTestId('rendered-markdown');
    // Check that the content is rendered (whitespace will be normalized)
    expect(preview).toHaveTextContent(/Heading 1/);
    expect(preview).toHaveTextContent(/Heading 2/);
    expect(preview).toHaveTextContent(/Bold text.*italic text/);
    expect(preview).toHaveTextContent(/List item 1/);
    expect(preview).toHaveTextContent(/List item 2/);
  });

  test('updates content when props change', () => {
    const { rerender } = render(<MarkdownPreview content="Initial content" />);
    
    let preview = screen.getByTestId('rendered-markdown');
    expect(preview).toHaveTextContent('Initial content');
    
    rerender(<MarkdownPreview content="Updated content" />);
    
    preview = screen.getByTestId('rendered-markdown');
    expect(preview).toHaveTextContent('Updated content');
  });

  test('has proper scrollable container', () => {
    render(<MarkdownPreview content="Test content" />);
    
    const container = screen.getByTestId('rendered-markdown').parentElement;
    expect(container).toHaveClass('overflow-auto');
    expect(container).toHaveClass('h-full');
  });
});