import { VercelRequest, VercelResponse } from '@vercel/node';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import xss from 'xss';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { markdown, options } = req.body;

  if (!markdown || typeof markdown !== 'string' || markdown.length > 2 * 1024 * 1024) {
    return res.status(400).json({ error: 'Invalid or missing markdown content.' });
  }

  let browser = null;

  try {
    // Sanitize Markdown input
    const safeMarkdown = xss(markdown);
    
    // Convert Markdown to HTML with better styling
    const html = marked(safeMarkdown);
    
    // Create full HTML document with styling
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #2c3e50;
              margin-top: 24px;
              margin-bottom: 16px;
            }
            code {
              background-color: #f4f4f4;
              padding: 2px 4px;
              border-radius: 3px;
              font-family: 'Monaco', 'Consolas', monospace;
            }
            pre {
              background-color: #f8f8f8;
              padding: 16px;
              border-radius: 6px;
              overflow-x: auto;
            }
            blockquote {
              border-left: 4px solid #ddd;
              margin: 0;
              padding-left: 16px;
              color: #666;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
    
    // Launch Puppeteer with Chromium for Vercel
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: (options?.pageSize as any) || 'A4',
      landscape: options?.orientation === 'landscape',
      margin: options?.margin ? { 
        top: `${options.margin}px`, 
        right: `${options.margin}px`, 
        bottom: `${options.margin}px`, 
        left: `${options.margin}px` 
      } : {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      printBackground: true,
    });
    
    await browser.close();
    browser = null;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    res.send(pdfBuffer);
    
  } catch (err) {
    console.error('PDF generation error:', err);
    
    // Ensure browser is closed on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error('Error closing browser:', closeErr);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to generate PDF.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
