import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEffect, useState } from 'react';

interface MarkdownPreviewProps {
  content: string;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

interface ComponentProps {
  children: React.ReactNode;
  [key: string]: any;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="markdown-preview p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white/80 dark:bg-gray-900/80 shadow-inner h-full overflow-auto transition-all duration-200 custom-scrollbar prose prose-sm sm:prose prose-indigo dark:prose-invert max-w-none min-h-[200px] sm:min-h-[250px]">
      {content.trim() ? (
        <ReactMarkdown
          children={content}
          components={{
            code({ node, inline, className, children, ...props }: CodeProps) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={isDark ? oneDark : oneLight}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    fontSize: '0.875rem',
                    borderRadius: '0.5rem',
                    margin: '1rem 0',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={`${className} px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm`} {...props}>
                  {children}
                </code>
              );
            },
            h1: ({ children, ...props }: ComponentProps) => (
              <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2" {...props}>
                {children}
              </h1>
            ),
            h2: ({ children, ...props }: ComponentProps) => (
              <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100" {...props}>
                {children}
              </h2>
            ),
            h3: ({ children, ...props }: ComponentProps) => (
              <h3 className="text-base sm:text-lg font-medium mb-2 text-gray-900 dark:text-gray-100" {...props}>
                {children}
              </h3>
            ),
            p: ({ children, ...props }: ComponentProps) => (
              <p className="mb-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed" {...props}>
                {children}
              </p>
            ),
            ul: ({ children, ...props }: ComponentProps) => (
              <ul className="mb-3 pl-4 sm:pl-6 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }: ComponentProps) => (
              <ol className="mb-3 pl-4 sm:pl-6 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300" {...props}>
                {children}
              </ol>
            ),
            blockquote: ({ children, ...props }: ComponentProps) => (
              <blockquote className="border-l-4 border-indigo-300 dark:border-indigo-600 pl-4 py-2 my-4 bg-indigo-50/50 dark:bg-indigo-900/20 italic text-sm sm:text-base" {...props}>
                {children}
              </blockquote>
            ),
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
          <div className="text-center">
            <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm sm:text-base">Your markdown preview will appear here</p>
            <p className="text-xs sm:text-sm mt-1 opacity-75">Start typing or upload a file to see the preview</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownPreview; 
