/* ---------- Standard API Response Envelope ---------- */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: FieldError[];
  timestamp: string;
  status: number;
  path?: string;
}

export interface FieldError {
  field: string;
  message: string;
  code?: string;
  rejectedValue?: unknown;
}

/* ---------- Pagination ---------- */

export interface Pageable {
  page: number;
  size: number;
  sort?: string[];
}

export interface PageMetadata {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: PageMetadata;
}

/* ---------- Sorting ---------- */

export type SortDirection = 'asc' | 'desc';

export interface SortField {
  field: string;
  direction: SortDirection;
}

/* ---------- Filtering ---------- */

export interface FilterCriterion {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'between';
  value: unknown;
}

export interface FilterGroup {
  logic: 'and' | 'or';
  filters: FilterCriterion[];
}

/* ---------- Query State (for hooks) ---------- */

export interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isSuccess: boolean;
}

export interface MutationState {
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isSuccess: boolean;
  fieldErrors: FieldError[];
}

/* ---------- Request builders ---------- */

export function buildPageable(page: number, size: number, sort?: SortField[]): Pageable {
  const result: Pageable = { page, size };
  if (sort && sort.length > 0) {
    result.sort = sort.map((s) => `${s.field},${s.direction}`);
  }
  return result;
}

export function buildSearchParams(pageable: Pageable, search?: string, filter?: FilterGroup): Record<string, string> {
  const params: Record<string, string> = {
    page: String(pageable.page),
    size: String(pageable.size),
  };
  if (pageable.sort && pageable.sort.length > 0) {
    params.sort = pageable.sort.join(',');
  }
  if (search) params.search = search;
  if (filter) params.filter = JSON.stringify(filter);
  return params;
}

export const DEFAULT_PAGEABLE: Pageable = { page: 0, size: 20 };
