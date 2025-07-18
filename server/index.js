"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const marked_1 = __importDefault(require("marked"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const xss_1 = __importDefault(require("xss"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '2mb' }));
app.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
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
app.post('/api/generate-pdf', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { markdown, options } = req.body;
    if (!markdown || typeof markdown !== 'string' || markdown.length > 2 * 1024 * 1024) {
        return res.status(400).json({ error: 'Invalid or missing markdown content.' });
    }
    try {
        // Sanitize Markdown input
        const safeMarkdown = (0, xss_1.default)(markdown);
        // Convert Markdown to HTML
        const html = yield Promise.resolve(marked_1.default.parse(safeMarkdown));
        // Launch Puppeteer and generate PDF
        const browser = yield puppeteer_1.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = yield browser.newPage();
        yield page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = yield page.pdf({
            format: (options === null || options === void 0 ? void 0 : options.pageSize) || 'A4',
            landscape: (options === null || options === void 0 ? void 0 : options.orientation) === 'landscape',
            margin: (options === null || options === void 0 ? void 0 : options.margin) ? { top: options.margin, right: options.margin, bottom: options.margin, left: options.margin } : undefined,
            printBackground: true,
        });
        yield browser.close();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="document.pdf"',
        });
        res.send(pdfBuffer);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to generate PDF.' });
    }
}));
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
exports.default = app;
