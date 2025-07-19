// Simple markdown to HTML converter (basic implementation)
function simpleMarkdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/gim, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");
  html = html.replace(/_(.*?)_/gim, "<em>$1</em>");

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>");

  // Inline code
  html = html.replace(/`(.*?)`/gim, "<code>$1</code>");

  // Links
  html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2">$1</a>');

  // Line breaks
  html = html.replace(/\n\n/gim, "</p><p>");
  html = html.replace(/\n/gim, "<br>");

  // Wrap in paragraphs
  html = "<p>" + html + "</p>";

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/gim, "");
  html = html.replace(/<p><h([1-6])>/gim, "<h$1>");
  html = html.replace(/<\/h([1-6])><\/p>/gim, "</h$1>");
  html = html.replace(/<p><pre>/gim, "<pre>");
  html = html.replace(/<\/pre><\/p>/gim, "</pre>");

  return html;
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { markdown } = req.body;

    if (!markdown || typeof markdown !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing markdown content." });
    }

    // Basic sanitization - remove script tags
    const safeMarkdown = markdown.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );

    // Convert Markdown to HTML using simple converter
    const html = simpleMarkdownToHtml(safeMarkdown);

    // Create styled HTML document
    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Document</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
              background: white;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #2c3e50;
              margin-top: 32px;
              margin-bottom: 16px;
              font-weight: 600;
            }
            h1 { font-size: 2.5em; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            h2 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            h3 { font-size: 1.5em; }
            p { margin-bottom: 16px; }
            code {
              background-color: #f6f8fa;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Monaco', 'Consolas', monospace;
              font-size: 0.9em;
            }
            pre {
              background-color: #f6f8fa;
              padding: 20px;
              border-radius: 8px;
              overflow-x: auto;
              margin: 16px 0;
              border: 1px solid #e1e4e8;
            }
            pre code {
              background: none;
              padding: 0;
              border-radius: 0;
            }
            a { color: #0366d6; text-decoration: none; }
            a:hover { text-decoration: underline; }
            strong { font-weight: 600; }
            em { font-style: italic; }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #0366d6;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .print-button:hover {
              background: #0256cc;
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">📄 Save as PDF</button>
          ${html}
          <script>
            // Auto-trigger print dialog after a short delay
            setTimeout(function() {
              window.print();
            }, 1500);
          </script>
        </body>
      </html>
    `;

    // Return success response with HTML URL for frontend to handle
    return res.status(200).json({
      success: true,
      htmlContent: styledHtml,
      message: "HTML content generated successfully"
    });

  } catch (error) {
    console.error("PDF generation error:", error);
    return res.status(500).json({
      error: "Server error during PDF generation. Please try again later.",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
