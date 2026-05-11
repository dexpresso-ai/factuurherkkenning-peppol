/**
 * Gedeelde types en enums.
 * Deze worden gebruikt in alle DTO's en services.
 */

export type Currency = 'EUR' | 'USD' | 'GBP';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type ValidationSeverity = 'success' | 'warning' | 'error' | 'info';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ValidationIssue {
  field?: string;
  severity: ValidationSeverity;
  code: string;
  message: string;
}

export interface IsoTimestamp {
  /** ISO 8601 UTC timestamp, bijv. "2025-11-08T14:32:00Z" */
  value: string;
}
