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

    if (
      !markdown ||
      typeof markdown !== "string" ||
      markdown.length > 2 * 1024 * 1024
    ) {
      return res
        .status(400)
        .json({ error: "Invalid or missing markdown content." });
    }

    // Simple test - return HTML instead of PDF for now to debug
    const { marked } = await import("marked");
    const xss = (await import("xss")).default;

    // Sanitize Markdown input
    const safeMarkdown = xss(markdown);

    // Convert Markdown to HTML
    const html = marked(safeMarkdown);

    // Create a simple PDF-like response for testing
    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Document</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1, h2, h3 { color: #2c3e50; }
            code {
              background-color: #f4f4f4;
              padding: 2px 4px;
              border-radius: 3px;
            }
            pre {
              background-color: #f8f8f8;
              padding: 16px;
              border-radius: 6px;
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          ${html}
          <script>
            // Auto-trigger print dialog for PDF generation
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `;

    // For now, return HTML that can be printed to PDF by the browser
    res.setHeader("Content-Type", "text/html");
    return res.send(styledHtml);
  } catch (error) {
    console.error("PDF generation error:", error);

    return res.status(500).json({
      error: "Server error during PDF generation. Please try again later.",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
