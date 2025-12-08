/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Error response from API
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  status_code?: number;
}

/**
 * Success response from API
 */
export interface ApiSuccess<T = any> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}
