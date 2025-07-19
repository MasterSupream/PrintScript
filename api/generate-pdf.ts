import { VercelRequest, VercelResponse } from '@vercel/node';
import marked from 'marked';
import puppeteer from 'puppeteer';
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

  try {
    // Sanitize Markdown input
    const safeMarkdown = xss(markdown);
    
    // Convert Markdown to HTML
    const html = await Promise.resolve(marked.parse(safeMarkdown));
    
    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({ 
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      headless: true
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: options?.pageSize || 'A4',
      landscape: options?.orientation === 'landscape',
      margin: options?.margin ? { 
        top: options.margin, 
        right: options.margin, 
        bottom: options.margin, 
        left: options.margin 
      } : undefined,
      printBackground: true,
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    res.send(pdfBuffer);
    
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF.' });
  }
}