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
    const { markdown, options } = req.body;

    if (
      !markdown ||
      typeof markdown !== "string" ||
      markdown.length > 2 * 1024 * 1024
    ) {
      return res
        .status(400)
        .json({ error: "Invalid or missing markdown content." });
    }

    // Import modules dynamically to avoid build-time issues
    const { marked } = await import("marked");
    const puppeteer = await import("puppeteer-core");
    const chromium = await import("@sparticuz/chromium");
    const xss = (await import("xss")).default;

    // Sanitize Markdown input
    const safeMarkdown = xss(markdown);

    // Convert Markdown to HTML
    const html = marked(safeMarkdown);

    // Create full HTML document with styling
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { box-sizing: border-box; }
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
              font-family: 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
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
            blockquote {
              border-left: 4px solid #dfe2e5;
              margin: 16px 0;
              padding-left: 20px;
              color: #6a737d;
              font-style: italic;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 16px 0;
              border: 1px solid #e1e4e8;
            }
            th, td {
              border: 1px solid #e1e4e8;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f6f8fa;
              font-weight: 600;
            }
            ul, ol { margin: 16px 0; padding-left: 30px; }
            li { margin-bottom: 8px; }
            a { color: #0366d6; text-decoration: none; }
            a:hover { text-decoration: underline; }
            img { max-width: 100%; height: auto; margin: 16px 0; }
            hr { border: none; border-top: 2px solid #eee; margin: 32px 0; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    // Configure Chromium for Vercel
    const browser = await puppeteer.default.launch({
      args: [
        ...chromium.default.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(),
      headless: chromium.default.headless,
      timeout: 15000,
    });

    try {
      const page = await browser.newPage();

      // Set a shorter timeout for content loading
      await page.setContent(fullHtml, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });

      // Generate PDF with optimized settings
      const pdfBuffer = await page.pdf({
        format: options?.pageSize || "A4",
        landscape: options?.orientation === "landscape" || false,
        margin: {
          top: options?.margin ? `${options.margin}px` : "20px",
          right: options?.margin ? `${options.margin}px` : "20px",
          bottom: options?.margin ? `${options.margin}px` : "20px",
          left: options?.margin ? `${options.margin}px` : "20px",
        },
        printBackground: true,
        preferCSSPageSize: false,
        timeout: 15000,
      });

      await browser.close();

      // Set response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="document.pdf"'
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      return res.send(pdfBuffer);
    } catch (pageError) {
      await browser.close();
      throw pageError;
    }
  } catch (error) {
    console.error("PDF generation error:", error);

    return res.status(500).json({
      error: "Server error during PDF generation. Please try again later.",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
