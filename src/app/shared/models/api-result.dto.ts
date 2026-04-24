export interface ApiResult {
  success: boolean;
  message?: string;
  details?: string;
  code?: string;
  validationErrors?: Record<string, string[]>;
  data?: unknown;
}
