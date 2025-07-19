export interface GeneratePDFRequest {
  markdown: string;
  options?: ConversionOptions;
}

export interface GeneratePDFResponse {
  success: boolean;
  htmlContent?: string;
  message?: string;
  error?: string;
}

import { ConversionOptions } from './ConversionOptions'; 
