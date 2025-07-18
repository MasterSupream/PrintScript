export interface GeneratePDFRequest {
  markdown: string;
  options?: ConversionOptions;
}

export interface GeneratePDFResponse {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}

import { ConversionOptions } from './ConversionOptions'; 