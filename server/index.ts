import express from 'express';
import cors from 'cors';
import marked from 'marked';
import puppeteer from 'puppeteer';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss';

const app = express();
const PORT = process.env.PORT || 4000;

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '', 'https://*.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(helmet());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

app.use((req, res, next) => {
  res.setTimeout(15000, () => {
    res.status(503).json({ error: 'Request timed out.' });
  });
  next();
});

app.get('/', (req, res) => {
  res.send('PDF Converter API is running');
});

// Placeholder for PDF generation endpoint
app.post('/api/generate-pdf', async (req, res) => {
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
      margin: options?.margin ? { top: options.margin, right: options.margin, bottom: options.margin, left: options.margin } : undefined,
      printBackground: true,
    });
    await browser.close();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="document.pdf"',
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
