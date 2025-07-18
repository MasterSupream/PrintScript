export interface GeneratePDFRequest {
  markdown: string;
  options?: ConversionOptions;
}

export interface GeneratePDFResponse {
  success: boolean;
  pdfBuffer?: Buffer;
  error?: string;
}

export interface ConversionOptions {
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margin?: string;
} 