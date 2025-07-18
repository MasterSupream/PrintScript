export interface APIError {
  message: string;
  code?: number;
}

export interface ValidationError {
  field: string;
  message: string;
} 